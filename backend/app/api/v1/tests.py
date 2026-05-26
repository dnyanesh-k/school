from fastapi import APIRouter, status, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.test import TestCreate, TestOut
from app.services.test_service import TestService

router = APIRouter(prefix="/tests", tags=["tests"])


@router.post("", response_model=TestOut, status_code=status.HTTP_201_CREATED)
async def create_test(payload: TestCreate, db: AsyncSession = Depends(get_db)):
    service = TestService(db)
    return await service.create(payload)


@router.get("", response_model=List[TestOut])
async def list_tests(db: AsyncSession = Depends(get_db)):
    service = TestService(db)
    return await service.get_all()


@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test(test_id: int, db: AsyncSession = Depends(get_db)):
    service = TestService(db)
    await service.delete(test_id)
