from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base


class Student(Base):
    __tablename__ = "students"
    __table_args__ = (
        UniqueConstraint("institute_id", "roll_number", name="uq_student_institute_roll"),
        Index("ix_students_institute_class", "institute_id", "class_id"),
        Index("ix_students_institute_deleted", "institute_id", "is_deleted"),
    )

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False, index=True)
    roll_number = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    admission_date = Column(Date, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    parent_name = Column(String, nullable=False)
    parent_phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    # Parent portal access
    parent_token = Column(String(36), unique=True, nullable=True, index=True)
    parent_pin_hash = Column(String, nullable=True)
    parent_scan_count = Column(Integer, nullable=False, server_default="0")   # resets daily
    parent_scan_date = Column(Date, nullable=True)                            # IST date of last successful scan
    parent_pin_attempts = Column(Integer, nullable=False, server_default="0") # wrong PIN attempts today
    parent_last_scan_at = Column(DateTime(timezone=True), nullable=True)      # exact timestamp of last successful scan (never resets)
    parent_total_scans = Column(Integer, nullable=False, server_default="0")  # lifetime scan count (never resets)

    institute = relationship("Institute")
    class_ = relationship("Class", back_populates="students")
    fee_plan = relationship("FeePlan", back_populates="student", uselist=False)

    @property
    def class_name(self):
        return self.class_.name if self.class_ else None
