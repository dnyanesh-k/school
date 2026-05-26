"""
JWT auth + RBAC — single place to read and debug.

PUBLIC (no token):
  POST /auth/register
  POST /auth/login

JWT required (get_current_user):
  GET /auth/me

Platform admin only (require_platform_admin):
  GET/PATCH /admin/*

Institute staff (require_institute_user — institute_admin + teacher):
  /students, /classes, /subjects, /tests, /fees, /attendance, …

Request flow:
  Authorization: Bearer <jwt>
    -> decode token (user_id, role, institute_id)
    -> load User from DB
    -> RBAC role check
    -> institute status check (pending / suspended blocked)
"""

from typing import Annotated

from fastapi import Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AppException, ForbiddenError
from app.core.roles import InstituteStatus, Role
from app.db.session import get_db
from app.models.user import User
from app.repositories.institute_repository import InstituteRepository
from app.repositories.user_repository import UserRepository

# auto_error=False → missing token returns 401 (not FastAPI default 403)
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="Not authenticated",
            error_code="NOT_AUTHENTICATED",
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
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

    user = await UserRepository(db).get_by_id(user_id)
    if not user:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message="User not found",
            error_code="USER_NOT_FOUND",
        )

    if not user.is_active:
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            message="User account disabled",
            error_code="USER_DISABLED",
        )

    return user


def require_roles(*roles: Role):
    allowed = {role.value for role in roles}

    async def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed:
            raise ForbiddenError("You do not have permission to perform this action")
        return current_user

    return checker


require_platform_admin = require_roles(Role.PLATFORM_ADMIN)


async def require_institute_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    if current_user.role == Role.PLATFORM_ADMIN.value:
        raise ForbiddenError("Platform admin cannot access institute data here")

    if current_user.role not in {Role.INSTITUTE_ADMIN.value, Role.TEACHER.value}:
        raise ForbiddenError("You do not have permission to perform this action")

    if not current_user.institute_id:
        raise ForbiddenError("No institute linked to this account")

    institute = await InstituteRepository(db).get_by_id(current_user.institute_id)
    if not institute:
        raise ForbiddenError("Institute not found")

    if institute.status == InstituteStatus.PENDING.value:
        raise ForbiddenError("Your institute registration is pending approval")
    if institute.status == InstituteStatus.REJECTED.value:
        raise ForbiddenError("Your institute registration was rejected")
    if institute.status == InstituteStatus.SUSPENDED.value:
        raise ForbiddenError("Your institute account is suspended")

    current_user.institute = institute
    return current_user


# Shorthand types for route signatures (optional but readable)
CurrentUser = Annotated[User, Depends(get_current_user)]
PlatformAdmin = Annotated[User, Depends(require_platform_admin)]
InstituteUser = Annotated[User, Depends(require_institute_user)]
