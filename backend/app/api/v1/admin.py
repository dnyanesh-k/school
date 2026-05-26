from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import PlatformAdmin
from app.db.session import get_db
from app.schemas.admin import InstituteOut, InstituteStatusUpdate, InstituteStatusUpdateResponse
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/institutes", response_model=PaginatedResponse[InstituteOut])
async def list_institutes(
    status: str | None = Query(None, description="Filter by institute status"),
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    _: PlatformAdmin,
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
