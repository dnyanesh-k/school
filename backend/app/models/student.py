from sqlalchemy import Boolean, Column, Date, ForeignKey, Index, Integer, String, UniqueConstraint
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

    institute = relationship("Institute")
    class_ = relationship("Class", back_populates="students")
    fee_plan = relationship("FeePlan", back_populates="student", uselist=False)

    @property
    def class_name(self):
        return self.class_.name if self.class_ else None
