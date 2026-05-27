from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.fee import PayInstallmentRequest, PayInstallmentResponse
from app.services.fee_service import FeeService

router = APIRouter(prefix="/installments", tags=["installments"])


@router.put("/{installment_id}/pay", response_model=PayInstallmentResponse)
async def pay_installment(
    installment_id: int,
    payload: PayInstallmentRequest,
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    service = FeeService(db)
    return await service.pay_installment(
        installment_id,
        institute_id_of(current_user),
        payload.amount,
    )
