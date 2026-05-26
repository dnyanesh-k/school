from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(), nullable=False)

    subjects = relationship(
        "Subject", back_populates="class_", cascade="all, delete-orphan")
    students = relationship(
        "Student", back_populates="class_", cascade="all, delete-orphan")
