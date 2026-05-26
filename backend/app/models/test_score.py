from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class TestScore(Base):
    __tablename__ = "test_scores"
    __table_args__ = (
        UniqueConstraint("test_id", "student_id", name="uq_test_student_score"),
    )

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    marks_obtained = Column(Integer, nullable=False)
    remarks = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    test = relationship("Test", back_populates="scores")
    student = relationship("Student")
