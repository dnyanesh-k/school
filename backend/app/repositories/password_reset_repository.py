from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.password_reset_otp import PasswordResetOtp


class PasswordResetRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def invalidate_pending(self, email: str) -> None:
        await self.db.execute(
            update(PasswordResetOtp)
            .where(
                PasswordResetOtp.email == email,
                PasswordResetOtp.used == False,
            )
            .values(used=True)
        )

    async def create(self, email: str, otp_hash: str, expires_at: datetime) -> PasswordResetOtp:
        row = PasswordResetOtp(
            email=email,
            otp_hash=otp_hash,
            expires_at=expires_at,
        )
        self.db.add(row)
        await self.db.flush()
        return row

    async def get_latest_valid(self, email: str) -> PasswordResetOtp | None:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(PasswordResetOtp)
            .where(
                PasswordResetOtp.email == email,
                PasswordResetOtp.used == False,
                PasswordResetOtp.expires_at > now,
            )
            .order_by(PasswordResetOtp.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def mark_used(self, row: PasswordResetOtp) -> None:
        row.used = True
        await self.db.flush()
