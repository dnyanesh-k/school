from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.pagination import slice_page
from app.core.tenant import verify_class
from app.models.holiday import Holiday
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.attendance_submission_repository import AttendanceSubmissionRepository
from app.repositories.class_repository import ClassRepository
from app.repositories.holiday_repository import HolidayRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.attendance import (
    AbsentStreakOut,
    AttendanceMarkRequest,
    AttendanceMarkResponse,
    AttendanceMarkResult,
    AttendanceStudentOut,
    AttendanceSummaryOut,
    ClassAttendanceOut,
)
from app.schemas.holiday import HolidayCreate, HolidayOut
from app.schemas.pagination import PaginatedResponse, build_paginated, DEFAULT_PAGE, DEFAULT_PAGE_SIZE


class AttendanceService:
    DEFAULT_STATUS = "present"

    def __init__(self, db: AsyncSession):
        self.db = db
        self.attendance_repo = AttendanceRepository(db)
        self.submission_repo = AttendanceSubmissionRepository(db)
        self.student_repo = StudentRepository(db)
        self.class_repo = ClassRepository(db)
        self.holiday_repo = HolidayRepository(db)

    async def get_class_attendance(
        self,
        class_id: int,
        attendance_date: date,
        institute_id: int,
    ) -> ClassAttendanceOut:
        class_obj = await verify_class(self.db, class_id, institute_id)

        holiday = await self.holiday_repo.get_by_date(attendance_date, institute_id)
        students = await self.student_repo.list_by_class(institute_id, class_id)
        active_students = [s for s in students if s.is_active]

        existing_records = await self.attendance_repo.get_for_class_on_date(
            class_id,
            attendance_date,
            institute_id,
        )
        submission = await self.submission_repo.get_submission(class_id, attendance_date, institute_id)
        status_by_student = {record.student_id: record.status for record in existing_records}

        student_rows: list[AttendanceStudentOut] = []
        present_count = 0
        absent_count = 0

        for student in sorted(active_students, key=lambda s: s.full_name.lower()):
            status = status_by_student.get(student.id, self.DEFAULT_STATUS)
            if status == "absent":
                absent_count += 1
            else:
                present_count += 1

            student_rows.append(
                AttendanceStudentOut(
                    student_id=student.id,
                    student_name=student.full_name,
                    roll_number=student.roll_number,
                    status=status,
                )
            )

        return ClassAttendanceOut(
            class_id=class_id,
            class_name=class_obj.name,
            date=attendance_date,
            is_holiday=holiday is not None,
            holiday_reason=holiday.reason if holiday else None,
            is_submitted=submission is not None,
            submitted_at=submission.submitted_at if submission else None,
            students=student_rows,
            summary=AttendanceSummaryOut(
                total=len(student_rows),
                present=present_count,
                absent=absent_count,
            ),
        )

    async def mark_attendance(
        self,
        payload: AttendanceMarkRequest,
        institute_id: int,
    ) -> AttendanceMarkResponse:
        await verify_class(self.db, payload.class_id, institute_id)

        today = date.today()
        if payload.date > today:
            raise ValidationError("Cannot mark attendance for a future date")

        holiday = await self.holiday_repo.get_by_date(payload.date, institute_id)
        if holiday:
            raise ValidationError(f"Cannot mark attendance on a holiday ({holiday.reason})")

        class_students = await self.student_repo.list_by_class(institute_id, payload.class_id)
        active_student_ids = {student.id for student in class_students if student.is_active}

        if not active_student_ids:
            raise ValidationError("No active students found in this class")

        absent_student_ids: list[int] = []
        seen_ids: set[int] = set()
        for item in payload.records:
            if item.student_id in seen_ids:
                continue
            seen_ids.add(item.student_id)
            if item.student_id not in active_student_ids:
                raise ValidationError(f"Invalid student IDs for this class: {[item.student_id]}")
            absent_student_ids.append(item.student_id)

        saved = await self.attendance_repo.replace_class_absents(
            payload.class_id,
            payload.date,
            absent_student_ids,
        )

        submission = await self.submission_repo.upsert_submission(
            payload.class_id,
            payload.date,
            institute_id,
        )

        absent_count = len(absent_student_ids)
        present_count = len(active_student_ids) - absent_count

        return AttendanceMarkResponse(
            message="Attendance saved successfully",
            data=AttendanceMarkResult(
                class_id=payload.class_id,
                date=payload.date,
                present=present_count,
                absent=absent_count,
                saved=len(saved),
                is_submitted=True,
                submitted_at=submission.submitted_at,
            ),
        )

    async def get_absent_streak(
        self,
        institute_id: int,
        min_days: int,
        class_id: int | None = None,
    ) -> list[AbsentStreakOut]:
        if min_days < 1:
            raise ValidationError("Days must be at least 1")

        if class_id is not None:
            await verify_class(self.db, class_id, institute_id)
            students = await self.student_repo.list_by_class(institute_id, class_id)
        else:
            students = await self.student_repo.list_all(institute_id)

        active_students = [s for s in students if s.is_active]
        if not active_students:
            return []

        student_ids = [student.id for student in active_students]
        lookback_start = date.today() - timedelta(days=min_days * 3)
        attendance_rows = await self.attendance_repo.get_for_students_between(
            student_ids,
            lookback_start,
            date.today(),
            institute_id,
        )
        holidays = await self.holiday_repo.list_between(institute_id, lookback_start, date.today())
        holiday_dates = {holiday.holiday_date for holiday in holidays}

        absent_map: dict[tuple[int, date], bool] = {}
        for row in attendance_rows:
            absent_map[(row.student_id, row.attendance_date)] = row.status == "absent"

        streak_results: list[AbsentStreakOut] = []

        for student in active_students:
            streak = 0
            current_date = date.today()

            while current_date >= lookback_start:
                if current_date in holiday_dates:
                    current_date -= timedelta(days=1)
                    continue

                is_absent = absent_map.get((student.id, current_date), False)
                if is_absent:
                    streak += 1
                    current_date -= timedelta(days=1)
                    continue

                break

            if streak >= min_days:
                streak_results.append(
                    AbsentStreakOut(
                        student_id=student.id,
                        student_name=student.full_name,
                        class_name=student.class_name or "",
                        parent_phone=student.parent_phone,
                        absent_days=streak,
                    )
                )

        streak_results.sort(key=lambda item: (-item.absent_days, item.student_name.lower()))
        return streak_results

    async def get_absent_streak_paginated(
        self,
        institute_id: int,
        min_days: int,
        class_id: int | None = None,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> PaginatedResponse[AbsentStreakOut]:
        page, page_size, _ = slice_page(page, page_size)
        all_items = await self.get_absent_streak(institute_id, min_days, class_id=class_id)
        total = len(all_items)
        start = (page - 1) * page_size
        items = all_items[start : start + page_size]
        return build_paginated(items, total, page, page_size)


class HolidayService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = HolidayRepository(db)

    async def create(self, payload: HolidayCreate, institute_id: int) -> HolidayOut:
        reason = payload.reason.strip()
        if not reason:
            raise ValidationError("Holiday reason cannot be empty")

        existing = await self.repo.get_by_date(payload.date, institute_id)
        if existing:
            raise ConflictError("Holiday already exists for this date")

        holiday = Holiday(holiday_date=payload.date, reason=reason, institute_id=institute_id)
        created = await self.repo.create(holiday)
        return HolidayOut.model_validate(created)

    async def list_all(self, institute_id: int) -> list[HolidayOut]:
        holidays = await self.repo.list_all(institute_id)
        return [HolidayOut.model_validate(holiday) for holiday in holidays]
