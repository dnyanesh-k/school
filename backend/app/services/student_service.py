from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.pagination import slice_page
from app.core.tenant import verify_class
from app.models.student import Student
from app.repositories.class_repository import ClassRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.pagination import PaginatedResponse, build_paginated, DEFAULT_PAGE, DEFAULT_PAGE_SIZE
from app.schemas.student import StudentCreate, StudentUpdate


class StudentService:
    def __init__(self, db: AsyncSession):
        self.repo = StudentRepository(db)
        self.class_repo = ClassRepository(db)

    async def create(self, payload: StudentCreate, institute_id: int):
        class_obj = await self.class_repo.get_by_id(payload.class_id, institute_id)
        if not class_obj:
            raise NotFoundError("Class")

        count = await self.repo.get_total_count(institute_id)
        new_roll_number = f"STU-{count + 1}"

        student_data = payload.model_dump()
        student_data["roll_number"] = new_roll_number
        student_data["institute_id"] = institute_id
        student_db_obj = Student(**student_data)

        return await self.repo.create(student_db_obj)

    async def get_all(
        self,
        institute_id: int,
        class_id: int | None = None,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
        q: str | None = None,
    ) -> PaginatedResponse:
        page, page_size, _ = slice_page(page, page_size)
        items, total = await self.repo.list_paginated(institute_id, class_id, page, page_size, search=q)
        return build_paginated(items, total, page, page_size)

    async def search(
        self,
        institute_id: int,
        query: str,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
    ):
        q = query.strip() or None
        return await self.get_all(institute_id, page=page, page_size=page_size, q=q)

    async def get_by_id(self, student_id: int, institute_id: int):
        student = await self.repo.get_by_id(student_id, institute_id)
        if not student:
            raise NotFoundError("Student")
        return student

    async def update_student(self, student_id: int, payload: StudentUpdate, institute_id: int):
        student = await self.repo.get_by_id(student_id, institute_id)
        if not student:
            raise NotFoundError("Student")

        update_data = payload.model_dump(exclude_unset=True)

        if "class_id" in update_data:
            class_obj = await self.class_repo.get_by_id(update_data["class_id"], institute_id)
            if not class_obj:
                raise NotFoundError("Class")

        for key, value in update_data.items():
            setattr(student, key, value)

        return await self.repo.update(student)

    async def delete_student(self, student_id: int, institute_id: int) -> None:
        student = await self.repo.get_by_id(student_id, institute_id)
        if not student:
            raise NotFoundError("Student")
        await self.repo.delete(student)
