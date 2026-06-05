"""
Alembic env.py — async SQLAlchemy setup.

How it works:
  - Reads DATABASE_URL from app.core.config (picks up .env automatically).
  - Imports app.models so autogenerate can detect all tables.
  - Uses AsyncEngine.connect() + run_sync() to run migrations in async context.

Commands:
  Generate a new migration (autogenerate from model changes):
    alembic revision --autogenerate -m "describe what changed"

  Apply all pending migrations:
    alembic upgrade head

  Roll back one step:
    alembic downgrade -1

  Show current revision:
    alembic current
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# ── Load app config & models ──────────────────────────────────────────────────
from app.core.config import settings
from app.db.session import Base

# Import every model module so their tables are registered with Base.metadata.
# If you add a new model file, add it here too.
import app.models  # noqa: F401  (registers all models via __init__.py)

# ── Alembic config object ─────────────────────────────────────────────────────
config = context.config

# Interpret the config file for Python logging (if present).
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Feed our target metadata so autogenerate can diff against the DB.
target_metadata = Base.metadata


# ── Offline mode (generates SQL script, no DB connection) ────────────────────
def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online mode (connects to DB and runs migrations) ─────────────────────────
def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,       # detect column type changes
        compare_server_default=True,  # detect default value changes
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(settings.database_url, echo=False)
    async with engine.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await engine.dispose()


# ── Entry point ───────────────────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
