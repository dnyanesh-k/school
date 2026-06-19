from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.fee import FeePlan, Installment
from app.models.student import Student
from app.models.test import Test
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.fee_repository import FeeRepository
from app.schemas.dashboard import AttendanceTrendPoint, DashboardSummaryOut


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.attendance_repo = AttendanceRepository(db)
        self.fee_repo = FeeRepository(db)

    async def get_summary(self, institute_id: int, *, include_fees: bool = True) -> DashboardSummaryOut:
        today = date.today()
        month_start = today.replace(day=1)
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        student_result = await self.db.execute(
            select(func.count(Student.id)).where(
                Student.institute_id == institute_id,
                Student.is_deleted == False,
                Student.is_active == True,
            )
        )
        total_students = student_result.scalar() or 0

        fees_collected = None
        fees_collected_this_month = None
        fees_collected_this_week = None
        fees_total_planned = None
        fees_pending = None
        fees_overdue = None
        fees_due_next_week = None
        collection_rate_pct = None
        fee_defaulters_count = None
        next_week_start = today + timedelta(days=1)
        next_week_end = today + timedelta(days=7)

        if include_fees:
            fee_result = await self.db.execute(
                select(
                    func.coalesce(func.sum(FeePlan.paid_amount), 0),
                    func.coalesce(func.sum(FeePlan.total_amount), 0),
                )
                .join(Student, FeePlan.student_id == Student.id)
                .where(
                    Student.institute_id == institute_id,
                    FeePlan.is_deleted == False,
                )
            )
            paid_total, fee_total = fee_result.one()
            fees_collected = int(paid_total or 0)
            fee_total_int = int(fee_total or 0)
            fees_total_planned = fee_total_int
            fees_pending = max(fee_total_int - fees_collected, 0)
            collection_rate_pct = (
                round((fees_collected / fee_total_int) * 100, 1) if fee_total_int > 0 else 0.0
            )

            due_next_week_result = await self.db.execute(
                select(func.coalesce(func.sum(Installment.amount), 0))
                .join(FeePlan, Installment.fee_plan_id == FeePlan.id)
                .join(Student, FeePlan.student_id == Student.id)
                .where(
                    Student.institute_id == institute_id,
                    Student.is_active == True,
                    FeePlan.is_deleted == False,
                    Installment.is_deleted == False,
                    Installment.status != "paid",
                    Installment.due_date > today,
                    Installment.due_date <= next_week_end,
                )
            )
            fees_due_next_week = int(due_next_week_result.scalar() or 0)

            month_collected_result = await self.db.execute(
                select(func.coalesce(func.sum(Installment.paid_amount), 0))
                .join(FeePlan, Installment.fee_plan_id == FeePlan.id)
                .join(Student, FeePlan.student_id == Student.id)
                .where(
                    Student.institute_id == institute_id,
                    FeePlan.is_deleted == False,
                    Installment.is_deleted == False,
                    Installment.paid_date.isnot(None),
                    Installment.paid_date >= month_start,
                    Installment.paid_date <= today,
                )
            )
            fees_collected_this_month = int(month_collected_result.scalar() or 0)

            week_collected_result = await self.db.execute(
                select(func.coalesce(func.sum(Installment.paid_amount), 0))
                .join(FeePlan, Installment.fee_plan_id == FeePlan.id)
                .join(Student, FeePlan.student_id == Student.id)
                .where(
                    Student.institute_id == institute_id,
                    FeePlan.is_deleted == False,
                    Installment.is_deleted == False,
                    Installment.paid_date.isnot(None),
                    Installment.paid_date >= week_start,
                    Installment.paid_date <= today,
                )
            )
            fees_collected_this_week = int(week_collected_result.scalar() or 0)

            overdue_installments = await self.fee_repo.get_unpaid_installments(today, institute_id)
            defaulter_student_ids = {
                item.fee_plan.student_id
                for item in overdue_installments
                if item.fee_plan and item.fee_plan.student and item.fee_plan.student.is_active
            }
            fee_defaulters_count = len(defaulter_student_ids)
            fees_overdue = sum(
                installment.amount
                for installment in overdue_installments
            )
        records = await self.attendance_repo.get_for_date(today, institute_id)
        absent_ids = {record.student_id for record in records if record.status == "absent"}
        absent_today_count = len(absent_ids)
        attendance_pct = 0.0
        if total_students > 0:
            present_count = total_students - absent_today_count
            attendance_pct = round((present_count / total_students) * 100, 1)

        # 7-day trend (oldest → newest)
        absent_by_date = await self.attendance_repo.get_absent_counts_last_n_days(institute_id, 7)
        trend: list[AttendanceTrendPoint] = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            absent = absent_by_date.get(d, 0)
            pct = round(((total_students - absent) / total_students) * 100, 1) if total_students > 0 else 0.0
            trend.append(AttendanceTrendPoint(date=d, pct=pct, absent=absent))

        tests_week_result = await self.db.execute(
            select(func.count(Test.id)).where(
                Test.institute_id == institute_id,
                Test.is_deleted == False,
                Test.scheduled_date >= week_start,
                Test.scheduled_date <= week_end,
            )
        )
        tests_this_week = tests_week_result.scalar() or 0

        pending_scores_result = await self.db.execute(
            select(func.count(Test.id)).where(
                Test.institute_id == institute_id,
                Test.is_deleted == False,
                Test.scheduled_date < today,
                Test.is_published == False,
            )
        )
        tests_pending_scores = pending_scores_result.scalar() or 0

        return DashboardSummaryOut(
            total_students=total_students,
            attendance_today_pct=attendance_pct,
            absent_today_count=absent_today_count,
            attendance_trend=trend,
            can_view_fees=include_fees,
            fees_collected=fees_collected,
            fees_collected_this_month=fees_collected_this_month,
            fees_collected_this_week=fees_collected_this_week,
            fees_total_planned=fees_total_planned,
            fees_pending=fees_pending,
            fees_overdue=fees_overdue,
            fees_due_next_week=fees_due_next_week,
            next_week_start=next_week_start if include_fees else None,
            next_week_end=next_week_end if include_fees else None,
            collection_rate_pct=collection_rate_pct,
            fee_defaulters_count=fee_defaulters_count,
            tests_this_week=tests_this_week,
            tests_pending_scores=tests_pending_scores,
        )
