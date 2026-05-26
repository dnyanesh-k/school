from datetime import date
from pydantic import BaseModel
from typing import Optional


class StudentCreate(BaseModel):
    full_name: str
    admission_date: date
    class_id: int
    parent_name: str
    parent_phone: str
    address: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    roll_number: str
    full_name: str
    admission_date: date
    class_id: int
    parent_name: str
    parent_phone: str
    address: Optional[str] = None
    is_active: bool
    class_name: Optional[str] = None

    model_config = {"from_attributes": True}


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    admission_date: Optional[date] = None
    class_id: Optional[int] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    address: Optional[str] = None

    model_config = {"from_attributes": True}
