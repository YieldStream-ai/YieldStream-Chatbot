import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Client(Base):
    """
    A client is an organization/site that embeds the chat widget.
    Each client gets their own system prompt, theme, allowed origins, and API keys.

    Think of it like a "tenant" in a multi-tenant app — Acme Corp is one client,
    Beta Inc is another, and each sees only their own config and conversations.
    """

    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    # Allowed origins for CORS — which domains can embed this client's widget.
    # Stored as comma-separated string for SQLite compatibility.
    # Example: "https://acme.com,https://staging.acme.com"
    allowed_origins: Mapped[str] = mapped_column(Text, default="")

    # The system prompt is the secret sauce — it tells Gemini how to behave.
    # This NEVER gets sent to the frontend. It's injected server-side only.
    system_prompt: Mapped[str] = mapped_column(
        Text, default="You are a helpful assistant."
    )

    welcome_message: Mapped[str] = mapped_column(
        String(500), default="Hi! How can I help you today?"
    )
    theme_color: Mapped[str] = mapped_column(String(7), default="#4F46E5")

    # Full widget styling as JSON — design tokens for colors, typography, shape, layout, motion
    widget_styling: Mapped[str] = mapped_column(Text, default="{}")

    # Max tokens per AI response — caps cost and response length
    max_tokens: Mapped[int] = mapped_column(Integer, default=1024)

    # Which Gemini model to use — lets you upgrade per-client without redeploying
    model_name: Mapped[str] = mapped_column(String(100), default="gemini-2.0-flash")

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships — lets you do client.api_keys to get all keys for this client
    api_keys = relationship("APIKey", back_populates="client", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="client", cascade="all, delete-orphan")

    def get_origins_list(self) -> list[str]:
        """Parse the comma-separated origins string into a list."""
        if not self.allowed_origins:
            return []
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
