from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_ import Class


class ClassRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, class_obj: Class) -> Class:
        self.db.add(class_obj)
        await self.db.commit()
        await self.db.refresh(class_obj)
        return class_obj

    async def list_all(self) -> list[Class]:
        result = await self.db.execute(select(Class).where(Class.is_deleted == False))
        return result.scalars().all()

    async def get_by_id(self, class_id: int) -> Class | None:
        result = await self.db.execute(
            select(Class).where(Class.id == class_id,
                                Class.is_deleted == False)
        )
        return result.scalars().first()

    async def get_by_name(self, name: str) -> Class | None:
        result = await self.db.execute(
            select(Class).where(Class.name == name, Class.is_deleted == False)
        )
        return result.scalars().first()

    async def delete(self, class_obj: Class) -> None:
        class_obj.is_deleted = True
        await self.db.commit()
        await self.db.refresh(class_obj)

    async def update(self, class_obj: Class) -> Class:
        await self.db.commit()
        await self.db.refresh(class_obj)
        return class_obj
