from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subject import Subject


class SubjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, subject: Subject) -> Subject:
        self.db.add(subject)
        await self.db.commit()
        await self.db.refresh(subject)
        return subject

    async def list_by_class(self, class_id: int) -> list[Subject]:
        result = await self.db.execute(select(Subject).where(Subject.class_id == class_id))
        return result.scalars().all()

    async def get_by_id(self, subject_id: int) -> Subject | None:
        return await self.db.get(Subject, subject_id)

    async def get_by_name_and_class(self, name: str, class_id: int) -> Subject | None:
        result = await self.db.execute(
            select(Subject).where(Subject.name == name, Subject.class_id == class_id)
        )
        return result.scalars().first()

    async def update(self, subject: Subject) -> Subject:
        await self.db.commit()
        await self.db.refresh(subject)
        return subject

    async def delete(self, subject: Subject) -> None:
        await self.db.delete(subject)
        await self.db.commit()
