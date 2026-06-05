# schemas/auth.py
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.core.roles import Role


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    city: str
    institute_type: str
    admin_name: str
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_admin: bool
    institute_id: Optional[int] = None
    institute_name: Optional[str] = None
    institute_status: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class RegisterResponse(BaseModel):
    success: bool = True
    message: str
    user: UserOut
    institute_status: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class CreateTeacherRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8)


class MessageResponse(BaseModel):
    message: str
