import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import Base, engine
from app.api.v1.router import v1_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up …")
    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))          # verify DB reachable
        await conn.run_sync(Base.metadata.create_all) # create tables (no Alembic)
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


app = create_app()

@app.get("/health", include_in_schema=False)
async def liveness():
    return {"status": "ok"}