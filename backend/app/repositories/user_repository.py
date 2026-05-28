from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.soft_delete import soft_delete
from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(
                func.lower(User.email) == email.strip().lower(),
                User.is_deleted == False,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()   # writes to DB, but doesn't commit yet
        return user

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.institute))
            .where(User.id == user_id, User.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def list_by_institute(self, institute_id: int) -> list[User]:
        result = await self.db.execute(
            select(User)
            .where(
                User.institute_id == institute_id,
                User.is_deleted == False,
            )
            .order_by(User.full_name)
        )
        return list(result.scalars().all())

    async def delete(self, user: User) -> None:
        user.is_active = False
        await soft_delete(self.db, user)
