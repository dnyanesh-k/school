import asyncio

from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.roles import InstituteStatus, Role
from app.core.security import hash_password, verify_password
from app.core.exceptions import AppException, ConflictError, ForbiddenError, NotFoundError
from app.models.institute import Institute
from app.models.user import User
from app.repositories.institute_repository import InstituteRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import CreateTeacherRequest, LoginRequest, RegisterRequest, RegisterResponse, UserOut
from app.services.email_service import send_welcome_email


def to_user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        is_admin=user.is_admin,
        institute_id=user.institute_id,
        institute_name=user.institute.name if user.institute else None,
        institute_status=user.institute.status if user.institute else None,
        is_active=user.is_active,
    )


class AuthService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.institute_repo = InstituteRepository(db)
        self.user_repo = UserRepository(db)

    async def _validate_institute_access(self, user: User) -> None:
        if user.role == Role.PLATFORM_ADMIN.value:
            return

        if not user.institute_id:
            raise ForbiddenError("No institute linked to this account")

        institute = await self.institute_repo.get_by_id(user.institute_id)
        if not institute:
            raise NotFoundError("Institute")

        if institute.status == InstituteStatus.PENDING.value:
            raise AppException(
                status_code=status.HTTP_403_FORBIDDEN,
                message="Your institute registration is pending approval",
                error_code="INSTITUTE_PENDING",
            )

        if institute.status == InstituteStatus.REJECTED.value:
            raise AppException(
                status_code=status.HTTP_403_FORBIDDEN,
                message="Your institute registration was rejected",
                error_code="INSTITUTE_REJECTED",
            )

        if institute.status == InstituteStatus.SUSPENDED.value:
            raise AppException(
                status_code=status.HTTP_403_FORBIDDEN,
                message="Your institute account is suspended",
                error_code="INSTITUTE_SUSPENDED",
            )

    async def register(self, payload: RegisterRequest) -> RegisterResponse:
        existing = await self.institute_repo.get_by_email(payload.email)

        if existing:
            raise ConflictError("Institute email already registered")

        existing_user = await self.user_repo.get_by_email(payload.email)
        if existing_user:
            raise ConflictError("Email already registered")

        institute = Institute(
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            address=payload.address,
            city=payload.city,
            institute_type=payload.institute_type,
            status=InstituteStatus.PENDING.value,
        )

        institute = await self.institute_repo.create(institute)

        admin_user = User(
            email=payload.email,
            full_name=payload.admin_name,
            hashed_password=hash_password(payload.password),
            role=Role.INSTITUTE_ADMIN.value,
            is_admin=True,
            institute_id=institute.id,
        )

        admin_user = await self.user_repo.create(admin_user)
        await self.db.commit()
        await self.db.refresh(admin_user, attribute_names=["institute"])

        asyncio.create_task(
            send_welcome_email(
                to_email=payload.email,
                admin_name=payload.admin_name,
                institute_name=payload.name,
            )
        )

        return RegisterResponse(
            message="Registration submitted. Your institute will be reviewed by our team.",
            user=to_user_out(admin_user),
            institute_status=institute.status,
        )

    async def login(self, payload: LoginRequest) -> User:
        user = await self.user_repo.get_by_email(payload.email)

        if not user:
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                message="Invalid email or password",
                error_code="INVALID_CREDENTIALS",
            )

        if not verify_password(payload.password, user.hashed_password):
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

        if user.institute_id:
            institute = await self.institute_repo.get_by_id(user.institute_id)
            user.institute = institute

        await self._validate_institute_access(user)
        return user

    async def create_teacher(
        self,
        actor: User,
        payload: CreateTeacherRequest,
    ) -> UserOut:
        if actor.role not in {Role.INSTITUTE_ADMIN.value, Role.TEACHER.value}:
            raise ForbiddenError("You do not have permission to add teachers")

        if not actor.institute_id:
            raise ForbiddenError("No institute linked to this account")

        existing = await self.user_repo.get_by_email(payload.email)
        if existing:
            raise ConflictError("Email already registered")

        teacher = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            role=Role.TEACHER.value,
            is_admin=False,
            institute_id=actor.institute_id,
        )

        created = await self.user_repo.create(teacher)
        await self.db.commit()
        await self.db.refresh(created)

        return to_user_out(created)

    async def list_teachers(self, actor: User) -> list[UserOut]:
        if actor.role not in {Role.INSTITUTE_ADMIN.value, Role.TEACHER.value}:
            raise ForbiddenError("You do not have permission to view teachers")

        if not actor.institute_id:
            raise ForbiddenError("No institute linked to this account")

        users = await self.user_repo.list_by_institute(actor.institute_id)
        return [to_user_out(user) for user in users if user.role == Role.TEACHER.value]
