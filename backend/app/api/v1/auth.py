from datetime import timedelta

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.schemas.auth import (
    CreateTeacherRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    UserOut,
)
from app.services.auth_service import AuthService, to_user_out
from app.services.password_reset_service import PasswordResetService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.register(payload)


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    user = await service.login(payload)

    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "institute_id": user.institute_id,
            "role": user.role,
        },
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": to_user_out(user),
    }


@router.get("/me", response_model=UserOut, status_code=status.HTTP_200_OK)
async def me(current_user: CurrentUser):
    return to_user_out(current_user)


@router.post("/forgot-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    service = PasswordResetService(db)
    return await service.request_reset(payload.email)


@router.post("/reset-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    service = PasswordResetService(db)
    return await service.reset_password(payload.email, payload.otp, payload.new_password)
