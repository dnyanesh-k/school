from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.test_repository import TestRepository
from app.schemas.test import TestCreate, TestOut
from app.models.test import Test


class TestService:
    def __init__(self, db: AsyncSession):
        self.repo = TestRepository(db)

    def _serialize(self, test: Test) -> dict:
        return {
            "id": test.id,
            "title": test.title,
            "name": test.title,
            "test_number": test.test_number,
            "subject_id": test.subject_id,
            "subject": test.subject.name if getattr(test, "subject", None) else None,
            "class_id": test.class_id,
            "class_name": test.class_name if hasattr(test, "class_name") else (test.class_.name if getattr(test, "class_", None) else None),
            "total_marks": test.total_marks,
            "scheduled_date": test.scheduled_date,
            "is_published": test.is_published,
        }

    async def create(self, payload: TestCreate):
        data = payload.model_dump()
        # map frontend field `max_marks` to DB `total_marks`
        data["total_marks"] = data.pop("max_marks")
        test_obj = Test(**data)
        created = await self.repo.create(test_obj)
        return TestOut(**self._serialize(created))

    async def get_all(self):
        tests = await self.repo.list_all()
        return [TestOut(**self._serialize(t)) for t in tests]

    async def delete(self, test_id: int):
        from fastapi import HTTPException, status

        test = await self.repo.get_by_id(test_id)
        if not test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
        await self.repo.delete(test)
        return None
