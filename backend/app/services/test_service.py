from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationError
from app.core.pagination import slice_page
from app.core.tenant import verify_class, verify_subject, verify_test
from app.models.test import Test
from app.models.test_score import TestScore
from app.repositories.student_repository import StudentRepository
from app.repositories.test_repository import TestRepository
from app.repositories.test_score_repository import TestScoreRepository
from app.schemas.pagination import PaginatedResponse, build_paginated, DEFAULT_PAGE, DEFAULT_PAGE_SIZE
from app.schemas.test import (
    TestCreate,
    TestOut,
    TestScoreOut,
    TestScoreSubmitRequest,
    TestScoreSubmitResponse,
)


class TestService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = TestRepository(db)
        self.score_repo = TestScoreRepository(db)
        self.student_repo = StudentRepository(db)

    def _serialize(self, test, scores_entered: int = 0) -> dict:
        return {
            "id": test.id,
            "title": test.title,
            "name": test.title,
            "test_number": test.test_number,
            "subject_id": test.subject_id,
            "subject": test.subject.name if getattr(test, "subject", None) else None,
            "class_id": test.class_id,
            "class_name": test.class_name if hasattr(test, "class_name") else (
                test.class_.name if getattr(test, "class_", None) else None
            ),
            "total_marks": test.total_marks,
            "scheduled_date": test.scheduled_date,
            "is_published": test.is_published,
            "scores_entered": scores_entered,
        }

    async def _scores_count(self, test_id: int) -> int:
        return await self.score_repo.count_for_test(test_id)

    async def create(self, payload: TestCreate, institute_id: int):
        await verify_class(self.db, payload.class_id, institute_id)
        await verify_subject(self.db, payload.subject_id, institute_id)

        data = payload.model_dump()
        data["total_marks"] = data.pop("max_marks")
        data["institute_id"] = institute_id

        test_obj = Test(**data)
        created = await self.repo.create(test_obj)
        return TestOut(**self._serialize(created, 0))

    async def get_all(
        self,
        institute_id: int,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> PaginatedResponse[TestOut]:
        page, page_size, _ = slice_page(page, page_size)
        tests, total = await self.repo.list_paginated(institute_id, page, page_size)
        score_counts = await self.score_repo.count_by_test_ids([test.id for test in tests])
        results = [
            TestOut(**self._serialize(test, score_counts.get(test.id, 0)))
            for test in tests
        ]
        return build_paginated(results, total, page, page_size)

    async def get_by_id(self, test_id: int, institute_id: int):
        test = await verify_test(self.db, test_id, institute_id)
        count = await self._scores_count(test_id)
        return TestOut(**self._serialize(test, count))

    async def delete(self, test_id: int, institute_id: int):
        test = await verify_test(self.db, test_id, institute_id)
        await self.score_repo.soft_delete_for_test(test_id)
        await self.repo.delete(test)

    async def get_scores(self, test_id: int, institute_id: int) -> list[TestScoreOut]:
        test = await verify_test(self.db, test_id, institute_id)

        students = await self.student_repo.list_by_class(institute_id, test.class_id)
        active_students = [s for s in students if s.is_active]
        existing = await self.score_repo.get_for_test(test_id)
        score_map = {item.student_id: item for item in existing}

        rows: list[TestScoreOut] = []
        for student in sorted(active_students, key=lambda s: s.full_name.lower()):
            score = score_map.get(student.id)
            rows.append(
                TestScoreOut(
                    student_id=student.id,
                    student_name=student.full_name,
                    parent_phone=student.parent_phone,
                    roll_number=student.roll_number,
                    marks_obtained=score.marks_obtained if score else None,
                    remarks=score.remarks if score else None,
                )
            )
        return rows

    async def submit_scores(
        self,
        test_id: int,
        institute_id: int,
        payload: TestScoreSubmitRequest,
    ) -> TestScoreSubmitResponse:
        test = await verify_test(self.db, test_id, institute_id)

        students = await self.student_repo.list_by_class(institute_id, test.class_id)
        active_student_ids = {s.id for s in students if s.is_active}

        if not active_student_ids:
            raise ValidationError("No active students in this class")

        submitted_ids = {item.student_id for item in payload.scores}
        if submitted_ids != active_student_ids:
            raise ValidationError("Scores must be submitted for every active student in the class")

        for item in payload.scores:
            if item.marks_obtained > test.total_marks:
                raise ValidationError(f"Marks cannot exceed maximum of {test.total_marks}")

        records = [
            TestScore(
                test_id=test_id,
                student_id=item.student_id,
                marks_obtained=item.marks_obtained,
                remarks=item.remarks.strip() or None,
            )
            for item in payload.scores
        ]

        await self.score_repo.upsert_batch(records)

        test.is_published = True
        await self.db.commit()
        await self.db.refresh(test, attribute_names=["subject", "class_"])

        count = len(records)
        return TestScoreSubmitResponse(
            message="Scores saved successfully",
            saved=count,
            test=TestOut(**self._serialize(test, count)),
        )
