from datetime import date

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance
from app.models.student import Student


class AttendanceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_for_date(self, attendance_date: date, institute_id: int) -> list[Attendance]:
        result = await self.db.execute(
            select(Attendance)
            .join(Student, Attendance.student_id == Student.id)
            .where(
                Attendance.attendance_date == attendance_date,
                Student.institute_id == institute_id,
            )
        )
        return list(result.scalars().all())

    async def get_for_class_on_date(
        self,
        class_id: int,
        attendance_date: date,
        institute_id: int,
    ) -> list[Attendance]:
        result = await self.db.execute(
            select(Attendance)
            .join(Student, Attendance.student_id == Student.id)
            .where(
                Attendance.class_id == class_id,
                Attendance.attendance_date == attendance_date,
                Student.institute_id == institute_id,
            )
        )
        return list(result.scalars().all())

    async def replace_class_absents(
        self,
        class_id: int,
        attendance_date: date,
        absent_student_ids: list[int],
    ) -> list[Attendance]:
        await self.db.execute(
            delete(Attendance).where(
                Attendance.class_id == class_id,
                Attendance.attendance_date == attendance_date,
            )
        )

        if not absent_student_ids:
            await self.db.commit()
            return []

        records = [
            Attendance(
                student_id=student_id,
                class_id=class_id,
                attendance_date=attendance_date,
                status="absent",
            )
            for student_id in absent_student_ids
        ]
        self.db.add_all(records)
        await self.db.commit()

        for item in records:
            await self.db.refresh(item)

        return records

    async def get_for_students_between(
        self,
        student_ids: list[int],
        start_date: date,
        end_date: date,
        institute_id: int,
    ) -> list[Attendance]:
        if not student_ids:
            return []

        result = await self.db.execute(
            select(Attendance)
            .join(Student, Attendance.student_id == Student.id)
            .where(
                Attendance.student_id.in_(student_ids),
                Attendance.attendance_date >= start_date,
                Attendance.attendance_date <= end_date,
                Student.institute_id == institute_id,
            )
        )
        return list(result.scalars().all())

    async def upsert_batch(self, records: list[Attendance]) -> list[Attendance]:
        saved: list[Attendance] = []

        for record in records:
            result = await self.db.execute(
                select(Attendance).where(
                    Attendance.student_id == record.student_id,
                    Attendance.attendance_date == record.attendance_date,
                )
            )
            existing = result.scalars().first()

            if existing:
                existing.status = record.status
                existing.class_id = record.class_id
                saved.append(existing)
            else:
                self.db.add(record)
                saved.append(record)

        await self.db.commit()

        for item in saved:
            await self.db.refresh(item)

        return saved
