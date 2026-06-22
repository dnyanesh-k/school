from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.core.soft_delete import soft_delete
from app.core.roles import Role
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

    async def list_by_institute_ids(self, institute_ids: list[int]) -> dict[int, list[User]]:
        """Batch load users for multiple institutes in a single query."""
        if not institute_ids:
            return {}
        result = await self.db.execute(
            select(User)
            .where(
                User.institute_id.in_(institute_ids),
                User.is_deleted == False,
            )
            .order_by(User.full_name)
        )
        users = result.scalars().all()
        grouped: dict[int, list[User]] = {}
        for user in users:
            grouped.setdefault(user.institute_id, []).append(user)
        return grouped

    async def list_independent_students(
        self, page: int, page_size: int
    ) -> tuple[list[User], int]:
        base = select(User).where(
            User.role == Role.INDEPENDENT_STUDENT.value,
            User.is_deleted.is_(False),
        )
        count_result = await self.db.execute(select(func.count()).select_from(base.subquery()))
        total = count_result.scalar_one()

        result = await self.db.execute(
            base.order_by(User.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        return list(result.scalars().all()), total

    async def independent_student_stats(self) -> dict:
        """Returns aggregate counts for independent students."""
        base_filter = [
            User.role == Role.INDEPENDENT_STUDENT.value,
            User.is_deleted.is_(False),
        ]
        total_result = await self.db.execute(select(func.count()).where(*base_filter))
        active_result = await self.db.execute(select(func.count()).where(*base_filter, User.is_active.is_(True)))
        pending_result = await self.db.execute(select(func.count()).where(*base_filter, User.is_active.is_(False)))
        return {
            "total": total_result.scalar_one(),
            "active": active_result.scalar_one(),
            "pending": pending_result.scalar_one(),
        }

    async def delete(self, user: User) -> None:
        user.is_active = False
        await soft_delete(self.db, user)
