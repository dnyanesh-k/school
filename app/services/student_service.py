from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.student import StudentCreate
from app.repositories.student_repository import StudentRepository
from app.models.student import Student  # <--- 1. Import your SQLAlchemy Model

class StudentService:
    def __init__(self, db: AsyncSession):
        self.repo = StudentRepository(db)

    async def create(self, payload: StudentCreate):
        # 2. Check if student already exists (Business Logic)
        existing = await self.repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student with this email already exists"
            )

        # 3. Convert Pydantic DTO to SQLAlchemy Model
        # **payload.model_dump() turns the DTO into keyword arguments for the Model
        student_db_obj = Student(**payload.model_dump())
        
        # 4. Pass the Model (not the DTO) to the repository
        return await self.repo.create(student_db_obj)

    async def get_all(self):
        return await self.repo.list_all()
