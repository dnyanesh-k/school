from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.admission import AdmissionConvertOut, AdmissionCreate, AdmissionOut, AdmissionUpdate
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse
from app.services.admission_service import AdmissionService

router = APIRouter(prefix="/admissions", tags=["admissions"])


@router.post("", response_model=AdmissionOut, status_code=status.HTTP_201_CREATED)
async def create_admission(
    payload: AdmissionCreate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdmissionService(db)
    return await service.create(payload, institute_id_of(current_user))


@router.get("", response_model=PaginatedResponse[AdmissionOut])
async def list_admissions(
    status: str | None = Query(None, description="Filter by status: inquiry|follow_up|admitted|rejected"),
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdmissionService(db)
    return await service.list_paginated(
        institute_id_of(current_user),
        status=status,
        page=page,
        page_size=page_size,
    )


@router.get("/pending-count")
async def pending_count(
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdmissionService(db)
    count = await service.count_pending(institute_id_of(current_user))
    return {"count": count}


@router.patch("/{admission_id}", response_model=AdmissionOut)
async def update_admission(
    admission_id: int,
    payload: AdmissionUpdate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdmissionService(db)
    return await service.update(admission_id, payload, institute_id_of(current_user))


@router.post("/{admission_id}/convert", response_model=AdmissionConvertOut)
async def convert_admission(
    admission_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    """Promote an admitted candidate to a Student record."""
    service = AdmissionService(db)
    return await service.convert_to_student(admission_id, institute_id_of(current_user))


@router.delete("/{admission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admission(
    admission_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdmissionService(db)
    await service.delete(admission_id, institute_id_of(current_user))
