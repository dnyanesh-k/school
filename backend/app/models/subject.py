from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Subject(Base):
    __tablename__ = "subjects"
    __table_args__ = (
        Index("ix_subjects_class_id", "class_id"),
        Index("ix_subjects_class_deleted", "class_id", "is_deleted"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(), nullable=False)

    class_ = relationship("Class", back_populates="subjects")
