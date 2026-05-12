from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.admission import Admission

class AdmissionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, admission: Admission) -> Admission:
        self.db.add(admission)
        await self.db.commit()
        await self.db.refresh(admission)
        return admission

    async def get_by_id(self, admission_id: int) -> Admission | None:
        return await self.db.get(Admission, admission_id)

    async def list_all(self) -> list[Admission]:
        result = await self.db.execute(select(Admission))
        return result.scalars().all()

    async def update(self, admission: Admission) -> Admission:
        await self.db.commit()
        await self.db.refresh(admission)
        return admission
