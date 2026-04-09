import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Conversation(Base):
    """
    Groups messages into a chat session. The session_id comes from the browser
    (stored in sessionStorage) so each tab gets its own conversation.

    Conversations let us send chat history to Gemini so it has context
    for follow-up questions (e.g., "what about the second one?").
    """

    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    client_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clients.id", ondelete="CASCADE")
    )
    # Browser-generated UUID stored in sessionStorage — ties a browser tab to a conversation
    session_id: Mapped[str] = mapped_column(String(36), index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    client = relationship("Client", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """
    A single message in a conversation — either from the user or the assistant.
    We store these so Gemini gets conversation history for context.
    """

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("conversations.id", ondelete="CASCADE")
    )

    role: Mapped[str] = mapped_column(
        Enum("user", "assistant", name="message_role"), index=True
    )
    content: Mapped[str] = mapped_column(Text)

    # Track token usage per message for analytics and cost monitoring
    token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    conversation = relationship("Conversation", back_populates="messages")
