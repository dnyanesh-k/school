from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.admission import AdmissionCreate, AdmissionOut, AdmissionUpdate
from app.services.admission_service import AdmissionService

router = APIRouter(prefix="/admissions", tags=["admissions"])

@router.post("/", response_model=AdmissionOut, status_code=status.HTTP_201_CREATED)
async def apply_for_admission(payload: AdmissionCreate, db: AsyncSession = Depends(get_db)):
    service = AdmissionService(db)
    return await service.apply(payload)

@router.get("/", response_model=list[AdmissionOut])
async def list_admissions(db: AsyncSession = Depends(get_db)):
    service = AdmissionService(db)
    return await service.get_all_admissions()

@router.patch("/{admission_id}", response_model=AdmissionOut)
async def update_admission_status(
    admission_id: int, 
    payload: AdmissionUpdate, 
    db: AsyncSession = Depends(get_db)
):
    service = AdmissionService(db)
    return await service.update_status(admission_id, payload)
