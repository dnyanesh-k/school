from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Admission(Base):
    """
    Pre-student candidate record. Tracks enquiries before a student is enrolled.
    Status flow: inquiry → follow_up → admitted → (converted to Student) | rejected
    """
    __tablename__ = "admissions"
    __table_args__ = (
        Index("ix_admissions_institute_status", "institute_id", "status"),
        Index("ix_admissions_institute_deleted", "institute_id", "is_deleted"),
    )

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False, index=True)
    candidate_name = Column(String, nullable=False)
    parent_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    visit_date = Column(Date, nullable=False)
    # inquiry | follow_up | admitted | rejected
    status = Column(String(20), nullable=False, default="inquiry")
    # set when admission is converted to a Student record
    converted_student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    class_ = relationship("Class")
    converted_student = relationship("Student", foreign_keys=[converted_student_id])

    @property
    def class_name(self) -> str | None:
        return self.class_.name if self.class_ else None
