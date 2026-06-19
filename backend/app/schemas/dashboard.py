from datetime import date

from pydantic import BaseModel


class AttendanceTrendPoint(BaseModel):
    date: date
    pct: float
    absent: int


class DashboardSummaryOut(BaseModel):
    total_students: int
    attendance_today_pct: float
    absent_today_count: int
    attendance_trend: list[AttendanceTrendPoint] = []
    can_view_fees: bool = False
    fees_collected: int | None = None
    fees_collected_this_month: int | None = None
    fees_collected_this_week: int | None = None
    fees_total_planned: int | None = None
    fees_pending: int | None = None
    fees_due_next_week: int | None = None
    next_week_start: date | None = None
    next_week_end: date | None = None
    collection_rate_pct: float | None = None
    fee_defaulters_count: int | None = None
    tests_this_week: int
    tests_pending_scores: int
    fees_overdue:int
