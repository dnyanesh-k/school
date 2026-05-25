from fastapi import Depends, status

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from jose import JWTError, jwt

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.core.exceptions import AppException
from app.models.user import User

# ─── JWT Config ──────────────────────────────────────────────────────

SECRET_KEY = "qjbhdfqugfowehfvbewjhfvewuoyfqhdoqhurrhfvjewhbvjnweb"
ALGORITHM = "HS256"

security = HTTPBearer()

# ─── Dependency ──────────────────────────────────────────────────────


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("user_id")

        if not user_id:

            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid token",
                error_code="INVALID_TOKEN",
            )

    except JWTError:

        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Invalid token",
            error_code="INVALID_TOKEN",
        )

    user_repo = UserRepository(db)

    user = await user_repo.get_by_id(user_id)

    if not user:

        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="User not found",
            error_code="USER_NOT_FOUND",
        )

    return user