from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdmissionCreate(BaseModel):
    roll_number: str
    remarks: Optional[str] = None

class AdmissionUpdate(BaseModel):
    status: str # "approved" or "rejected"
    remarks: Optional[str] = None

class AdmissionOut(BaseModel):
    id: int
    roll_number: str
    status: str
    applied_date: datetime
    remarks: Optional[str]

    model_config = {"from_attributes": True}
