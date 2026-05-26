from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SubjectCreate(BaseModel):
    name: str


class SubjectUpdate(BaseModel):
    name: Optional[str] = None

    model_config = {"from_attributes": True}


class SubjectOut(BaseModel):
    id: int
    name: str
    class_id: int
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
