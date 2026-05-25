# models/user.py

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False)

    full_name = Column(String, nullable=False)

    hashed_password = Column(String, nullable=False)

    is_admin = Column(Boolean, default=False)

    institute_id = Column(Integer, ForeignKey("institutes.id"))

    institute = relationship("Institute", back_populates="users")

    is_active = Column(Boolean, default=True)