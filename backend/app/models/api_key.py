import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    client_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("clients.id", ondelete="CASCADE")
    )

    # SHA-256 hash of the full API key
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    # First 12 characters of the key, for display in the dashboard
    key_prefix: Mapped[str] = mapped_column(String(20))

    # Per-key rate limits — overrides can be set per key
    rate_limit_rpm: Mapped[int] = mapped_column(Integer, default=30)   # requests per minute
    rate_limit_rpd: Mapped[int] = mapped_column(Integer, default=1000) # requests per day

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    client = relationship("Client", back_populates="api_keys")
