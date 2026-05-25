import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import Base, engine
from app.api.v1.router import v1_router
from app.core.handlers import register_exception_handlers

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up …")
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))
        # 1. ADD THIS LINE: Force drop old tables to wipe the old schema
        logger.info("Dropping all existing tables...")
        # verify DB reachable
        # await conn.run_sync(Base.metadata.drop_all)
        # create tables (no Alembic)
        # await conn.run_sync(Base.metadata.create_all)
    logger.info("Database ready.")
    yield
    logger.info("Shutting down …")
    await engine.dispose()
    logger.info("Done.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(v1_router, prefix="/api/v1")

    return app

# Use this block instead


async def reset_database():
    async with engine.begin() as conn:
        # 1. Drop all tables (Wipes existing data)
        await conn.run_sync(Base.metadata.drop_all)

        # 2. Create all tables with the new schema
        await conn.run_sync(Base.metadata.create_all)

app = create_app()

register_exception_handlers(app)

@app.get("/health", include_in_schema=False)
async def liveness():
    return {"status": "ok"}
