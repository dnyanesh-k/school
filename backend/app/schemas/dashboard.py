from pydantic import BaseModel


class DashboardSummaryOut(BaseModel):
    total_students: int
    attendance_today_pct: float
    absent_today_count: int
    can_view_fees: bool = False
    fees_collected: int | None = None
    fees_collected_this_month: int | None = None
    fees_pending: int | None = None
    collection_rate_pct: float | None = None
    fee_defaulters_count: int | None = None
    tests_this_week: int
    tests_pending_scores: int
