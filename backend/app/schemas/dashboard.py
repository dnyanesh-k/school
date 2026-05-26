from pydantic import BaseModel


class DashboardSummaryOut(BaseModel):
    total_students: int
    attendance_today_pct: float
    absent_today_count: int
    fees_collected: int
    fees_collected_this_month: int
    fees_pending: int
    collection_rate_pct: float
    fee_defaulters_count: int
    tests_this_week: int
    tests_pending_scores: int
