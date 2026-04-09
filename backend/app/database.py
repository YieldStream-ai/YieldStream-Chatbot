from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# The engine is the connection pool. It manages a pool of database connections
# so we don't open/close a new connection for every single query.
# echo=True logs all SQL statements — helpful for debugging, disable in prod.
engine = create_async_engine(
    settings.database_url,
    echo=(settings.environment == "development"),
)

# Session factory — creates new database sessions.
# expire_on_commit=False means objects stay usable after commit
# (otherwise SQLAlchemy would require another DB hit to read their attributes).
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
