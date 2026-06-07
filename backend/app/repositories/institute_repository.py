# repositories/institute_repository.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from app.models.institute import Institute
from app.models.student import Student


class InstituteRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str):
        result = await self.db.execute(
            select(Institute).where(Institute.email == email)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, institute_id: int) -> Institute | None:
        result = await self.db.execute(
            select(Institute).where(Institute.id == institute_id)
        )
        return result.scalar_one_or_none()

    async def create(self, institute: Institute):
        self.db.add(institute)
        await self.db.commit()
        await self.db.refresh(institute)
        return institute

    async def update(self, institute: Institute) -> Institute:
        await self.db.commit()
        await self.db.refresh(institute)
        return institute

    async def list_all(self, status: str | None = None) -> list[Institute]:
        stmt = select(Institute).order_by(Institute.created_at.desc())
        if status:
            stmt = stmt.where(Institute.status == status)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_paginated(
        self,
        status: str | None,
        page: int,
        page_size: int,
    ) -> tuple[list[Institute], int]:
        stmt = select(Institute).order_by(Institute.created_at.desc())
        if status:
            stmt = stmt.where(Institute.status == status)

        count_result = await self.db.execute(
            select(func.count()).select_from(stmt.subquery())
        )
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        result = await self.db.execute(stmt.offset(offset).limit(page_size))
        return list(result.scalars().all()), total

    async def count_by_status(self) -> dict[str, int]:
        result = await self.db.execute(
            select(Institute.status, func.count(Institute.id)).group_by(Institute.status)
        )
        return {status: count for status, count in result.all()}

    async def total_students_all(self) -> int:
        result = await self.db.execute(
            select(func.count(Student.id)).where(
                Student.is_deleted == False,
                Student.is_active == True,
            )
        )
        return result.scalar() or 0

    async def student_counts_per_institute(self) -> dict[int, int]:
        result = await self.db.execute(
            select(Student.institute_id, func.count(Student.id))
            .where(Student.is_deleted == False, Student.is_active == True)
            .group_by(Student.institute_id)
        )
        return {institute_id: count for institute_id, count in result.all()}
