from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.pagination import slice_page
from app.models.fee import FeePlan, Installment
from app.schemas.fee import (
    DefaulterOut,
    FeeOverviewStats,
    FeePlanCreate,
    FeePlanCreateResponse,
    FeePlanOut,
    FeeSummaryListOut,
    FeeSummaryOut,
    InstallmentOut,
    PayInstallmentResponse,
)
from app.repositories.fee_repository import FeeRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.pagination import PaginatedResponse, build_paginated, DEFAULT_PAGE, DEFAULT_PAGE_SIZE


class FeeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = FeeRepository(db)
        self.student_repo = StudentRepository(db)

    @staticmethod
    def resolve_installment_status(installment: Installment, as_of: date | None = None) -> str:
        today = as_of or date.today()
        if installment.status == "paid" or installment.paid_date:
            return "paid"
        if installment.due_date <= today:
            return "overdue"
        return "pending"

    def _to_installment_out(self, installment: Installment) -> InstallmentOut:
        paid_amount = installment.paid_amount
        if paid_amount is None and (installment.status == "paid" or installment.paid_date):
            paid_amount = installment.amount
        return InstallmentOut(
            id=installment.id,
            amount=installment.amount,
            due_date=installment.due_date,
            paid_date=installment.paid_date,
            paid_amount=paid_amount,
            status=self.resolve_installment_status(installment),
        )

    def _to_plan_out(self, fee_plan: FeePlan) -> FeePlanOut:
        return FeePlanOut(
            id=fee_plan.id,
            student_id=fee_plan.student_id,
            total_amount=fee_plan.total_amount,
            paid_amount=fee_plan.paid_amount,
            installments=[self._to_installment_out(item) for item in fee_plan.installments],
        )

    async def create_plan(self, payload: FeePlanCreate, institute_id: int) -> FeePlanCreateResponse:
        student = await self.student_repo.get_by_id(payload.student_id, institute_id)
        if not student or not student.is_active:
            raise NotFoundError("Student")

        existing = await self.repo.get_plan_by_student_id(payload.student_id, institute_id)
        if existing:
            raise ConflictError("Fee plan already exists for this student")

        installment_total = sum(item.amount for item in payload.installments)
        if installment_total != payload.total_amount:
            raise ValidationError(
                f"Installment total (₹{installment_total}) must equal total amount (₹{payload.total_amount})"
            )

        due_dates = [item.due_date for item in payload.installments]
        if len(due_dates) != len(set(due_dates)):
            raise ValidationError("Installment due dates must be unique")

        fee_plan = FeePlan(
            student_id=payload.student_id,
            total_amount=payload.total_amount,
            paid_amount=0,
            installments=[
                Installment(amount=item.amount, due_date=item.due_date, status="pending")
                for item in payload.installments
            ],
        )

        created = await self.repo.create_plan(fee_plan, institute_id)
        return FeePlanCreateResponse(
            message="Fee plan created successfully",
            data=self._to_plan_out(created),
        )

    async def get_plan_by_student(self, student_id: int, institute_id: int) -> FeePlanOut:
        student = await self.student_repo.get_by_id(student_id, institute_id)
        if not student or not student.is_active:
            raise NotFoundError("Student")

        fee_plan = await self.repo.get_plan_by_student_id(student_id, institute_id)
        if not fee_plan:
            raise NotFoundError("Fee plan")

        return self._to_plan_out(fee_plan)

    async def pay_installment(
        self,
        installment_id: int,
        institute_id: int,
        amount: int,
    ) -> PayInstallmentResponse:
        installment = await self.repo.get_installment_by_id(installment_id, institute_id)
        if not installment:
            raise NotFoundError("Installment")

        if installment.status == "paid" or installment.paid_date:
            raise ConflictError("Installment is already paid")

        if amount <= 0:
            raise ValidationError("Payment amount must be greater than zero")

        fee_plan = installment.fee_plan
        today = date.today()

        installment.status = "paid"
        installment.paid_date = today
        installment.paid_amount = amount
        fee_plan.paid_amount += amount

        updated = await self.repo.save_plan(fee_plan, institute_id)
        return PayInstallmentResponse(
            message="Payment recorded",
            data=self._to_plan_out(updated),
        )

    async def get_defaulters(self, institute_id: int, class_id: int | None = None) -> list[DefaulterOut]:
        today = date.today()
        installments = await self.repo.get_unpaid_installments(today, institute_id)

        defaulters: list[DefaulterOut] = []
        for installment in installments:
            student = installment.fee_plan.student
            if not student or not student.is_active:
                continue
            if class_id is not None and student.class_id != class_id:
                continue

            defaulters.append(
                DefaulterOut(
                    student_id=student.id,
                    student_name=student.full_name,
                    class_name=student.class_name or "",
                    parent_phone=student.parent_phone,
                    pending_amount=installment.amount,
                    due_date=installment.due_date,
                    installment_id=installment.id,
                )
            )

        defaulters.sort(key=lambda item: (item.due_date, item.student_name.lower()))
        return defaulters

    async def get_defaulters_paginated(
        self,
        institute_id: int,
        class_id: int | None = None,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> PaginatedResponse[DefaulterOut]:
        page, page_size, _ = slice_page(page, page_size)
        all_items = await self.get_defaulters(institute_id, class_id)
        total = len(all_items)
        start = (page - 1) * page_size
        items = all_items[start : start + page_size]
        return build_paginated(items, total, page, page_size)

    def _summary_stats(self, summaries: list[FeeSummaryOut]) -> FeeOverviewStats:
        with_plan = [item for item in summaries if item.has_plan]
        collected = sum(item.paid_amount for item in with_plan)
        pending = sum(item.pending_amount for item in with_plan)
        overdue = sum(item.overdue_amount for item in with_plan)
        return FeeOverviewStats(collected=collected, pending=pending, overdue=overdue)

    async def _build_summaries(self, institute_id: int, class_id: int | None = None) -> list[FeeSummaryOut]:
        students = await self.repo.get_students_with_plans(institute_id, class_id)
        today = date.today()
        summaries: list[FeeSummaryOut] = []

        for student in students:
            fee_plan = student.fee_plan
            if not fee_plan:
                summaries.append(
                    FeeSummaryOut(
                        student_id=student.id,
                        student_name=student.full_name,
                        roll_number=student.roll_number,
                        class_name=student.class_name or "",
                        parent_phone=student.parent_phone,
                        has_plan=False,
                        total_amount=0,
                        paid_amount=0,
                        pending_amount=0,
                        overdue_amount=0,
                        status="none",
                    )
                )
                continue

            overdue_amount = 0
            has_overdue = False
            has_pending = False

            for installment in fee_plan.installments:
                status = self.resolve_installment_status(installment, today)
                if status == "overdue":
                    has_overdue = True
                    overdue_amount += installment.amount
                elif status == "pending":
                    has_pending = True

            pending_amount = max(fee_plan.total_amount - fee_plan.paid_amount, 0)

            if pending_amount == 0:
                status = "paid"
            elif has_overdue:
                status = "overdue"
            elif has_pending:
                status = "partial" if fee_plan.paid_amount > 0 else "pending"
            else:
                status = "partial"

            summaries.append(
                FeeSummaryOut(
                    student_id=student.id,
                    student_name=student.full_name,
                    roll_number=student.roll_number,
                    class_name=student.class_name or "",
                    parent_phone=student.parent_phone,
                    has_plan=True,
                    total_amount=fee_plan.total_amount,
                    paid_amount=fee_plan.paid_amount,
                    pending_amount=pending_amount,
                    overdue_amount=overdue_amount,
                    status=status,
                )
            )

        return summaries

    async def get_summaries(
        self,
        institute_id: int,
        class_id: int | None = None,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> FeeSummaryListOut:
        page, page_size, _ = slice_page(page, page_size)
        all_summaries = await self._build_summaries(institute_id, class_id)
        total = len(all_summaries)
        start = (page - 1) * page_size
        items = all_summaries[start : start + page_size]
        paginated = build_paginated(items, total, page, page_size)
        return FeeSummaryListOut(
            items=paginated.items,
            total=paginated.total,
            page=paginated.page,
            page_size=paginated.page_size,
            total_pages=paginated.total_pages,
            stats=self._summary_stats(all_summaries),
        )
