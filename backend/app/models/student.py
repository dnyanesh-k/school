from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    admission_date = Column(Date, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    parent_name = Column(String, nullable=False)
    parent_phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

    class_ = relationship("Class", back_populates="students")

    @property
    def class_name(self):
        return self.class_.name if self.class_ else None
