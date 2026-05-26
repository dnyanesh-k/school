from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.attendance import (
    AbsentStreakOut,
    AttendanceMarkRequest,
    AttendanceMarkResponse,
    ClassAttendanceOut,
)
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("/class/{class_id}", response_model=ClassAttendanceOut)
async def get_class_attendance(
    class_id: int,
    attendance_date: date = Query(..., alias="date", description="Attendance date (YYYY-MM-DD)"),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AttendanceService(db)
    return await service.get_class_attendance(class_id, attendance_date, institute_id_of(current_user))


@router.post("/mark", response_model=AttendanceMarkResponse, status_code=status.HTTP_200_OK)
async def mark_attendance(
    payload: AttendanceMarkRequest,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AttendanceService(db)
    return await service.mark_attendance(payload, institute_id_of(current_user))


@router.get("/absent-streak", response_model=PaginatedResponse[AbsentStreakOut])
async def get_absent_streak(
    days: int = Query(2, ge=1, le=30, description="Minimum consecutive absent days"),
    class_id: int | None = Query(None, description="Filter by class"),
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = AttendanceService(db)
    return await service.get_absent_streak_paginated(
        institute_id_of(current_user),
        days,
        class_id=class_id,
        page=page,
        page_size=page_size,
    )
