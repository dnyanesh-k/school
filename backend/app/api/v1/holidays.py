from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.holiday import HolidayCreate, HolidayOut
from app.services.attendance_service import HolidayService

router = APIRouter(prefix="/holidays", tags=["holidays"])


@router.post("", response_model=HolidayOut, status_code=status.HTTP_201_CREATED)
async def create_holiday(
    payload: HolidayCreate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = HolidayService(db)
    return await service.create(payload, institute_id_of(current_user))


@router.get("", response_model=list[HolidayOut])
async def list_holidays(
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = HolidayService(db)
    return await service.list_all(institute_id_of(current_user))
