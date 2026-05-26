from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, UniqueConstraint

from app.db.session import Base


class Holiday(Base):
    __tablename__ = "holidays"
    __table_args__ = (
        UniqueConstraint("institute_id", "holiday_date", name="uq_holiday_institute_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    institute_id = Column(Integer, ForeignKey("institutes.id"), nullable=False, index=True)
    holiday_date = Column(Date, nullable=False, index=True)
    reason = Column(String, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
