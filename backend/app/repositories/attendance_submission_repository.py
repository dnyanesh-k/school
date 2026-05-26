from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import AttendanceSubmission


class AttendanceSubmissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_submission(
        self,
        class_id: int,
        attendance_date: date,
        institute_id: int,
    ) -> AttendanceSubmission | None:
        result = await self.db.execute(
            select(AttendanceSubmission).where(
                AttendanceSubmission.class_id == class_id,
                AttendanceSubmission.attendance_date == attendance_date,
                AttendanceSubmission.institute_id == institute_id,
            )
        )
        return result.scalars().first()

    async def upsert_submission(
        self,
        class_id: int,
        attendance_date: date,
        institute_id: int,
    ) -> AttendanceSubmission:
        existing = await self.get_submission(class_id, attendance_date, institute_id)
        now = datetime.now(timezone.utc)

        if existing:
            existing.submitted_at = now
            submission = existing
        else:
            submission = AttendanceSubmission(
                institute_id=institute_id,
                class_id=class_id,
                attendance_date=attendance_date,
                submitted_at=now,
            )
            self.db.add(submission)

        await self.db.commit()
        await self.db.refresh(submission)
        return submission
