from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse
from app.schemas.test import (
    TestCreate,
    TestOut,
    TestScoreOut,
    TestScoreSubmitRequest,
    TestScoreSubmitResponse,
)
from app.services.test_service import TestService

router = APIRouter(prefix="/tests", tags=["tests"])


@router.post("", response_model=TestOut, status_code=status.HTTP_201_CREATED)
async def create_test(
    payload: TestCreate,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = TestService(db)
    return await service.create(payload, institute_id_of(current_user))


@router.get("", response_model=PaginatedResponse[TestOut])
async def list_tests(
    page: int = Query(DEFAULT_PAGE, ge=1),
    page_size: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=50),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = TestService(db)
    return await service.get_all(institute_id_of(current_user), page=page, page_size=page_size)


@router.get("/{test_id}", response_model=TestOut)
async def get_test(
    test_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = TestService(db)
    return await service.get_by_id(test_id, institute_id_of(current_user))


@router.get("/{test_id}/scores", response_model=list[TestScoreOut])
async def get_test_scores(
    test_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = TestService(db)
    return await service.get_scores(test_id, institute_id_of(current_user))


@router.post("/{test_id}/scores", response_model=TestScoreSubmitResponse)
async def submit_test_scores(
    test_id: int,
    payload: TestScoreSubmitRequest,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = TestService(db)
    return await service.submit_scores(test_id, institute_id_of(current_user), payload)


@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test(
    test_id: int,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = TestService(db)
    await service.delete(test_id, institute_id_of(current_user))
