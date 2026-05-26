from datetime import date, datetime
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"


class AttendanceStudentOut(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    status: Literal["present", "absent"]


class AttendanceSummaryOut(BaseModel):
    total: int
    present: int
    absent: int


class ClassAttendanceOut(BaseModel):
    class_id: int
    class_name: str
    date: date
    is_holiday: bool
    holiday_reason: Optional[str] = None
    is_submitted: bool = False
    submitted_at: Optional[datetime] = None
    students: list[AttendanceStudentOut]
    summary: AttendanceSummaryOut


class AttendanceMarkItem(BaseModel):
    student_id: int
    status: Literal["present", "absent"]

    @field_validator("status")
    @classmethod
    def normalize_status(cls, value: str) -> str:
        return value.lower()


class AttendanceMarkRequest(BaseModel):
    class_id: int
    date: date
    records: list[AttendanceMarkItem] = Field(default_factory=list)

    @field_validator("records")
    @classmethod
    def absents_only(cls, records: list[AttendanceMarkItem]) -> list[AttendanceMarkItem]:
        for item in records:
            if item.status != "absent":
                raise ValueError("Only absent students should be submitted; present is the default")
        return records


class AttendanceMarkResult(BaseModel):
    class_id: int
    date: date
    present: int
    absent: int
    saved: int
    is_submitted: bool = True
    submitted_at: datetime


class AttendanceMarkResponse(BaseModel):
    success: bool = True
    message: str
    data: AttendanceMarkResult


class AbsentStreakOut(BaseModel):
    student_id: int
    student_name: str
    class_name: str
    parent_phone: str
    absent_days: int
