from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admission import Admission
from app.repositories.admission_repository import AdmissionRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.admission import AdmissionCreate, AdmissionUpdate


class AdmissionService:
    def __init__(self, db: AsyncSession):
        self.repo = AdmissionRepository(db)
        self.student_repo = StudentRepository(db)

    async def apply(self, payload: AdmissionCreate, institute_id: int):
        student = await self.student_repo.get_by_roll_number(payload.roll_number, institute_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        admission = Admission(**payload.model_dump())
        return await self.repo.create(admission)

    async def update_status(self, admission_id: int, payload: AdmissionUpdate, institute_id: int):
        admission = await self.repo.get_by_id(admission_id, institute_id)
        if not admission:
            raise HTTPException(status_code=404, detail="Admission not found")

        admission.status = payload.status
        if payload.remarks:
            admission.remarks = payload.remarks

        return await self.repo.update(admission)

    async def get_all_admissions(self, institute_id: int):
        return await self.repo.list_all(institute_id)
