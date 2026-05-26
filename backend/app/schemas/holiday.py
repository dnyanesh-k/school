from datetime import date

from pydantic import BaseModel, Field


class HolidayCreate(BaseModel):
    date: date
    reason: str = Field(min_length=1, max_length=255)


class HolidayOut(BaseModel):
    id: int
    holiday_date: date
    reason: str

    model_config = {"from_attributes": True}
