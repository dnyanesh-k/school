from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.student import StudentCreate, StudentUpdate
from app.repositories.student_repository import StudentRepository
from app.repositories.class_repository import ClassRepository
from app.models.student import Student
from app.core.exceptions import NotFoundError, ValidationError


class StudentService:
    def __init__(self, db: AsyncSession):
        self.repo = StudentRepository(db)
        self.class_repo = ClassRepository(db)

    async def create(self, payload: StudentCreate):
        # Validate class association exists
        class_obj = await self.class_repo.get_by_id(payload.class_id)
        if not class_obj:
            raise NotFoundError("Class")

        # autogenerate roll number
        count = await self.repo.get_count()
        new_roll_number = f"STU-{count + 1}"

        # Convert Pydantic DTO to SQLAlchemy Model
        student_data = payload.model_dump()
        student_data["roll_number"] = new_roll_number
        student_db_obj = Student(**student_data)

        return await self.repo.create(student_db_obj)

    async def get_all(self):
        return await self.repo.list_all()

    async def search(self, query: str):
        if not query:
            return await self.get_all()
        # Logic: prepare the search string
        search_term = f"%{query.strip()}%"
        return await self.repo.search_students(search_term)

    async def update_student(self, roll_number: str, payload: StudentUpdate):
        # 1. Find the student
        student = await self.repo.get_by_roll_number(roll_number)
        if not student:
            raise NotFoundError("Student")

        # 2. Update only the fields provided in the payload
        update_data = payload.model_dump(
            exclude_unset=True)  # exclude_unset is key!

        for key, value in update_data.items():
            setattr(student, key, value)

        # 3. Save changes
        return await self.repo.update(student)

    async def delete_student(self, roll_number: str) -> None:
        student = await self.repo.get_by_roll_number(roll_number)
        if not student:
            raise NotFoundError("Student")
        await self.repo.delete(student)
