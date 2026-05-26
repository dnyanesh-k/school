from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ClassCreate(BaseModel):
    name: str


class ClassUpdate(BaseModel):
    name: Optional[str] = None

    model_config = {"from_attributes": True}


class ClassOut(BaseModel):
    id: int
    name: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
