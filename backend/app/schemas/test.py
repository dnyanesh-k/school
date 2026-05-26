from pydantic import BaseModel, Field
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
    scores_entered: int = 0

    model_config = {"from_attributes": True}


class TestScoreItem(BaseModel):
    student_id: int
    marks_obtained: int = Field(ge=0)
    remarks: str = ""


class TestScoreSubmitRequest(BaseModel):
    scores: list[TestScoreItem] = Field(min_length=1)


class TestScoreOut(BaseModel):
    student_id: int
    student_name: str
    parent_phone: str
    roll_number: str
    marks_obtained: Optional[int] = None
    remarks: Optional[str] = None


class TestScoreSubmitResponse(BaseModel):
    success: bool = True
    message: str
    saved: int
    test: TestOut
