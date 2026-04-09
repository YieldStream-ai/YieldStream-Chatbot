"""
Alembic migration environment — configured for async SQLAlchemy.

Alembic is a database migration tool. When you change a model (add a column,
rename a table, etc.), you run `alembic revision --autogenerate -m "description"`
and it generates a Python script that applies that change. Then `alembic upgrade head`
runs all pending migrations.

This env.py file tells Alembic:
1. Where to find the database (from our Settings)
2. What models exist (from our Base.metadata)
3. How to run migrations in async mode
"""
import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.config import settings
from app.database import Base

# Import all models so Alembic can detect their tables
import app.models  # noqa: F401

config = context.config

# Override the sqlalchemy.url from alembic.ini with our actual database URL
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is what Alembic compares against to detect schema changes
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations without a live database connection (generates SQL only)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations with an async engine — required for asyncpg/aiosqlite."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
