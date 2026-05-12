from pydantic import BaseModel, EmailStr

class StudentCreate(BaseModel):
    full_name: str
    email: EmailStr
    age: int

class StudentOut(BaseModel):
    id: int
    full_name: str
    email: str
    age: int

    model_config = {"from_attributes": True}
