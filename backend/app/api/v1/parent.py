"""
Parent portal — two routes:
  POST /students/{student_id}/share-qr   (institute user auth)
  POST /public/parent/{token}            (no auth — PIN-protected)
"""
import random
import uuid
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.exceptions import NotFoundError, ValidationError
from app.core.security import hash_password, verify_password
from app.core.tenant import institute_id_of, require_institute_user
from app.db.session import get_db
from app.models.fee import FeePlan, Installment
from app.models.institute import Institute
from app.models.student import Student
from app.models.test_score import TestScore
from app.models.test import Test
from app.models.subject import Subject
from app.models.user import User
from app.schemas.parent import LastTestScore, ParentStudentView, PinVerifyRequest, ShareQrResponse

_IST = timezone(timedelta(hours=5, minutes=30))  # UTC+5:30, no DST
MAX_DAILY_SCANS = 2
MAX_PIN_ATTEMPTS = 5


def _ist_today() -> date:
    return datetime.now(_IST).date()


router = APIRouter(tags=["parent"])          # auth-protected (teacher)
public_router = APIRouter(tags=["parent-public"])  # no auth (parent)


# ── Teacher: generate / return share QR ───────────────────────────────────────

@router.post("/students/{student_id}/share-qr", response_model=ShareQrResponse)
async def share_qr(
    student_id: int,
    regenerate: bool = Query(False),
    current_user: User = Depends(require_institute_user),
    db: AsyncSession = Depends(get_db),
):
    institute_id = institute_id_of(current_user)

    result = await db.execute(
        select(Student).where(
            Student.id == student_id,
            Student.institute_id == institute_id,
            Student.is_deleted == False,
        )
    )
    student = result.scalar_one_or_none()
    if not student:
        raise NotFoundError("Student")

    if regenerate or not student.parent_token:
        plain_pin = str(random.randint(100000, 999999))
        student.parent_token = str(uuid.uuid4())
        student.parent_pin_hash = hash_password(plain_pin)
        student.parent_scan_count = 0
        student.parent_scan_date = None
        student.parent_pin_attempts = 0
        await db.commit()
        await db.refresh(student)
    else:
        # Return existing — PIN can't be shown again since it's hashed.
        # Return a sentinel so frontend knows to show "PIN already set" UI.
        plain_pin = "••••••"

    return ShareQrResponse(
        token=student.parent_token,
        pin=plain_pin,
        student_name=student.full_name,
        parent_name=student.parent_name,
        parent_phone=student.parent_phone,
    )


# ── Public: parent verifies PIN and views student summary ─────────────────────

@public_router.post("/public/parent/{token}", response_model=ParentStudentView)
async def parent_view(
    token: str,
    payload: PinVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Student)
        .options(joinedload(Student.class_))
        .where(
            Student.parent_token == token,
            Student.is_deleted == False,
        )
    )
    student = result.scalar_one_or_none()
    if not student:
        raise NotFoundError("Student")

    today = _ist_today()

    # Reset daily counters when day changes
    if student.parent_scan_date != today:
        student.parent_scan_count = 0
        student.parent_pin_attempts = 0
        student.parent_scan_date = today

    # Lockout after too many wrong PINs today
    if student.parent_pin_attempts >= MAX_PIN_ATTEMPTS:
        raise ValidationError("Too many incorrect attempts. Try again tomorrow.")

    if not student.parent_pin_hash or not verify_password(payload.pin, student.parent_pin_hash):
        student.parent_pin_attempts += 1
        await db.commit()
        remaining = MAX_PIN_ATTEMPTS - student.parent_pin_attempts
        raise ValidationError(f"Incorrect PIN. {max(remaining, 0)} attempt(s) left today.")

    # Correct PIN — check daily scan limit
    if student.parent_scan_count >= MAX_DAILY_SCANS:
        raise ValidationError("Already accessed today. Try again tomorrow.")

    student.parent_scan_count += 1
    student.parent_total_scans += 1
    student.parent_last_scan_at = datetime.now(timezone.utc)
    student.parent_pin_attempts = 0  # reset on correct PIN

    # ── Fetch last test score ─────────────────────────────────────────────────
    score_result = await db.execute(
        select(TestScore, Test, Subject)
        .join(Test, TestScore.test_id == Test.id)
        .join(Subject, Test.subject_id == Subject.id)
        .where(
            TestScore.student_id == student.id,
            TestScore.is_deleted == False,
            Test.is_deleted == False,
            Test.is_published == True,
        )
        .order_by(Test.scheduled_date.desc())
        .limit(1)
    )
    score_row = score_result.first()
    last_test: LastTestScore | None = None
    if score_row:
        ts, test, subj = score_row
        last_test = LastTestScore(
            subject=subj.name,
            marks_obtained=ts.marks_obtained,
            total_marks=test.total_marks,
            test_title=test.title,
        )

    # ── Fetch fee summary ─────────────────────────────────────────────────────
    fees_due = 0
    next_due_date: str | None = None
    next_due_amount: int | None = None

    fee_result = await db.execute(
        select(FeePlan).where(
            FeePlan.student_id == student.id,
            FeePlan.is_deleted == False,
        )
    )
    fee_plan = fee_result.scalar_one_or_none()
    if fee_plan:
        fees_due = max(fee_plan.total_amount - fee_plan.paid_amount, 0)

        inst_result = await db.execute(
            select(Installment).where(
                Installment.fee_plan_id == fee_plan.id,
                Installment.is_deleted == False,
                Installment.status == "pending",
            ).order_by(Installment.due_date.asc()).limit(1)
        )
        next_inst = inst_result.scalar_one_or_none()
        if next_inst:
            next_due_date = next_inst.due_date.strftime("%d %b %Y").lstrip("0")
            next_due_amount = next_inst.amount

    # ── Fetch institute drive URL ─────────────────────────────────────────────
    notes_url: str | None = None
    inst_result = await db.execute(
        select(Institute).where(Institute.id == student.institute_id)
    )
    institute = inst_result.scalar_one_or_none()
    if institute and institute.drive_url and student.class_name:
        notes_url = f"https://drive.google.com/drive/search?q={student.class_name}"

    await db.commit()

    return ParentStudentView(
        first_name=student.full_name.split()[0],
        class_name=student.class_name or "",
        last_test=last_test,
        fees_due=fees_due,
        next_due_date=next_due_date,
        next_due_amount=next_due_amount,
        notes_url=notes_url,
    )
