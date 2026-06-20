# models/institute.py

from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.core.roles import InstituteStatus
from app.db.session import Base


class Institute(Base):
    __tablename__ = "institutes"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    city = Column(String, nullable=False)

    institute_type = Column(String, nullable=False)
    status = Column(String, default=InstituteStatus.PENDING.value, nullable=False, index=True)
    drive_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_dashboard_access = Column(DateTime(timezone=True), nullable=True)

    users = relationship("User", back_populates="institute")
