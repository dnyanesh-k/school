from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import IndependentStudent
from app.db.session import get_db
from app.schemas.student_tracker import (
    SessionOut,
    SessionStartRequest,
    StatsOut,
    SubjectCreate,
    SubjectOut,
    SubjectUpdate,
)
from app.services.student_tracker_service import StudentTrackerService

router = APIRouter(prefix="/student", tags=["student-tracker"])


@router.get("/subjects", response_model=list[SubjectOut])
async def list_subjects(
    current_user: IndependentStudent,
    db: AsyncSession = Depends(get_db),
):
    return await StudentTrackerService(db).list_subjects(current_user.id)


@router.post("/subjects", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
async def create_subject(
    payload: SubjectCreate,
    current_user: IndependentStudent,
    db: AsyncSession = Depends(get_db),
):
    return await StudentTrackerService(db).create_subject(current_user.id, payload)


@router.patch("/subjects/{subject_id}", response_model=SubjectOut)
async def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    current_user: IndependentStudent,
    db: AsyncSession = Depends(get_db),
):
    return await StudentTrackerService(db).update_subject(current_user.id, subject_id, payload)


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: int,
    current_user: IndependentStudent,
    db: AsyncSession = Depends(get_db),
):
    await StudentTrackerService(db).delete_subject(current_user.id, subject_id)


@router.post("/sessions/start", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
async def start_session(
    payload: SessionStartRequest,
    current_user: IndependentStudent,
    db: AsyncSession = Depends(get_db),
):
    return await StudentTrackerService(db).start_session(current_user.id, payload)


@router.post("/sessions/end", response_model=SessionOut)
async def end_session(
    current_user: IndependentStudent,
    db: AsyncSession = Depends(get_db),
):
    return await StudentTrackerService(db).end_session(current_user.id)


@router.get("/stats", response_model=StatsOut)
async def get_stats(
    current_user: IndependentStudent,
    db: AsyncSession = Depends(get_db),
):
    return await StudentTrackerService(db).get_stats(current_user.id)
