from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.soft_delete import soft_delete
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

    async def list_all(self, institute_id: int) -> list[Test]:
        result = await self.db.execute(
            select(Test)
            .options(selectinload(Test.subject), selectinload(Test.class_))
            .where(Test.is_deleted == False, Test.institute_id == institute_id)
            .order_by(Test.scheduled_date.desc())
        )
        return list(result.scalars().all())

    async def list_paginated(
        self,
        institute_id: int,
        page: int,
        page_size: int,
    ) -> tuple[list[Test], int]:
        base = select(Test).where(
            Test.is_deleted == False,
            Test.institute_id == institute_id,
        )

        count_result = await self.db.execute(
            select(func.count()).select_from(base.subquery())
        )
        total = count_result.scalar() or 0

        offset = (page - 1) * page_size
        result = await self.db.execute(
            select(Test)
            .options(selectinload(Test.subject), selectinload(Test.class_))
            .where(Test.is_deleted == False, Test.institute_id == institute_id)
            .order_by(Test.scheduled_date.desc())
            .offset(offset)
            .limit(page_size)
        )
        return list(result.scalars().all()), total

    async def get_by_id(self, test_id: int, institute_id: int) -> Test | None:
        result = await self.db.execute(
            select(Test)
            .options(selectinload(Test.subject), selectinload(Test.class_))
            .where(
                Test.id == test_id,
                Test.institute_id == institute_id,
                Test.is_deleted == False,
            )
        )
        return result.scalars().first()

    async def delete(self, test_obj: Test) -> None:
        await soft_delete(self.db, test_obj)
