from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import CreateTeacherRequest, UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/teachers", response_model=list[UserOut])
async def list_teachers(
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.list_teachers(current_user)


@router.post("/teachers", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    payload: CreateTeacherRequest,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    return await service.create_teacher(current_user, payload)
