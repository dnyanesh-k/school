from pydantic import BaseModel
from datetime import date
from typing import Optional


class TestCreate(BaseModel):
    title: str
    test_number: int
    subject_id: int
    class_id: int
    max_marks: int
    scheduled_date: date


class TestOut(BaseModel):
    id: int
    title: str
    name: str
    test_number: int
    subject_id: int
    subject: Optional[str] = None
    class_id: int
    class_name: Optional[str] = None
    total_marks: int
    scheduled_date: date
    is_published: bool

    model_config = {"from_attributes": True}
