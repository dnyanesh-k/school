from sqlalchemy import Column, Date, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint("student_id", "attendance_date", name="uq_student_attendance_date"),
        Index("ix_attendance_class_date", "class_id", "attendance_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False, index=True)
    attendance_date = Column(Date, nullable=False, index=True)
    status = Column(String, nullable=False)  # present | absent
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    student = relationship("Student")
    class_ = relationship("Class")


class AttendanceSubmission(Base):
    """Tracks that attendance was explicitly saved for a class on a date."""

    __tablename__ = "attendance_submissions"
    __table_args__ = (
        UniqueConstraint("institute_id", "class_id", "attendance_date", name="uq_attendance_submission"),
        Index("ix_attendance_submissions_class_date", "class_id", "attendance_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False, index=True)
    attendance_date = Column(Date, nullable=False, index=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
