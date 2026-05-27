from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse
from app.schemas.student import StudentCreate, StudentOut, StudentUpdate
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["students"])


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
async def create_student(
    payload: StudentCreate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    return await service.create(payload, institute_id_of(current_user))


@router.get("", response_model=PaginatedResponse[StudentOut], status_code=status.HTTP_200_OK)
async def get_students(
    class_id: int | None = None,
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    q: str | None = Query(None, description="Search by name or roll number"),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    return await service.get_all(
        institute_id_of(current_user),
        class_id=class_id,
        page=page,
        page_size=page_size,
        q=q,
    )


@router.get("/search", response_model=PaginatedResponse[StudentOut])
async def search_students(
    q: str = "",
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    return await service.search(institute_id_of(current_user), q, page=page, page_size=page_size)


@router.get("/{student_id}", response_model=StudentOut, status_code=status.HTTP_200_OK)
async def get_student(
    student_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    return await service.get_by_id(student_id, institute_id_of(current_user))


@router.patch("/{student_id}", response_model=StudentOut)
async def update_student(
    student_id: int,
    payload: StudentUpdate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    return await service.update_student(student_id, payload, institute_id_of(current_user))


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = StudentService(db)
    await service.delete_student(student_id, institute_id_of(current_user))
