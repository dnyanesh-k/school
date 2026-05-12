from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.admission import Admission, AdmissionStatus
from app.repositories.admission_repository import AdmissionRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.admission import AdmissionCreate, AdmissionUpdate

class AdmissionService:
    def __init__(self, db: AsyncSession):
        self.repo = AdmissionRepository(db)
        self.student_repo = StudentRepository(db)

    async def apply(self, payload: AdmissionCreate):
        # 1. Verify student exists
        student = await self.student_repo.get_by_roll_number(payload.roll_number)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # 2. Map DTO to Model
        admission = Admission(**payload.model_dump())
        return await self.repo.create(admission)

    async def update_status(self, admission_id: int, payload: AdmissionUpdate):
        admission = await self.repo.get_by_id(admission_id)
        if not admission:
            raise HTTPException(status_code=404, detail="Admission not found")
        
        admission.status = payload.status
        if payload.remarks:
            admission.remarks = payload.remarks
            
        return await self.repo.update(admission)

    async def get_all_admissions(self):
        return await self.repo.list_all()
