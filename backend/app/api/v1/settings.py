from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.institute import Institute
from app.models.user import User
from app.schemas.settings import InstituteSettingsOut, InstituteSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/institute", response_model=InstituteSettingsOut)
async def get_institute_settings(
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Institute).where(Institute.id == institute_id_of(current_user))
    )
    institute = result.scalar_one()
    return InstituteSettingsOut(drive_url=institute.drive_url)


@router.patch("/institute", response_model=InstituteSettingsOut)
async def update_institute_settings(
    payload: InstituteSettingsUpdate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Institute).where(Institute.id == institute_id_of(current_user))
    )
    institute = result.scalar_one()

    if payload.drive_url is not None:
        url = payload.drive_url.strip()
        institute.drive_url = url if url else None
    else:
        institute.drive_url = None

    await db.commit()
    await db.refresh(institute)
    return InstituteSettingsOut(drive_url=institute.drive_url)
