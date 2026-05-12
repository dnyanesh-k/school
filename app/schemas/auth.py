from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):      # ← RegisterRequestDTO
    email: EmailStr
    full_name: str
    password: str

class UserOut(BaseModel):              # ← UserResponseDTO
    id: int
    email: str
    full_name: str
    is_admin: bool
    is_active: bool

class LoginRequest(BaseModel):         # ← LoginRequestDTO
    email: EmailStr
    password: str

    model_config = {"from_attributes": True}

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut  # This nests your existing UserOut DTO

