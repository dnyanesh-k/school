from pydantic import BaseModel, EmailStr
from typing import Optional

class StudentCreate(BaseModel):
    full_name: str
    email: EmailStr
    age: int

class StudentOut(BaseModel):
    id: int
    roll_number: str
    full_name: str
    email: str
    age: int

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None    

    model_config = {"from_attributes": True}
