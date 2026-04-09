"""
Client management endpoints — used by the dashboard to CRUD clients and API keys.

These are admin-only endpoints protected by JWT authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.api_key import APIKey
from app.models.client import Client
from app.schemas.client import (
    APIKeyCreateResponse,
    APIKeyResponse,
    ClientCreate,
    ClientResponse,
    ClientUpdate,
)
from app.services.auth import generate_api_key, hash_api_key

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/clients", response_model=list[ClientResponse])
async def list_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).order_by(Client.created_at.desc()))
    return result.scalars().all()


@router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(data: ClientCreate, db: AsyncSession = Depends(get_db)):
    # Check slug uniqueness
    existing = await db.execute(select(Client).where(Client.slug == data.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Slug already exists")

    client = Client(**data.model_dump())
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client(client_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.patch("/clients/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str, data: ClientUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Only update fields that were explicitly provided
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(client, field, value)

    await db.commit()
    await db.refresh(client)
    return client


@router.delete("/clients/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(client_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client).where(Client.id == client_id))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    await db.delete(client)
    await db.commit()


# --- API Key management ---


@router.get("/clients/{client_id}/api-keys", response_model=list[APIKeyResponse])
async def list_api_keys(client_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(APIKey).where(APIKey.client_id == client_id).order_by(APIKey.created_at.desc())
    )
    return result.scalars().all()


@router.post(
    "/clients/{client_id}/api-keys",
    response_model=APIKeyCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_api_key(client_id: str, db: AsyncSession = Depends(get_db)):
    """
    Generate a new API key for a client.
    The raw key is returned ONCE in the response — store it securely.
    """
    # Verify client exists
    result = await db.execute(select(Client).where(Client.id == client_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Client not found")

    raw_key = generate_api_key()
    api_key = APIKey(
        client_id=client_id,
        key_hash=hash_api_key(raw_key),
        key_prefix=raw_key[:12],
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)

    return APIKeyCreateResponse(
        id=api_key.id,
        raw_key=raw_key,
        key_prefix=api_key.key_prefix,
        rate_limit_rpm=api_key.rate_limit_rpm,
        rate_limit_rpd=api_key.rate_limit_rpd,
    )


@router.delete(
    "/clients/{client_id}/api-keys/{key_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def revoke_api_key(client_id: str, key_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.client_id == client_id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    await db.commit()
