from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


class InstallmentCreate(BaseModel):
    amount: int = Field(gt=0)
    due_date: date


class FeePlanCreate(BaseModel):
    student_id: int
    total_amount: int = Field(gt=0)
    installments: list[InstallmentCreate] = Field(min_length=1)

    @field_validator("installments")
    @classmethod
    def validate_installments(cls, installments: list[InstallmentCreate]) -> list[InstallmentCreate]:
        if not installments:
            raise ValueError("At least one installment is required")
        return installments


class InstallmentOut(BaseModel):
    id: int
    amount: int
    due_date: date
    paid_date: Optional[date] = None
    paid_amount: Optional[int] = None
    status: Literal["pending", "paid", "overdue", "partial"]

    model_config = {"from_attributes": True}


class FeePlanOut(BaseModel):
    id: int
    student_id: int
    total_amount: int
    paid_amount: int
    installments: list[InstallmentOut]


class FeePlanCreateResponse(BaseModel):
    success: bool = True
    message: str
    data: FeePlanOut


class PayInstallmentRequest(BaseModel):
    amount: int = Field(gt=0, description="Actual amount received from the parent")


class PayInstallmentResponse(BaseModel):
    success: bool = True
    message: str
    data: FeePlanOut


class DefaulterOut(BaseModel):
    student_id: int
    student_name: str
    class_name: str
    parent_phone: str
    pending_amount: int
    due_date: date
    installment_id: int


class FeeSummaryOut(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    class_name: str
    parent_phone: str
    has_plan: bool
    total_amount: int
    paid_amount: int
    pending_amount: int
    overdue_amount: int
    status: Literal["none", "paid", "partial", "overdue", "pending"]


class FeeOverviewStats(BaseModel):
    collected: int
    pending: int
    overdue: int


class FeeSummaryListOut(BaseModel):
    items: list[FeeSummaryOut]
    total: int
    page: int
    page_size: int
    total_pages: int
    stats: FeeOverviewStats
