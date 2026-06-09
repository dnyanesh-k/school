from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.soft_delete import soft_delete
from app.models.admission import Admission


class AdmissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _base_stmt(self, institute_id: int):
        return (
            select(Admission)
            .options(selectinload(Admission.class_))
            .where(
                Admission.institute_id == institute_id,
                Admission.is_deleted == False,
            )
        )

    async def create(self, admission: Admission) -> Admission:
        self.db.add(admission)
        await self.db.commit()
        await self.db.refresh(admission)
        await self.db.refresh(admission, attribute_names=["class_"])
        return admission

    async def get_by_id(self, admission_id: int, institute_id: int) -> Admission | None:
        result = await self.db.execute(
            self._base_stmt(institute_id).where(Admission.id == admission_id)
        )
        return result.scalars().first()

    async def list_paginated(
        self,
        institute_id: int,
        status: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Admission], int]:
        base = self._base_stmt(institute_id)
        if status:
            base = base.where(Admission.status == status)

        count_result = await self.db.execute(
            select(func.count()).select_from(base.subquery())
        )
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        result = await self.db.execute(
            base.order_by(Admission.created_at.desc()).offset(offset).limit(page_size)
        )
        return list(result.scalars().all()), total

    async def count_pending(self, institute_id: int) -> int:
        """Count inquiry + follow_up admissions (not yet admitted/rejected)."""
        result = await self.db.execute(
            select(func.count(Admission.id)).where(
                Admission.institute_id == institute_id,
                Admission.is_deleted == False,
                Admission.status.in_(["inquiry", "follow_up"]),
            )
        )
        return result.scalar() or 0

    async def update(self, admission: Admission) -> Admission:
        await self.db.commit()
        await self.db.refresh(admission)
        await self.db.refresh(admission, attribute_names=["class_"])
        return admission

    async def delete(self, admission: Admission) -> None:
        await soft_delete(self.db, admission)
