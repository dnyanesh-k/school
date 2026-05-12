from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from app.models.student import Student
from sqlalchemy import or_ 

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

    async def get_by_roll_number(self, roll_number: str) -> Student | None:
        result = await self.db.execute(
            select(Student).where(Student.roll_number == roll_number)
        )
        return result.scalars().first()

    async def get_count(self) -> int:
        # Efficiently counts total records in the students table
        result = await self.db.execute(select(func.count(Student.id)))
        return result.scalar() or 0

    async def search_students(self, search_term: str) -> list[Student]:
        stmt = select(Student).where(
            or_(
                Student.roll_number.ilike(search_term),
                Student.full_name.ilike(search_term)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

