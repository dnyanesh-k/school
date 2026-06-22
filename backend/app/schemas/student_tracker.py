from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Subjects ──────────────────────────────────────────────────────────────────

class SubjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    daily_target_hours: float = Field(gt=0, le=24)


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    daily_target_hours: Optional[float] = Field(None, gt=0, le=24)


class SubjectOut(BaseModel):
    id: int
    name: str
    daily_target_hours: float

    model_config = {"from_attributes": True}


# ── Sessions ──────────────────────────────────────────────────────────────────

class SessionStartRequest(BaseModel):
    subject_id: int


class SessionOut(BaseModel):
    id: int
    subject_id: int
    subject_name: str
    started_at: datetime
    ended_at: Optional[datetime]
    duration_minutes: Optional[int]  # None while session is active

    model_config = {"from_attributes": True}


# ── Stats ─────────────────────────────────────────────────────────────────────

class SubjectStats(BaseModel):
    subject_id: int
    subject_name: str
    daily_target_hours: float
    today_hours: float
    this_week_hours: float
    this_month_hours: float
    total_hours: float
    # weekly completion %: this_week_hours / (7 * daily_target_hours) * 100, capped at 100
    weekly_pct: float


class DailyPoint(BaseModel):
    date: str        # "YYYY-MM-DD"
    subject_id: int
    subject_name: str
    hours: float


class StatsOut(BaseModel):
    subjects: list[SubjectStats]
    daily_last_30: list[DailyPoint]   # feed directly into line chart
    active_session: Optional[SessionOut]
    recent_sessions: list[SessionOut]
    today_sessions: list[SessionOut]  # all completed sessions today, for timeline chart
