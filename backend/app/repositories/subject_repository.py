from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.soft_delete import soft_delete
from app.models.class_ import Class
from app.models.subject import Subject


class SubjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, subject: Subject) -> Subject:
        self.db.add(subject)
        await self.db.commit()
        await self.db.refresh(subject)
        return subject

    async def list_by_class(self, class_id: int, institute_id: int) -> list[Subject]:
        result = await self.db.execute(
            select(Subject)
            .join(Class, Subject.class_id == Class.id)
            .where(
                Subject.class_id == class_id,
                Class.institute_id == institute_id,
                Class.is_deleted == False,
                Subject.is_deleted == False,
            )
        )
        return list(result.scalars().all())

    async def get_by_id(self, subject_id: int) -> Subject | None:
        result = await self.db.execute(
            select(Subject).where(
                Subject.id == subject_id,
                Subject.is_deleted == False,
            )
        )
        return result.scalars().first()

    async def get_by_id_for_institute(self, subject_id: int, institute_id: int) -> Subject | None:
        result = await self.db.execute(
            select(Subject)
            .join(Class, Subject.class_id == Class.id)
            .where(
                Subject.id == subject_id,
                Class.institute_id == institute_id,
                Subject.is_deleted == False,
            )
        )
        return result.scalars().first()

    async def get_by_name_and_class(self, name: str, class_id: int) -> Subject | None:
        result = await self.db.execute(
            select(Subject).where(
                Subject.name == name,
                Subject.class_id == class_id,
                Subject.is_deleted == False,
            )
        )
        return result.scalars().first()

    async def delete(self, subject: Subject) -> None:
        await soft_delete(self.db, subject)

    async def update(self, subject: Subject) -> Subject:
        await self.db.commit()
        await self.db.refresh(subject)
        return subject
