from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Class(Base):
    __tablename__ = "classes"
    __table_args__ = (
        UniqueConstraint("institute_id", "name", name="uq_class_institute_name"),
        Index("ix_classes_institute_deleted", "institute_id", "is_deleted"),
    )

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    institute = relationship("Institute")
    subjects = relationship("Subject", back_populates="class_")
    students = relationship("Student", back_populates="class_")
