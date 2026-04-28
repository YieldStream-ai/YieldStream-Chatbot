import json
import logging

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
from app.schemas.widget_styling import WidgetStyling
from app.services.gemini import gemini_service
from app.utils.sanitize import sanitize_message, sanitize_session_id

logger = logging.getLogger(__name__)

# Cap conversation history sent to Gemini to control cost and context window usage.
# 50 messages ≈ 25 back-and-forth exchanges — enough context for most conversations.
MAX_HISTORY_MESSAGES = 50

router = APIRouter()


@router.post("/widget/config")
async def get_widget_config(
    client: Client = Depends(get_client_from_api_key),
) -> WidgetConfigResponse:
    styling = WidgetStyling.from_dict_safe(client.widget_styling)
    return WidgetConfigResponse(
        welcome_message=client.welcome_message,
        theme_color=client.theme_color,
        widget_styling=styling.model_dump(),
    )


@router.post("/chat")
async def chat(
    request: ChatRequest,
    client: Client = Depends(get_client_from_api_key),
    db: AsyncSession = Depends(get_db),
):
    # Sanitize inputs
    clean_message = sanitize_message(request.message)
    clean_session_id = sanitize_session_id(request.session_id)

    if not clean_message:
        return StreamingResponse(
            iter([f'event: error\ndata: {json.dumps({"code": "invalid_input", "message": "Message is empty"})}\n\n']),
            media_type="text/event-stream",
        )

    # 1. Find or create conversation
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(
            Conversation.client_id == client.id,
            Conversation.session_id == clean_session_id,
        )
    )
    conversation = result.scalar_one_or_none()

    if conversation is None:
        conversation = Conversation(
            client_id=client.id,
            session_id=clean_session_id,
        )
        db.add(conversation)
        await db.flush()

    # 2. Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=clean_message,
    )
    db.add(user_message)
    await db.commit()

    # Reload with messages
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation.id)
    )
    conversation = result.scalar_one()

    # 3. Build message history (capped to prevent runaway costs)
    sorted_messages = sorted(conversation.messages, key=lambda m: m.created_at)
    recent_messages = sorted_messages[-MAX_HISTORY_MESSAGES:]
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in recent_messages
    ]

    logger.info(
        "chat_request",
        extra={
            "client_id": client.id,
            "client_slug": client.slug,
            "session_id": clean_session_id,
            "message_count": len(messages),
        },
    )

    # 4. Stream response
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
                yield f"event: token\ndata: {json.dumps({'content': chunk})}\n\n"

            # Save assistant response
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=full_response,
            )
            db.add(assistant_message)
            await db.commit()
            await db.refresh(assistant_message)

            done_data = ChatDoneEvent(
                conversation_id=conversation.id,
                message_id=assistant_message.id,
            )
            yield f"event: done\ndata: {done_data.model_dump_json()}\n\n"

            logger.info(
                "chat_response",
                extra={
                    "client_id": client.id,
                    "conversation_id": conversation.id,
                    "response_length": len(full_response),
                },
            )

        except RuntimeError as e:
            # Gemini API key not configured
            logger.error("gemini_config_error", extra={"error": str(e)})
            yield f'event: error\ndata: {json.dumps({"code": "service_unavailable", "message": "AI service is not configured"})}\n\n'

        except Exception as e:
            error_name = type(e).__name__
            logger.error(
                "gemini_stream_error",
                extra={"error": str(e), "error_type": error_name, "client_id": client.id},
            )

            # User-friendly messages based on error type
            if "quota" in str(e).lower() or "429" in str(e):
                user_message = "AI service is temporarily busy. Please try again in a moment."
                code = "quota_exceeded"
            elif "timeout" in str(e).lower():
                user_message = "Response timed out. Please try a shorter message."
                code = "timeout"
            else:
                user_message = "Something went wrong. Please try again."
                code = "internal_error"

            yield f'event: error\ndata: {json.dumps({"code": code, "message": user_message})}\n\n'

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
