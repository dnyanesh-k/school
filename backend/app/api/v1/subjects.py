from fastapi import APIRouter, Depends, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.subject import SubjectCreate, SubjectOut, SubjectUpdate
from app.services.subject_service import SubjectService

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("/{subject_id}", response_model=SubjectOut, status_code=status.HTTP_200_OK)
async def get_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    return await service.get_by_id(subject_id)


@router.put("/{subject_id}", response_model=SubjectOut, status_code=status.HTTP_200_OK)
async def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    return await service.update(subject_id, payload)


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    await service.delete(subject_id)
