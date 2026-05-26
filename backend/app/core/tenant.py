from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import require_institute_user  # noqa: F401 — re-export
from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.user import User
from app.repositories.class_repository import ClassRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.subject_repository import SubjectRepository
from app.repositories.test_repository import TestRepository


def institute_id_of(user: User) -> int:
    if not user.institute_id:
        raise ForbiddenError("No institute linked to this account")
    return user.institute_id


async def verify_class(db: AsyncSession, class_id: int, institute_id: int):
    repo = ClassRepository(db)
    class_obj = await repo.get_by_id(class_id, institute_id)
    if not class_obj:
        raise NotFoundError("Class")
    return class_obj


async def verify_student(db: AsyncSession, student_id: int, institute_id: int):
    repo = StudentRepository(db)
    student = await repo.get_by_id(student_id, institute_id)
    if not student:
        raise NotFoundError("Student")
    return student


async def verify_subject(db: AsyncSession, subject_id: int, institute_id: int):
    repo = SubjectRepository(db)
    subject = await repo.get_by_id_for_institute(subject_id, institute_id)
    if not subject:
        raise NotFoundError("Subject")
    return subject


async def verify_test(db: AsyncSession, test_id: int, institute_id: int):
    repo = TestRepository(db)
    test = await repo.get_by_id(test_id, institute_id)
    if not test:
        raise NotFoundError("Test")
    return test
