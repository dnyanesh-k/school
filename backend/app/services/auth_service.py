# services/auth_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.institute import Institute
from app.models.user import User
from app.repositories.institute_repository import InstituteRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest
from app.core.security import hash_password, verify_password
from app.core.exceptions import AppException


class AuthService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.institute_repo = InstituteRepository(db)
        self.user_repo = UserRepository(db)

    async def register(self, payload: RegisterRequest):

        existing = await self.institute_repo.get_by_email(payload.email)

        if existing:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                message="Institute email already registered",
                error_code = "AUTH_EMAIL_ALREADY_EXISTS"
            )

        # create institute
        institute = Institute(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            address=payload.address,
            city=payload.city,
            institute_type=payload.institute_type,
        )

        institute = await self.institute_repo.create(institute)

        # create admin user
        admin_user = User(
            email=payload.email,
            full_name=payload.admin_name,
            hashed_password=hash_password(payload.password),
            is_admin=True,
            institute_id=institute.id,
        )

        admin_user = await self.user_repo.create(admin_user)

        return admin_user 

    async def login(self, payload: LoginRequest):
    
        user = await self.user_repo.get_by_email(payload.email)
    
        if not user:
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid email or password",
                error_code="INVALID_CREDENTIALS",
            )
    
        if not verify_password(
            payload.password,
            user.hashed_password,
        ):
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid email or password",
                error_code="INVALID_CREDENTIALS",
            )
    
        if not user.is_active:
            raise AppException(
                status_code=status.HTTP_403_FORBIDDEN,
                message="User account disabled",
                error_code="USER_DISABLED",
            )
    
        return user