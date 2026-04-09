"""
Shared test fixtures.

This sets up an in-memory SQLite database and a test client for each test.
Tests run against a fresh database every time — no leftover state between tests.
"""
import asyncio

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.models import Client, APIKey
from app.services.auth import generate_api_key, hash_api_key, create_access_token


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session():
    """Create a fresh in-memory database for each test."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    """HTTP test client with the DB dependency overridden."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_client_and_key(db_session: AsyncSession):
    """Create a test Client + API key in the DB. Returns (client_record, raw_api_key)."""
    client_record = Client(
        name="Test Client",
        slug="test",
        system_prompt="You are a test assistant.",
        allowed_origins="http://localhost",
    )
    db_session.add(client_record)
    await db_session.flush()

    raw_key = generate_api_key()
    api_key = APIKey(
        client_id=client_record.id,
        key_hash=hash_api_key(raw_key),
        key_prefix=raw_key[:12],
    )
    db_session.add(api_key)
    await db_session.commit()

    return client_record, raw_key


@pytest_asyncio.fixture
async def admin_token():
    """A valid JWT for dashboard endpoints."""
    return create_access_token("admin@example.com")
