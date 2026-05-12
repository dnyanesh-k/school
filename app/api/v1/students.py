from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.schemas.student import StudentCreate, StudentOut
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])

# Create a student
@router.post("/", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
async def create_student(
    payload: StudentCreate,
    db: AsyncSession = Depends(get_db)
):
    service = StudentService(db)
    return await service.create(payload)

# Get list of students
@router.get("/", response_model=List[StudentOut], status_code=status.HTTP_200_OK)
async def get_students(
    db: AsyncSession = Depends(get_db)
):
    service = StudentService(db)
    return await service.get_all()

# Search the student
@router.get("/search", response_model=list[StudentOut])
async def search_students(
    q: str = "", 
    db: AsyncSession = Depends(get_db)
):
    service = StudentService(db)
    return await service.search(q)
    
