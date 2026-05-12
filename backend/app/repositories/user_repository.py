from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()   # writes to DB, but doesn't commit yet
        return user