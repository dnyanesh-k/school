import asyncio
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError
from app.core.roles import InstituteStatus, Role
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.institute_repository import InstituteRepository
from app.repositories.user_repository import UserRepository
from app.schemas.admin import AdminStatsOut, InstituteOut, InstituteStatusUpdate, InstituteStatusUpdateResponse, InstituteAdminOut
from app.core.pagination import slice_page
from app.schemas.pagination import PaginatedResponse, build_paginated, DEFAULT_PAGE, DEFAULT_PAGE_SIZE


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.institute_repo = InstituteRepository(db)
        self.user_repo = UserRepository(db)
        self.attendance_repo = AttendanceRepository(db)

    def _build_institute_out(
        self,
        institute,
        users_by_institute: dict,
        student_count: int = 0,
        last_attendance_date=None,
    ) -> InstituteOut:
        users = users_by_institute.get(institute.id, [])
        admin = next(
            (user for user in users if user.role == Role.INSTITUTE_ADMIN.value),
            None,
        )
        return InstituteOut(
            id=institute.id,
            name=institute.name,
            email=institute.email,
            phone=institute.phone,
            address=institute.address,
            city=institute.city,
            institute_type=institute.institute_type,
            status=institute.status,
            created_at=institute.created_at,
            student_count=student_count,
            last_attendance_date=last_attendance_date,
            admin=InstituteAdminOut(
                id=admin.id,
                full_name=admin.full_name,
                email=admin.email,
            ) if admin else None,
        )

    async def list_institutes(
        self,
        status: str | None = None,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> PaginatedResponse[InstituteOut]:
        page, page_size, _ = slice_page(page, page_size)
        institutes, total = await self.institute_repo.list_paginated(status, page, page_size)
        institute_ids = [i.id for i in institutes]

        users_by_institute, student_counts, last_dates = await asyncio.gather(
            self.user_repo.list_by_institute_ids(institute_ids),
            self.institute_repo.student_counts_per_institute(),
            self.attendance_repo.last_attendance_date_per_institute(),
        )

        items = [
            self._build_institute_out(
                inst,
                users_by_institute,
                student_counts.get(inst.id, 0),
                last_dates.get(inst.id),
            )
            for inst in institutes
        ]
        return build_paginated(items, total, page, page_size)

    async def get_stats(self) -> AdminStatsOut:
        since_7_days = date.today() - timedelta(days=7)

        by_status, total_students, attendance_days = await asyncio.gather(
            self.institute_repo.count_by_status(),
            self.institute_repo.total_students_all(),
            self.attendance_repo.attendance_days_per_institute(since_7_days),
        )

        total = sum(by_status.values())
        institutes_used_this_week = sum(1 for v in attendance_days.values() if v > 0)

        return AdminStatsOut(
            total=total,
            pending=by_status.get("pending", 0),
            active=by_status.get("active", 0),
            rejected=by_status.get("rejected", 0),
            suspended=by_status.get("suspended", 0),
            total_students=total_students,
            institutes_used_this_week=institutes_used_this_week,
        )

    async def update_institute_status(
        self,
        institute_id: int,
        payload: InstituteStatusUpdate,
    ) -> InstituteStatusUpdateResponse:
        institute = await self.institute_repo.get_by_id(institute_id)
        if not institute:
            raise NotFoundError("Institute")

        new_status = payload.status

        if new_status == InstituteStatus.ACTIVE.value:
            if institute.status not in {
                InstituteStatus.PENDING.value,
                InstituteStatus.SUSPENDED.value,
            }:
                raise ValidationError("Only pending or suspended institutes can be activated")
            message = "Institute approved successfully"

        elif new_status == InstituteStatus.REJECTED.value:
            if institute.status != InstituteStatus.PENDING.value:
                raise ValidationError("Only pending institutes can be rejected")
            message = "Institute registration rejected"

        elif new_status == InstituteStatus.SUSPENDED.value:
            if institute.status != InstituteStatus.ACTIVE.value:
                raise ValidationError("Only active institutes can be suspended")
            message = "Institute suspended"

        else:
            raise ValidationError("Invalid status")

        institute.status = new_status
        updated = await self.institute_repo.update(institute)
        users_by_institute = await self.user_repo.list_by_institute_ids([updated.id])

        return InstituteStatusUpdateResponse(
            message=message,
            institute=self._build_institute_out(updated, users_by_institute),
        )
