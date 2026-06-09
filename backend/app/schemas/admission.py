from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel

AdmissionStatus = Literal["inquiry", "follow_up", "admitted", "rejected"]


class AdmissionCreate(BaseModel):
    candidate_name: str
    parent_name: str
    phone: str
    class_id: int
    visit_date: date
    status: AdmissionStatus = "inquiry"


class AdmissionUpdate(BaseModel):
    candidate_name: Optional[str] = None
    parent_name: Optional[str] = None
    phone: Optional[str] = None
    class_id: Optional[int] = None
    visit_date: Optional[date] = None
    status: Optional[AdmissionStatus] = None


class AdmissionOut(BaseModel):
    id: int
    candidate_name: str
    parent_name: str
    phone: str
    class_id: int
    class_name: Optional[str] = None
    visit_date: date
    status: str
    converted_student_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AdmissionConvertOut(BaseModel):
    """Returned after a successful admission → student conversion."""
    admission_id: int
    student_id: int
    roll_number: str
