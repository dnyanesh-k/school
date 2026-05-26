from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.fee import (
    DefaulterOut,
    FeePlanCreate,
    FeePlanCreateResponse,
    FeePlanOut,
    FeeSummaryListOut,
)
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse
from app.services.fee_service import FeeService

router = APIRouter(prefix="/fees", tags=["fees"])


@router.get("/summary", response_model=FeeSummaryListOut)
async def get_fee_summaries(
    class_id: int | None = None,
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = FeeService(db)
    return await service.get_summaries(
        institute_id_of(current_user),
        class_id,
        page=page,
        page_size=page_size,
    )


@router.post("/plan", response_model=FeePlanCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_fee_plan(
    payload: FeePlanCreate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = FeeService(db)
    return await service.create_plan(payload, institute_id_of(current_user))


@router.get("/plan/{student_id}", response_model=FeePlanOut)
async def get_fee_plan(
    student_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = FeeService(db)
    return await service.get_plan_by_student(student_id, institute_id_of(current_user))


@router.get("/defaulters", response_model=PaginatedResponse[DefaulterOut])
async def get_defaulters(
    class_id: int | None = None,
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = FeeService(db)
    return await service.get_defaulters_paginated(
        institute_id_of(current_user),
        class_id,
        page=page,
        page_size=page_size,
    )
