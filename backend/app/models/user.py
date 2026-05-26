# models/user.py

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.roles import Role
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String, unique=True, nullable=False)

    full_name = Column(String, nullable=False)

    hashed_password = Column(String, nullable=False)

    role = Column(String, default=Role.TEACHER.value, nullable=False, index=True)

    # Legacy flag — kept for backward compatibility with existing clients
    is_admin = Column(Boolean, default=False)

    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=True, index=True)

    institute = relationship("Institute", back_populates="users")

    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False, nullable=False)

    @property
    def institute_status(self) -> str | None:
        return self.institute.status if self.institute else None
