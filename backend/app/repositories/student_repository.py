from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.soft_delete import soft_delete
from app.models.class_ import Class
from app.models.student import Student


class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _base_stmt(self, institute_id: int, class_id: int | None = None, search: str | None = None):
        stmt = (
            select(Student)
            .options(selectinload(Student.class_))
            .where(
                Student.institute_id == institute_id,
                Student.is_deleted == False,
            )
        )
        if class_id is not None:
            stmt = stmt.where(Student.class_id == class_id)
        if search:
            term = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    Student.roll_number.ilike(term),
                    Student.full_name.ilike(term),
                )
            )
        return stmt

    async def create(self, student: Student) -> Student:
        self.db.add(student)
        await self.db.commit()
        await self.db.refresh(student)
        await self.db.refresh(student, attribute_names=["class_"])
        return student

    async def list_all(self, institute_id: int, class_id: int | None = None) -> list[Student]:
        stmt = self._base_stmt(institute_id, class_id=class_id).order_by(Student.full_name)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_paginated(
        self,
        institute_id: int,
        class_id: int | None,
        page: int,
        page_size: int,
        search: str | None = None,
    ) -> tuple[list[Student], int]:
        base = self._base_stmt(institute_id, class_id=class_id, search=search)

        count_result = await self.db.execute(
            select(func.count()).select_from(base.subquery())
        )
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        result = await self.db.execute(
            base.order_by(Student.full_name).offset(offset).limit(page_size)
        )
        return list(result.scalars().all()), total

    async def list_by_class(self, institute_id: int, class_id: int) -> list[Student]:
        return await self.list_all(institute_id, class_id=class_id)

    async def get_by_id(self, student_id: int, institute_id: int) -> Student | None:
        result = await self.db.execute(
            select(Student)
            .options(selectinload(Student.class_))
            .where(
                Student.id == student_id,
                Student.institute_id == institute_id,
                Student.is_deleted == False,
            )
        )
        return result.scalars().first()

    async def get_by_roll_number(self, roll_number: str, institute_id: int) -> Student | None:
        result = await self.db.execute(
            select(Student)
            .options(selectinload(Student.class_))
            .where(
                Student.roll_number == roll_number,
                Student.institute_id == institute_id,
                Student.is_deleted == False,
            )
        )
        return result.scalars().first()

    async def get_count(self, institute_id: int) -> int:
        result = await self.db.execute(
            select(func.count(Student.id)).where(
                Student.institute_id == institute_id,
                Student.is_deleted == False,
            )
        )
        return result.scalar() or 0

    async def search_students(self, search_term: str, institute_id: int) -> list[Student]:
        stmt = self._base_stmt(institute_id).where(
            or_(
                Student.roll_number.ilike(search_term),
                Student.full_name.ilike(search_term),
            )
        )
        result = await self.db.execute(stmt.order_by(Student.full_name))
        return list(result.scalars().all())

    async def delete(self, student: Student) -> None:
        student.is_active = False
        await soft_delete(self.db, student)

    async def update(self, student: Student) -> Student:
        await self.db.commit()
        await self.db.refresh(student)
        await self.db.refresh(student, attribute_names=["class_"])
        return student
