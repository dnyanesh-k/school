from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import PlatformAdmin
from app.db.session import get_db
from app.schemas.admin import AdminStatsOut, IndependentStudentOut, InstituteOut, InstituteStatusUpdate, InstituteStatusUpdateResponse, StudentAccessUpdate
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse as PR
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsOut)
async def platform_stats(
    _: PlatformAdmin,
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.get_stats()


@router.get("/institutes", response_model=PaginatedResponse[InstituteOut])
async def list_institutes(
    _: PlatformAdmin,
    status: str | None = Query(None, description="Filter by institute status"),
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.list_institutes(status, page=page, page_size=page_size)


@router.patch("/institutes/{institute_id}/status", response_model=InstituteStatusUpdateResponse)
async def update_institute_status(
    institute_id: int,
    payload: InstituteStatusUpdate,
    _: PlatformAdmin,
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.update_institute_status(institute_id, payload)


@router.get("/students", response_model=PR[IndependentStudentOut])
async def list_students(
    _: PlatformAdmin,
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).list_independent_students(page=page, page_size=page_size)


@router.patch("/students/{user_id}/access", response_model=IndependentStudentOut)
async def toggle_student_access(
    user_id: int,
    payload: StudentAccessUpdate,
    _: PlatformAdmin,
    db: AsyncSession = Depends(get_db),
):
    return await AdminService(db).toggle_student_access(user_id, payload)
