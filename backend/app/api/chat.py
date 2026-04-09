import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_client_from_api_key
from app.database import get_db
from app.models.client import Client
from app.models.conversation import Conversation, Message
from app.schemas.chat import ChatDoneEvent, ChatRequest, WidgetConfigResponse
from app.services.gemini import gemini_service

router = APIRouter()


@router.post("/widget/config")
async def get_widget_config(
    client: Client = Depends(get_client_from_api_key),
) -> WidgetConfigResponse:
    """
    Returns widget display config. Called once when the widget loads.
    Intentionally does NOT return the system_prompt — that stays server-side.
    """
    return WidgetConfigResponse(
        welcome_message=client.welcome_message,
        theme_color=client.theme_color,
    )


@router.post("/chat")
async def chat(
    request: ChatRequest,
    client: Client = Depends(get_client_from_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message and receive a streamed AI response.

    The response is an SSE stream with these event types:
    - "token": a chunk of the AI's response text
    - "done": the response is complete (includes message ID and token count)
    - "error": something went wrong
    """
    # 1. Find or create the conversation for the session
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.client_id == client.id,
            Conversation.session_id == request.session_id,
        )
    )
    conversation = result.scalar_one_or_none()

    if conversation is None:
        conversation = Conversation(
            client_id=client.id,
            session_id=request.session_id,
        )
        db.add(conversation)
        await db.flush()  # Get the ID without committing

    # 2. Save the user's message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    await db.commit()

    # Reload conversation with all messages
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation.id)
    )
    conversation = result.scalar_one()

    # 3. Build message history for Gemini
    # We send the full conversation so Gemini can understand context
    # (e.g., "what about the second one?" only makes sense with prior messages)
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in sorted(conversation.messages, key=lambda m: m.created_at)
    ]

    # 4. Stream the response
    async def event_stream():
        full_response = ""
        try:
            async for chunk in gemini_service.stream_response(
                messages=messages,
                system_prompt=client.system_prompt,
                model_name=client.model_name,
                max_tokens=client.max_tokens,
            ):
                full_response += chunk
                # SSE format: "event: <type>\ndata: <json>\n\n"
                yield f"event: token\ndata: {json.dumps({'content': chunk})}\n\n"

            # Save the assistant's response to the database
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
            )
            db.add(assistant_message)
            await db.commit()
            await db.refresh(assistant_message)

            # Send the "done" event with metadata
            done_data = ChatDoneEvent(
                conversation_id=conversation.id,
                message_id=assistant_message.id,
            )
            yield f"event: done\ndata: {done_data.model_dump_json()}\n\n"

        except Exception as e:
            error_data = {"code": "internal_error", "message": str(e)}
            yield f"event: error\ndata: {json.dumps(error_data)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Tells nginx not to buffer the stream
        },
    )
