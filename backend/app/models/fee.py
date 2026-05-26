from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class FeePlan(Base):
    __tablename__ = "fee_plans"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True, nullable=False, index=True)
    total_amount = Column(Integer, nullable=False)
    paid_amount = Column(Integer, default=0, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    student = relationship("Student", back_populates="fee_plan")
    installments = relationship(
        "Installment",
        back_populates="fee_plan",
        cascade="save-update, merge",
        order_by="Installment.due_date",
    )


class Installment(Base):
    __tablename__ = "installments"
    __table_args__ = (Index("ix_installments_status_due", "status", "due_date"),)

    id = Column(Integer, primary_key=True, index=True)
    fee_plan_id = Column(Integer, ForeignKey("fee_plans.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False, index=True)
    paid_date = Column(Date, nullable=True)
    status = Column(String, default="pending", nullable=False)  # pending | paid
    is_deleted = Column(Boolean, default=False, nullable=False)

    fee_plan = relationship("FeePlan", back_populates="installments")
