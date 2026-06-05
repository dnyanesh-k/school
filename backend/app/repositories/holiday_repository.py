from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.core.soft_delete import soft_delete
from app.models.holiday import Holiday


class HolidayRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, holiday: Holiday) -> Holiday:
        existing = await self.get_by_date_including_deleted(holiday.holiday_date, holiday.institute_id)
        if existing:
            if not existing.is_deleted:
                raise ConflictError("Holiday already exists for this date")
            existing.reason = holiday.reason
            existing.is_deleted = False
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        self.db.add(holiday)
        await self.db.commit()
        await self.db.refresh(holiday)
        return holiday

    async def get_by_date(self, holiday_date: date, institute_id: int) -> Holiday | None:
        result = await self.db.execute(
            select(Holiday).where(
                Holiday.holiday_date == holiday_date,
                Holiday.institute_id == institute_id,
                Holiday.is_deleted == False,
            )
        )
        return result.scalars().first()

    async def get_by_date_including_deleted(
        self,
        holiday_date: date,
        institute_id: int,
    ) -> Holiday | None:
        result = await self.db.execute(
            select(Holiday).where(
                Holiday.holiday_date == holiday_date,
                Holiday.institute_id == institute_id,
            )
        )
        return result.scalars().first()

    async def list_all(self, institute_id: int) -> list[Holiday]:
        result = await self.db.execute(
            select(Holiday)
            .where(Holiday.institute_id == institute_id, Holiday.is_deleted == False)
            .order_by(Holiday.holiday_date.desc())
        )
        return list(result.scalars().all())

    async def list_between(
        self,
        institute_id: int,
        start_date: date,
        end_date: date,
    ) -> list[Holiday]:
        result = await self.db.execute(
            select(Holiday).where(
                Holiday.institute_id == institute_id,
                Holiday.holiday_date >= start_date,
                Holiday.holiday_date <= end_date,
                Holiday.is_deleted == False,
            )
        )
        return list(result.scalars().all())

    async def delete(self, holiday: Holiday) -> None:
        await soft_delete(self.db, holiday)
