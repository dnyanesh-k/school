from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.core.security import create_access_token
from app.db.session import get_db
from app.schemas.auth import (
    CreateTeacherRequest,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    UserOut,
)
from app.services.auth_service import AuthService, to_user_out

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
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": to_user_out(user),
    }


@router.get("/me", response_model=UserOut, status_code=status.HTTP_200_OK)
async def me(current_user: CurrentUser):
    return to_user_out(current_user)
