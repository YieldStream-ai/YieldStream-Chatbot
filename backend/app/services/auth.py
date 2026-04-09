"""
Authentication service — two auth mechanisms for two audiences:

1. API Key auth (widget → backend):
   - Widget sends X-API-Key header on every request
   - We SHA-256 hash it and look up the hash in the api_keys table
   - Returns the associated Client with its system prompt, CORS origins, etc.

2. JWT auth (dashboard → backend):
   - Admin logs in with email/password, gets a JWT token
   - Dashboard sends Authorization: Bearer <token> on every request
   - JWT contains the admin email, expires after 1 hour

Why SHA-256 for API keys instead of bcrypt?
   - API keys are random 32-char hex strings (high entropy)
   - bcrypt is intentionally slow (~100ms) — great for passwords, bad for per-request auth
   - SHA-256 is fast and secure enough for high-entropy secrets
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.config import settings
from app.models.api_key import APIKey
from app.models.client import Client

# API key format: "ck_live_" prefix + 32 hex chars
API_KEY_PREFIX = "ck_live_"


def generate_api_key() -> str:
    """Generate a new API key. The raw key is shown once, then only the hash is stored."""
    return API_KEY_PREFIX + secrets.token_hex(32)


def hash_api_key(raw_key: str) -> str:
    """SHA-256 hash an API key for storage."""
    return hashlib.sha256(raw_key.encode()).hexdigest()


async def validate_api_key(raw_key: str, db: AsyncSession) -> Client | None:
    """
    Look up an API key and return the associated Client.

    Returns None if the key is invalid or inactive.
    """
    key_hash = hash_api_key(raw_key)
    result = await db.execute(
        select(APIKey)
        .options(joinedload(APIKey.client))
        .where(APIKey.key_hash == key_hash, APIKey.is_active == True)
    )
    api_key = result.scalar_one_or_none()

    if api_key is None:
        return None

    if not api_key.client.is_active:
        return None

    return api_key.client


def hash_password(password: str) -> str:
    """Bcrypt hash a password for admin account storage."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(email: str, expires_delta: timedelta = timedelta(hours=1)) -> str:
    """
    Create a JWT token for dashboard authentication.

    The token contains:
    - sub: the admin's email
    - exp: expiration timestamp
    - iat: issued-at timestamp

    It's signed with SECRET_KEY — if that key changes, all tokens become invalid.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": email,
        "exp": now + expires_delta,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> dict | None:
    """Decode and validate a JWT token. Returns the payload or None if invalid/expired."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
