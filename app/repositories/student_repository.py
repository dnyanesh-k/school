from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.student import Student

class StudentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, student: Student) -> Student:
        self.db.add(student)
        await self.db.commit()
        await self.db.refresh(student)
        return student

    async def list_all(self) -> list[Student]:
        result = await self.db.execute(select(Student))
        return result.scalars().all()

    async def get_by_email(self, email: str) -> Student | None:
        result = await self.db.execute(
            select(Student).where(Student.email == email)
        )
        return result.scalars().first()

    async def get_by_id(self, student_id: int) -> Student | None:
        return await self.db.get(Student, student_id)
