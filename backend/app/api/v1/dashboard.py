from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.roles import Role
from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import AsyncSessionLocal, get_db
from app.models.institute import Institute
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryOut
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


async def _record_dashboard_access(institute_id: int) -> None:
    async with AsyncSessionLocal() as db:
        await db.execute(
            update(Institute)
            .where(Institute.id == institute_id)
            .values(last_dashboard_access=datetime.now(timezone.utc))
        )
        await db.commit()


@router.get("/summary", response_model=DashboardSummaryOut)
async def get_dashboard_summary(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = DashboardService(db)
    include_fees = current_user.role == Role.INSTITUTE_ADMIN.value
    result = await service.get_summary(institute_id_of(current_user), include_fees=include_fees)
    background_tasks.add_task(_record_dashboard_access, institute_id_of(current_user))
    return result
