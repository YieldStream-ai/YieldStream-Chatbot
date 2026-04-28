from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: str = Field(
        ..., description="Browser-generated UUID (from sessionStorage) to track the conversation"
    )
    message: str = Field(
        ..., min_length=1, max_length=4000, description="The user's message"
    )


class WidgetConfigResponse(BaseModel):
    welcome_message: str
    theme_color: str
    widget_styling: dict = Field(default_factory=dict)


class ChatDoneEvent(BaseModel):
    conversation_id: str
    message_id: str
    token_count: int | None = None
