from app.models.admission import Admission
from app.models.attendance import Attendance, AttendanceSubmission
from app.models.class_ import Class
from app.models.fee import FeePlan, Installment
from app.models.holiday import Holiday
from app.models.institute import Institute
from app.models.student import Student
from app.models.subject import Subject
from app.models.test import Test
from app.models.test_score import TestScore
from app.models.user import User

__all__ = [
    "Admission",
    "Attendance",
    "AttendanceSubmission",
    "Class",
    "FeePlan",
    "Holiday",
    "Installment",
    "Institute",
    "Student",
    "Subject",
    "Test",
    "TestScore",
    "User",
]
