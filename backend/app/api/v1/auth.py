from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import RegisterRequest, UserOut, LoginResponse, LoginRequest
from app.services.auth_service import AuthService
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    print(payload)
    return await service.register(payload)

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    user = await service.login(payload)
    print(user)
    access_token = create_access_token(data={
            "sub": user.email,
            "user_id": user.id,
            "institute_id": user.institute_id,
            "role": "admin" if user.is_admin else "staff",
        })
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user 
    }

@router.get("/me", response_model=UserOut, status_code = status.HTTP_200_OK)
async def me(
    current_user: User = Depends(get_current_user)
):
    return current_user    
  