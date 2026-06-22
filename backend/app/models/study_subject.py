from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class StudySubject(Base):
    __tablename__ = "study_subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    daily_target_hours = Column(Numeric(4, 1), nullable=False, default=1.0)
    display_order = Column(Integer, default=0, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    user = relationship("User")
    sessions = relationship("StudySession", back_populates="subject")
