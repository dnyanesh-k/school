# repositories/institute_repository.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.institute import Institute


class InstituteRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str):
        result = await self.db.execute(
            select(Institute).where(Institute.email == email)
        )
        return result.scalar_one_or_none()

    async def create(self, institute: Institute):
        self.db.add(institute)
        await self.db.commit()
        await self.db.refresh(institute)
        return institute