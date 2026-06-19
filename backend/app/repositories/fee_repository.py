from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.soft_delete import soft_delete
from app.models.fee import FeePlan, Installment
from app.models.student import Student


class FeeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_plan(self, fee_plan: FeePlan, institute_id: int) -> FeePlan:
        self.db.add(fee_plan)
        await self.db.commit()
        await self.db.refresh(fee_plan)
        return await self.get_plan_by_id(fee_plan.id, institute_id)

    async def get_plan_by_id(self, plan_id: int, institute_id: int) -> FeePlan | None:
        result = await self.db.execute(
            select(FeePlan)
            .join(Student, FeePlan.student_id == Student.id)
            .options(
                selectinload(FeePlan.installments),
                selectinload(FeePlan.student).selectinload(Student.class_),
            )
            .where(
                FeePlan.id == plan_id,
                FeePlan.is_deleted == False,
                Student.institute_id == institute_id,
            )
        )
        return result.scalars().first()

    async def get_plan_by_student_id(self, student_id: int, institute_id: int) -> FeePlan | None:
        result = await self.db.execute(
            select(FeePlan)
            .join(Student, FeePlan.student_id == Student.id)
            .options(selectinload(FeePlan.installments))
            .where(
                FeePlan.student_id == student_id,
                FeePlan.is_deleted == False,
                Student.institute_id == institute_id,
            )
        )
        return result.scalars().first()

    async def get_installment_by_id(self, installment_id: int, institute_id: int) -> Installment | None:
        result = await self.db.execute(
            select(Installment)
            .join(FeePlan, Installment.fee_plan_id == FeePlan.id)
            .join(Student, FeePlan.student_id == Student.id)
            .options(
                selectinload(Installment.fee_plan)
                .selectinload(FeePlan.student)
                .selectinload(Student.class_),
            )
            .where(
                Installment.id == installment_id,
                Installment.is_deleted == False,
                FeePlan.is_deleted == False,
                Student.institute_id == institute_id,
            )
        )
        return result.scalars().first()

    async def save_plan(self, fee_plan: FeePlan, institute_id: int) -> FeePlan:
        await self.db.commit()
        await self.db.refresh(fee_plan)
        return await self.get_plan_by_id(fee_plan.id, institute_id)

    async def get_students_with_plans(
        self,
        institute_id: int,
        class_id: int | None = None,
    ) -> list[Student]:
        stmt = (
            select(Student)
            .options(
                selectinload(Student.class_),
                selectinload(Student.fee_plan).selectinload(FeePlan.installments),
            )
            .where(
                Student.institute_id == institute_id,
                Student.is_deleted == False,
                Student.is_active == True,
            )
        )
        if class_id is not None:
            stmt = stmt.where(Student.class_id == class_id)

        result = await self.db.execute(stmt.order_by(Student.full_name))
        return list(result.scalars().all())

    async def get_unpaid_installments(self, as_of: date, institute_id: int) -> list[Installment]:
        result = await self.db.execute(
            select(Installment)
            .join(FeePlan, Installment.fee_plan_id == FeePlan.id)
            .join(Student, FeePlan.student_id == Student.id)
            .options(
                selectinload(Installment.fee_plan)
                .selectinload(FeePlan.student)
                .selectinload(Student.class_),
            )
            .where(
                Installment.status != "paid",
                Installment.is_deleted == False,
                FeePlan.is_deleted == False,
                Installment.due_date <= as_of,
                Student.institute_id == institute_id,
            )
            .order_by(Installment.due_date)
        )
        return list(result.scalars().all())

    async def get_due_soon_installments(
        self, from_date: date, to_date: date, institute_id: int
    ) -> list[Installment]:
        """Pending installments with due_date in (from_date, to_date] — not yet overdue."""
        result = await self.db.execute(
            select(Installment)
            .join(FeePlan, Installment.fee_plan_id == FeePlan.id)
            .join(Student, FeePlan.student_id == Student.id)
            .options(
                selectinload(Installment.fee_plan)
                .selectinload(FeePlan.student)
                .selectinload(Student.class_),
            )
            .where(
                Installment.status != "paid",
                Installment.is_deleted == False,
                FeePlan.is_deleted == False,
                Installment.due_date > from_date,
                Installment.due_date <= to_date,
                Student.institute_id == institute_id,
            )
            .order_by(Installment.due_date)
        )
        return list(result.scalars().all())

    async def delete_plan(self, fee_plan: FeePlan) -> None:
        for installment in fee_plan.installments:
            installment.is_deleted = True
        await soft_delete(self.db, fee_plan)
