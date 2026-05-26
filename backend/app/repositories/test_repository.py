from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.test import Test


class TestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, test_obj: Test) -> Test:
        self.db.add(test_obj)
        await self.db.commit()
        await self.db.refresh(test_obj)
        await self.db.refresh(test_obj, attribute_names=["subject", "class_"])
        return test_obj

    async def list_all(self) -> list[Test]:
        result = await self.db.execute(select(Test).options(selectinload(Test.subject), selectinload(Test.class_)))
        return result.scalars().all()

    async def get_by_id(self, test_id: int) -> Test | None:
        result = await self.db.execute(
            select(Test).options(selectinload(Test.subject),
                                 selectinload(Test.class_)).where(Test.id == test_id)
        )
        return result.scalars().first()

    async def delete(self, test_obj: Test) -> None:
        await self.db.delete(test_obj)
        await self.db.commit()
