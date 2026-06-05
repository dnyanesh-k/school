from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


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

    model_config = {"from_attributes": True}


class InstituteStatusUpdate(BaseModel):
    status: Literal["active", "rejected", "suspended"]


class AdminStatsOut(BaseModel):
    total: int
    pending: int
    active: int
    rejected: int
    suspended: int


class InstituteStatusUpdateResponse(BaseModel):
    success: bool = True
    message: str
    institute: InstituteOut
