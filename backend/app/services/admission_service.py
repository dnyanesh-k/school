from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.models.admission import Admission
from app.models.student import Student
from app.repositories.admission_repository import AdmissionRepository
from app.repositories.class_repository import ClassRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.admission import AdmissionCreate, AdmissionConvertOut, AdmissionUpdate
from app.schemas.pagination import DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PaginatedResponse, build_paginated


class AdmissionService:
    def __init__(self, db: AsyncSession):
        self.repo = AdmissionRepository(db)
        self.class_repo = ClassRepository(db)
        self.student_repo = StudentRepository(db)

    async def create(self, payload: AdmissionCreate, institute_id: int) -> Admission:
        class_obj = await self.class_repo.get_by_id(payload.class_id, institute_id)
        if not class_obj:
            raise NotFoundError("Class")

        admission = Admission(
            **payload.model_dump(),
            institute_id=institute_id,
        )
        return await self.repo.create(admission)

    async def list_paginated(
        self,
        institute_id: int,
        status: str | None = None,
        page: int = DEFAULT_PAGE,
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> PaginatedResponse:
        items, total = await self.repo.list_paginated(institute_id, status, page, page_size)
        return build_paginated(items, total, page, page_size)

    async def count_pending(self, institute_id: int) -> int:
        return await self.repo.count_pending(institute_id)

    async def update(self, admission_id: int, payload: AdmissionUpdate, institute_id: int) -> Admission:
        admission = await self.repo.get_by_id(admission_id, institute_id)
        if not admission:
            raise NotFoundError("Admission")

        if admission.converted_student_id is not None:
            raise ConflictError("This admission has already been enrolled as a student and cannot be edited.")

        if payload.class_id is not None:
            class_obj = await self.class_repo.get_by_id(payload.class_id, institute_id)
            if not class_obj:
                raise NotFoundError("Class")

        for field, value in payload.model_dump(exclude_none=True).items():
            setattr(admission, field, value)

        return await self.repo.update(admission)

    async def delete(self, admission_id: int, institute_id: int) -> None:
        admission = await self.repo.get_by_id(admission_id, institute_id)
        if not admission:
            raise NotFoundError("Admission")
        await self.repo.delete(admission)

    async def convert_to_student(self, admission_id: int, institute_id: int) -> AdmissionConvertOut:
        """Promote an admitted candidate to a Student record (one-click)."""
        admission = await self.repo.get_by_id(admission_id, institute_id)
        if not admission:
            raise NotFoundError("Admission")
        if admission.status != "admitted":
            raise ValidationError("Only admissions with status 'admitted' can be converted.")
        if admission.converted_student_id is not None:
            raise ConflictError("Admission has already been converted to a student.")

        class_obj = await self.class_repo.get_by_id(admission.class_id, institute_id)
        if not class_obj:
            raise NotFoundError("Class")

        count = await self.student_repo.get_count(institute_id)
        roll_number = f"STU-{count + 1}"

        student = Student(
            institute_id=institute_id,
            roll_number=roll_number,
            full_name=admission.candidate_name,
            admission_date=date.today(),
            class_id=admission.class_id,
            parent_name=admission.parent_name,
            parent_phone=admission.phone,
        )
        student = await self.student_repo.create(student)

        admission.converted_student_id = student.id
        await self.repo.update(admission)

        return AdmissionConvertOut(
            admission_id=admission.id,
            student_id=student.id,
            roll_number=roll_number,
        )
