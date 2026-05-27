import enum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.session import Base


class AdmissionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )
    status = Column(Enum(AdmissionStatus), default=AdmissionStatus.PENDING)
    applied_date = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
