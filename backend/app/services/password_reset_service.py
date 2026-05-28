import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AppException, ValidationError
from app.core.security import hash_password, verify_password
from app.repositories.password_reset_repository import PasswordResetRepository
from app.repositories.user_repository import UserRepository
from app.services.email_service import send_password_reset_otp

GENERIC_RESET_MESSAGE = (
    "If an account exists for this email, a reset code has been sent."
)


class PasswordResetService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.reset_repo = PasswordResetRepository(db)

    @staticmethod
    def _generate_otp() -> str:
        return f"{secrets.randbelow(1_000_000):06d}"

    async def request_reset(self, email: str) -> dict:
        normalized = email.strip().lower()
        user = await self.user_repo.get_by_email(normalized)

        if user and user.is_active:
            otp = self._generate_otp()
            expires_at = datetime.now(timezone.utc) + timedelta(
                minutes=settings.otp_expire_minutes
            )

            await self.reset_repo.invalidate_pending(normalized)
            await self.reset_repo.create(
                email=normalized,
                otp_hash=hash_password(otp),
                expires_at=expires_at,
            )
            await self.db.commit()
            await send_password_reset_otp(normalized, otp)
        else:
            # Avoid leaking whether the email exists.
            await self.db.commit()

        return {"message": GENERIC_RESET_MESSAGE}

    async def reset_password(self, email: str, otp: str, new_password: str) -> dict:
        normalized = email.strip().lower()
        otp_value = otp.strip()

        if not otp_value.isdigit() or len(otp_value) != 6:
            raise ValidationError("Enter the 6-digit code from your email")

        user = await self.user_repo.get_by_email(normalized)
        if not user or not user.is_active:
            raise AppException(
                status_code=400,
                message="Invalid or expired reset code",
                error_code="INVALID_RESET_CODE",
            )

        row = await self.reset_repo.get_latest_valid(normalized)
        if not row or not verify_password(otp_value, row.otp_hash):
            raise AppException(
                status_code=400,
                message="Invalid or expired reset code",
                error_code="INVALID_RESET_CODE",
            )

        user.hashed_password = hash_password(new_password)
        await self.reset_repo.mark_used(row)
        await self.db.commit()

        return {"message": "Password updated. You can sign in with your new password."}
