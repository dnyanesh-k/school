from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.study_session import StudySession
from app.models.study_subject import StudySubject


class StudyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Subjects ──────────────────────────────────────────────────────────────

    async def list_subjects(self, user_id: int) -> list[StudySubject]:
        result = await self.db.execute(
            select(StudySubject)
            .where(StudySubject.user_id == user_id, StudySubject.is_deleted.is_(False))
            .order_by(StudySubject.display_order, StudySubject.id)
        )
        return list(result.scalars().all())

    async def count_subjects(self, user_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).where(
                StudySubject.user_id == user_id, StudySubject.is_deleted.is_(False)
            )
        )
        return result.scalar_one()

    async def get_subject(self, subject_id: int, user_id: int) -> Optional[StudySubject]:
        result = await self.db.execute(
            select(StudySubject).where(
                StudySubject.id == subject_id,
                StudySubject.user_id == user_id,
                StudySubject.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()

    async def create_subject(self, subject: StudySubject) -> StudySubject:
        self.db.add(subject)
        await self.db.flush()
        await self.db.refresh(subject)
        return subject

    async def save(self) -> None:
        await self.db.commit()

    # ── Sessions ──────────────────────────────────────────────────────────────

    async def get_active_session(self, user_id: int) -> Optional[StudySession]:
        result = await self.db.execute(
            select(StudySession)
            .options(selectinload(StudySession.subject))
            .where(StudySession.user_id == user_id, StudySession.ended_at.is_(None))
            .order_by(StudySession.started_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def get_session(self, session_id: int, user_id: int) -> Optional[StudySession]:
        result = await self.db.execute(
            select(StudySession)
            .options(selectinload(StudySession.subject))
            .where(StudySession.id == session_id, StudySession.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_session(self, session: StudySession) -> StudySession:
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session, attribute_names=["subject"])
        return session

    async def today_sessions(self, user_id: int, since: datetime) -> list[StudySession]:
        """All completed sessions that started today, ordered by start time."""
        result = await self.db.execute(
            select(StudySession)
            .options(selectinload(StudySession.subject))
            .where(
                StudySession.user_id == user_id,
                StudySession.ended_at.isnot(None),
                StudySession.started_at >= since,
            )
            .order_by(StudySession.started_at.asc())
        )
        return list(result.scalars().all())

    async def recent_sessions(self, user_id: int, limit: int = 10) -> list[StudySession]:
        result = await self.db.execute(
            select(StudySession)
            .options(selectinload(StudySession.subject))
            .where(StudySession.user_id == user_id, StudySession.ended_at.isnot(None))
            .order_by(StudySession.started_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    # ── Aggregations (stats) ──────────────────────────────────────────────────

    async def hours_by_subject_and_window(
        self, user_id: int, since: datetime
    ) -> dict[int, float]:
        """Returns {subject_id: total_hours} for completed sessions since `since`."""
        result = await self.db.execute(
            select(
                StudySession.subject_id,
                func.sum(
                    func.extract("epoch", StudySession.ended_at - StudySession.started_at) / 3600
                ).label("hours"),
            )
            .where(
                StudySession.user_id == user_id,
                StudySession.ended_at.isnot(None),
                StudySession.started_at >= since,
            )
            .group_by(StudySession.subject_id)
        )
        return {row.subject_id: float(row.hours or 0) for row in result}

    async def daily_hours_last_30(
        self, user_id: int, since: datetime
    ) -> list[dict]:
        """Returns list of {date, subject_id, hours} for graph."""
        result = await self.db.execute(
            select(
                func.date(StudySession.started_at).label("day"),
                StudySession.subject_id,
                func.sum(
                    func.extract("epoch", StudySession.ended_at - StudySession.started_at) / 3600
                ).label("hours"),
            )
            .where(
                StudySession.user_id == user_id,
                StudySession.ended_at.isnot(None),
                StudySession.started_at >= since,
            )
            .group_by(text("day"), StudySession.subject_id)
            .order_by(text("day"), StudySession.subject_id)
        )
        return [
            {"date": str(row.day), "subject_id": row.subject_id, "hours": float(row.hours or 0)}
            for row in result
        ]

    # ── Platform admin aggregate queries ──────────────────────────────────────

    async def students_active_since(self, since: datetime) -> dict:
        """Returns count of distinct users with sessions since `since` + total hours."""
        result = await self.db.execute(
            select(
                func.count(StudySession.user_id.distinct()).label("active_users"),
                func.coalesce(
                    func.sum(
                        func.extract("epoch", StudySession.ended_at - StudySession.started_at) / 3600
                    ), 0
                ).label("total_hours"),
            ).where(
                StudySession.ended_at.isnot(None),
                StudySession.started_at >= since,
            )
        )
        row = result.one()
        return {"active_users": row.active_users or 0, "total_hours": round(float(row.total_hours or 0), 1)}

    # ── Admin queries ─────────────────────────────────────────────────────────

    async def total_sessions_for_user(self, user_id: int) -> int:
        result = await self.db.execute(
            select(func.count()).where(
                StudySession.user_id == user_id, StudySession.ended_at.isnot(None)
            )
        )
        return result.scalar_one()

    async def total_hours_for_user(self, user_id: int) -> float:
        result = await self.db.execute(
            select(
                func.coalesce(
                    func.sum(
                        func.extract("epoch", StudySession.ended_at - StudySession.started_at) / 3600
                    ),
                    0,
                )
            ).where(StudySession.user_id == user_id, StudySession.ended_at.isnot(None))
        )
        return float(result.scalar_one())

    async def last_session_at(self, user_id: int) -> Optional[datetime]:
        result = await self.db.execute(
            select(func.max(StudySession.started_at)).where(
                StudySession.user_id == user_id, StudySession.ended_at.isnot(None)
            )
        )
        return result.scalar_one_or_none()
