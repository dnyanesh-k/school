from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.class_ import ClassCreate, ClassOut, ClassUpdate
from app.schemas.subject import SubjectCreate, SubjectOut
from app.services.class_service import ClassService
from app.services.subject_service import SubjectService

router = APIRouter(prefix="/classes", tags=["classes"])


@router.post("", response_model=ClassOut, status_code=status.HTTP_201_CREATED)
async def create_class(
    payload: ClassCreate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassService(db)
    return await service.create(payload, institute_id_of(current_user))


@router.get("", response_model=List[ClassOut], status_code=status.HTTP_200_OK)
async def get_classes(
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassService(db)
    return await service.get_all(institute_id_of(current_user))


@router.get("/{class_id}", response_model=ClassOut, status_code=status.HTTP_200_OK)
async def get_class(
    class_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassService(db)
    return await service.get_by_id(class_id, institute_id_of(current_user))


@router.put("/{class_id}", response_model=ClassOut, status_code=status.HTTP_200_OK)
async def update_class(
    class_id: int,
    payload: ClassUpdate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassService(db)
    return await service.update(class_id, payload, institute_id_of(current_user))


@router.delete("/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_class(
    class_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = ClassService(db)
    await service.delete(class_id, institute_id_of(current_user))


@router.get("/{class_id}/subjects", response_model=List[SubjectOut], status_code=status.HTTP_200_OK)
async def list_class_subjects(
    class_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    return await service.list_by_class(class_id, institute_id_of(current_user))


@router.post("/{class_id}/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def create_class_subject(
    class_id: int,
    payload: SubjectCreate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    return await service.create(class_id, payload, institute_id_of(current_user))
