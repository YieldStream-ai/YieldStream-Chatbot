from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.client import Client
from app.services.auth import decode_access_token, hash_api_key, validate_api_key
from app.services.rate_limiter import rate_limiter


async def get_client_from_api_key(
    x_api_key: str = Header(..., description="API key for widget authentication"),
    db: AsyncSession = Depends(get_db),
) -> Client:

    client = await validate_api_key(x_api_key, db)
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key",
        )

    # Check rate limits using the key hash as identifier
    key_hash = hash_api_key(x_api_key)
    # Find the API key record to get its specific rate limits
    from sqlalchemy import select
    from app.models.api_key import APIKey

    result = await db.execute(
        select(APIKey).where(APIKey.key_hash == key_hash)
    )
    api_key_record = result.scalar_one()

    rate_result = await rate_limiter.check_and_increment(
        key_hash, api_key_record.rate_limit_rpm, api_key_record.rate_limit_rpd
    )
    if not rate_result.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {rate_result.retry_after}s.",
            headers={"Retry-After": str(rate_result.retry_after)},
        )

    return client


async def get_current_admin(
    authorization: str = Header(..., description="Bearer <JWT token>"),
) -> dict:
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )

    token = authorization[7:]  # Strip "Bearer "
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return payload
