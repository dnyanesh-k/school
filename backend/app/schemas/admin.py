from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, EmailStr


class InstituteAdminOut(BaseModel):
    id: int
    full_name: str
    email: str


class InstituteOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    city: str
    institute_type: str
    status: str
    created_at: datetime
    admin: Optional[InstituteAdminOut] = None
    student_count: int = 0
    last_attendance_date: Optional[date] = None
    last_dashboard_access: Optional[datetime] = None
    # Parent QR engagement stats
    qr_generated: int = 0
    parents_scanned: int = 0
    parent_last_scan_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class InstituteStatusUpdate(BaseModel):
    status: Literal["active", "rejected", "suspended"]


class AdminStatsOut(BaseModel):
    total: int
    pending: int
    active: int
    rejected: int
    suspended: int
    total_students: int
    institutes_used_this_week: int
    # Independent student stats
    independent_students_total: int = 0
    independent_students_active: int = 0
    independent_students_pending: int = 0
    independent_students_active_this_week: int = 0
    independent_students_total_hours: float = 0.0


class InstituteStatusUpdateResponse(BaseModel):
    success: bool = True
    message: str
    institute: InstituteOut


class IndependentStudentOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    is_active: bool
    total_sessions: int = 0
    total_hours: float = 0.0
    last_session_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class StudentAccessUpdate(BaseModel):
    is_active: bool
