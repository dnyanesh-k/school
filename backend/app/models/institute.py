# models/institute.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Institute(Base):
    __tablename__ = "institutes"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)

    institute_type = Column(String, nullable=False)

    users = relationship("User", back_populates="institute")