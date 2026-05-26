from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.soft_delete import soft_delete
from app.models.admission import Admission
from app.models.student import Student


class AdmissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, admission: Admission) -> Admission:
        self.db.add(admission)
        await self.db.commit()
        await self.db.refresh(admission)
        return admission

    async def get_by_id(self, admission_id: int, institute_id: int) -> Admission | None:
        result = await self.db.execute(
            select(Admission)
            .join(Student, Admission.roll_number == Student.roll_number)
            .where(
                Admission.id == admission_id,
                Admission.is_deleted == False,
                Student.institute_id == institute_id,
            )
        )
        return result.scalars().first()

    async def list_all(self, institute_id: int) -> list[Admission]:
        result = await self.db.execute(
            select(Admission)
            .join(Student, Admission.roll_number == Student.roll_number)
            .where(
                Student.institute_id == institute_id,
                Admission.is_deleted == False,
            )
        )
        return list(result.scalars().all())

    async def update(self, admission: Admission) -> Admission:
        await self.db.commit()
        await self.db.refresh(admission)
        return admission

    async def delete(self, admission: Admission) -> Admission:
        await soft_delete(self.db, admission)
        return admission
