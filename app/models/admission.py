import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class AdmissionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String, ForeignKey("students.roll_number"), nullable=False)
    status = Column(Enum(AdmissionStatus), default=AdmissionStatus.PENDING)
    applied_date = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(String, nullable=True)
