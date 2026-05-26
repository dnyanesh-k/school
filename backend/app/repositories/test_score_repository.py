from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.soft_delete import soft_delete
from app.models.test_score import TestScore


class TestScoreRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_for_test(self, test_id: int) -> list[TestScore]:
        result = await self.db.execute(
            select(TestScore)
            .options(selectinload(TestScore.student))
            .where(TestScore.test_id == test_id, TestScore.is_deleted == False)
        )
        return list(result.scalars().all())

    async def soft_delete_for_test(self, test_id: int) -> None:
        result = await self.db.execute(
            select(TestScore).where(TestScore.test_id == test_id, TestScore.is_deleted == False)
        )
        scores = list(result.scalars().all())
        for score in scores:
            score.is_deleted = True
        if scores:
            await self.db.commit()

    async def count_for_test(self, test_id: int) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(TestScore)
            .where(TestScore.test_id == test_id, TestScore.is_deleted == False)
        )
        return int(result.scalar() or 0)

    async def count_by_test_ids(self, test_ids: list[int]) -> dict[int, int]:
        if not test_ids:
            return {}

        result = await self.db.execute(
            select(TestScore.test_id, func.count(TestScore.id))
            .where(TestScore.test_id.in_(test_ids), TestScore.is_deleted == False)
            .group_by(TestScore.test_id)
        )
        return {test_id: count for test_id, count in result.all()}

    async def upsert_batch(self, scores: list[TestScore]) -> list[TestScore]:
        saved: list[TestScore] = []

        for score in scores:
            result = await self.db.execute(
                select(TestScore).where(
                    TestScore.test_id == score.test_id,
                    TestScore.student_id == score.student_id,
                )
            )
            existing = result.scalars().first()

            if existing:
                existing.marks_obtained = score.marks_obtained
                existing.remarks = score.remarks
                existing.is_deleted = False
                saved.append(existing)
            else:
                self.db.add(score)
                saved.append(score)

        await self.db.commit()
        for item in saved:
            await self.db.refresh(item)

        return saved
