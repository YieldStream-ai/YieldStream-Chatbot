"""
Seed script — creates a test client and API key for local development.

Run with: python -m app.seed
"""
import asyncio

from sqlalchemy import select

from app.database import async_session
from app.models.api_key import APIKey
from app.models.client import Client
from app.services.auth import generate_api_key, hash_api_key


async def seed():
    async with async_session() as db:
        # Check if already seeded
        result = await db.execute(select(Client).where(Client.slug == "test-client"))
        if result.scalar_one_or_none():
            print("Already seeded. Skipping.")
            return

        # Create test client
        client = Client(
            name="Test Client",
            slug="test-client",
            allowed_origins="http://localhost:3000,http://localhost:5173,http://127.0.0.1:5500",
            system_prompt="You are a helpful customer support assistant. Be concise and friendly.",
            welcome_message="Hi there! How can I help you today?",
        )
        db.add(client)
        await db.flush()

        # Create API key
        raw_key = generate_api_key()
        api_key = APIKey(
            client_id=client.id,
            key_hash=hash_api_key(raw_key),
            key_prefix=raw_key[:12],
        )
        db.add(api_key)
        await db.commit()

        print("Seeded successfully!")
        print(f"  Client: {client.name} (id: {client.id})")
        print(f"  API Key: {raw_key}")
        print(f"  (Save this key — it won't be shown again)")


if __name__ == "__main__":
    asyncio.run(seed())
