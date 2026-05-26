import logging

from sqlalchemy import select

from app.core.config import settings
from app.core.roles import Role
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)


async def ensure_platform_admin() -> None:
    if not settings.platform_admin_email or not settings.platform_admin_password:
        logger.info("Platform admin seed skipped — PLATFORM_ADMIN_EMAIL/PASSWORD not set")
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == Role.PLATFORM_ADMIN.value, User.is_deleted == False)
        )
        existing = result.scalar_one_or_none()

        if existing:
            logger.info("Platform admin already exists")
            return

        email_taken = await db.execute(
            select(User).where(User.email == settings.platform_admin_email, User.is_deleted == False)
        )
        if email_taken.scalar_one_or_none():
            logger.warning("Platform admin email already used by another account")
            return

        admin = User(
            email=settings.platform_admin_email,
            full_name=settings.platform_admin_name,
            hashed_password=hash_password(settings.platform_admin_password),
            role=Role.PLATFORM_ADMIN.value,
            is_admin=True,
            institute_id=None,
        )
        db.add(admin)
        await db.commit()
        logger.info("Platform admin account created")
