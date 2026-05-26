from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryOut
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryOut)
async def get_dashboard_summary(
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = DashboardService(db)
    return await service.get_summary(institute_id_of(current_user))
