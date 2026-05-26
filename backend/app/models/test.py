from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Test(Base):
    __tablename__ = "tests"
    __table_args__ = (
        Index("ix_tests_institute_date", "institute_id", "scheduled_date"),
        Index("ix_tests_institute_deleted", "institute_id", "is_deleted"),
    )

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    test_number = Column(Integer, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    total_marks = Column(Integer, nullable=False)
    scheduled_date = Column(Date, nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True),
                        server_default=func.now(), nullable=False)

    subject = relationship("Subject")
    class_ = relationship("Class")
    institute = relationship("Institute")
    scores = relationship("TestScore", back_populates="test", cascade="save-update, merge")

    @property
    def subject_name(self):
        return self.subject.name if self.subject else None

    @property
    def class_name(self):
        return self.class_.name if self.class_ else None

    @property
    def name(self):
        return self.title
