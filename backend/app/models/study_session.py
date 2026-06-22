from sqlalchemy import Column, DateTime, ForeignKey, Integer, Index
from sqlalchemy.orm import relationship

from app.db.session import Base


class StudySession(Base):
    __tablename__ = "study_sessions"
    __table_args__ = (
        Index("ix_study_sessions_user_ended", "user_id", "ended_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("study_subjects.id"), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)  # NULL = session still active

    user = relationship("User")
    subject = relationship("StudySubject", back_populates="sessions")
