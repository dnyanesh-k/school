from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, ConflictError, NotFoundError, ValidationError
from app.models.study_session import StudySession
from app.models.study_subject import StudySubject
from app.repositories.study_repository import StudyRepository
from app.schemas.student_tracker import (
    DailyPoint,
    SessionOut,
    SessionStartRequest,
    StatsOut,
    SubjectCreate,
    SubjectOut,
    SubjectStats,
    SubjectUpdate,
)

MAX_SUBJECTS = 10


def _session_to_out(session: StudySession) -> SessionOut:
    duration = None
    if session.ended_at and session.started_at:
        duration = int((session.ended_at - session.started_at).total_seconds() / 60)
    return SessionOut(
        id=session.id,
        subject_id=session.subject_id,
        subject_name=session.subject.name if session.subject else "",
        started_at=session.started_at,
        ended_at=session.ended_at,
        duration_minutes=duration,
    )


class StudentTrackerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = StudyRepository(db)

    # ── Subjects ──────────────────────────────────────────────────────────────

    async def list_subjects(self, user_id: int) -> list[SubjectOut]:
        subjects = await self.repo.list_subjects(user_id)
        return [SubjectOut(id=s.id, name=s.name, daily_target_hours=float(s.daily_target_hours)) for s in subjects]

    async def create_subject(self, user_id: int, payload: SubjectCreate) -> SubjectOut:
        count = await self.repo.count_subjects(user_id)
        if count >= MAX_SUBJECTS:
            raise ValidationError(f"Maximum {MAX_SUBJECTS} subjects allowed")

        subject = StudySubject(
            user_id=user_id,
            name=payload.name.strip(),
            daily_target_hours=payload.daily_target_hours,
            display_order=count,
        )
        subject = await self.repo.create_subject(subject)
        await self.repo.save()
        return SubjectOut(id=subject.id, name=subject.name, daily_target_hours=float(subject.daily_target_hours))

    async def update_subject(self, user_id: int, subject_id: int, payload: SubjectUpdate) -> SubjectOut:
        subject = await self.repo.get_subject(subject_id, user_id)
        if not subject:
            raise NotFoundError("Subject")

        if payload.name is not None:
            subject.name = payload.name.strip()
        if payload.daily_target_hours is not None:
            subject.daily_target_hours = payload.daily_target_hours

        await self.repo.save()
        return SubjectOut(id=subject.id, name=subject.name, daily_target_hours=float(subject.daily_target_hours))

    async def delete_subject(self, user_id: int, subject_id: int) -> None:
        subject = await self.repo.get_subject(subject_id, user_id)
        if not subject:
            raise NotFoundError("Subject")

        subject.is_deleted = True
        await self.repo.save()

    # ── Sessions ──────────────────────────────────────────────────────────────

    async def start_session(self, user_id: int, payload: SessionStartRequest) -> SessionOut:
        # Validate subject belongs to user
        subject = await self.repo.get_subject(payload.subject_id, user_id)
        if not subject:
            raise NotFoundError("Subject")

        # Only one active session at a time — auto-end any stale open session
        existing = await self.repo.get_active_session(user_id)
        if existing:
            existing.ended_at = datetime.now(timezone.utc)

        session = StudySession(
            user_id=user_id,
            subject_id=payload.subject_id,
            started_at=datetime.now(timezone.utc),
        )
        session = await self.repo.create_session(session)
        await self.repo.save()
        return _session_to_out(session)

    async def end_session(self, user_id: int) -> SessionOut:
        session = await self.repo.get_active_session(user_id)
        if not session:
            raise AppException(status_code=404, message="No active session found", error_code="NO_ACTIVE_SESSION")

        session.ended_at = datetime.now(timezone.utc)
        await self.repo.save()
        return _session_to_out(session)

    async def get_active_session(self, user_id: int) -> Optional[SessionOut]:
        session = await self.repo.get_active_session(user_id)
        return _session_to_out(session) if session else None

    # ── Stats ─────────────────────────────────────────────────────────────────

    async def get_stats(self, user_id: int) -> StatsOut:
        # Use IST (UTC+05:30) for all calendar boundaries so "today" resets at
        # Indian midnight, not at 05:30 AM IST (UTC midnight).
        IST = timezone(timedelta(hours=5, minutes=30))
        now_ist = datetime.now(IST)
        today_start_ist = now_ist.replace(hour=0, minute=0, second=0, microsecond=0)
        today_start = today_start_ist.astimezone(timezone.utc)
        week_start = (today_start_ist - timedelta(days=today_start_ist.weekday())).astimezone(timezone.utc)
        month_start = today_start_ist.replace(day=1).astimezone(timezone.utc)
        thirty_days_ago = (today_start_ist - timedelta(days=30)).astimezone(timezone.utc)

        subjects = await self.repo.list_subjects(user_id)
        subject_map = {s.id: s for s in subjects}

        # Fetch all time windows in parallel-ish (sequential is fine here — all fast)
        today_hours = await self.repo.hours_by_subject_and_window(user_id, today_start)
        week_hours = await self.repo.hours_by_subject_and_window(user_id, week_start)
        month_hours = await self.repo.hours_by_subject_and_window(user_id, month_start)
        total_hours = await self.repo.hours_by_subject_and_window(user_id, datetime(2000, 1, 1, tzinfo=timezone.utc))
        daily_raw = await self.repo.daily_hours_last_30(user_id, thirty_days_ago)

        subject_stats = []
        for s in subjects:
            weekly = week_hours.get(s.id, 0.0)
            weekly_target = 7 * float(s.daily_target_hours)
            weekly_pct = min(100.0, (weekly / weekly_target * 100)) if weekly_target > 0 else 0.0
            subject_stats.append(SubjectStats(
                subject_id=s.id,
                subject_name=s.name,
                daily_target_hours=float(s.daily_target_hours),
                today_hours=round(today_hours.get(s.id, 0.0), 2),
                this_week_hours=round(weekly, 2),
                this_month_hours=round(month_hours.get(s.id, 0.0), 2),
                total_hours=round(total_hours.get(s.id, 0.0), 2),
                weekly_pct=round(weekly_pct, 1),
            ))

        daily_points = [
            DailyPoint(
                date=row["date"],
                subject_id=row["subject_id"],
                subject_name=subject_map[row["subject_id"]].name if row["subject_id"] in subject_map else "Unknown",
                hours=round(row["hours"], 2),
            )
            for row in daily_raw
            if row["subject_id"] in subject_map  # skip deleted-subject sessions
        ]

        active = await self.get_active_session(user_id)
        recent = await self.repo.recent_sessions(user_id, limit=5)
        today_sess = await self.repo.today_sessions(user_id, today_start)

        return StatsOut(
            subjects=subject_stats,
            daily_last_30=daily_points,
            active_session=active,
            recent_sessions=[_session_to_out(s) for s in recent],
            today_sessions=[_session_to_out(s) for s in today_sess],
        )
