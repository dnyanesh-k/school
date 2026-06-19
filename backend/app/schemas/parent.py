from pydantic import BaseModel


class ShareQrResponse(BaseModel):
    token: str
    pin: str            # plain PIN — shown once, stored only as hash
    student_name: str
    parent_name: str
    parent_phone: str


class PinVerifyRequest(BaseModel):
    pin: str


class LastTestScore(BaseModel):
    subject: str
    marks_obtained: int
    total_marks: int
    test_title: str


class ParentStudentView(BaseModel):
    first_name: str
    class_name: str
    last_test: LastTestScore | None = None
    fees_due: int = 0
    next_due_date: str | None = None   # "15 Jul 2025"
    next_due_amount: int | None = None
    notes_url: str | None = None
