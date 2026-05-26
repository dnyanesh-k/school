from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.tenant import verify_class, verify_subject
from app.models.subject import Subject
from app.repositories.class_repository import ClassRepository
from app.repositories.subject_repository import SubjectRepository
from app.schemas.subject import SubjectCreate, SubjectUpdate


class SubjectService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = SubjectRepository(db)
        self.class_repo = ClassRepository(db)

    async def create(self, class_id: int, payload: SubjectCreate, institute_id: int):
        await verify_class(self.db, class_id, institute_id)

        subject_name = payload.name.strip()
        if not subject_name:
            raise ValidationError("Subject name cannot be empty")

        existing = await self.repo.get_by_name_and_class(subject_name, class_id)
        if existing:
            raise ConflictError("Subject with this name already exists for this class")

        subject = Subject(name=subject_name, class_id=class_id)
        return await self.repo.create(subject)

    async def list_by_class(self, class_id: int, institute_id: int):
        await verify_class(self.db, class_id, institute_id)
        return await self.repo.list_by_class(class_id, institute_id)

    async def get_by_id(self, subject_id: int, institute_id: int):
        return await verify_subject(self.db, subject_id, institute_id)

    async def update(self, subject_id: int, payload: SubjectUpdate, institute_id: int):
        subject = await verify_subject(self.db, subject_id, institute_id)

        if payload.name is not None:
            new_name = payload.name.strip()
            if not new_name:
                raise ValidationError("Subject name cannot be empty")

            if new_name != subject.name:
                duplicate = await self.repo.get_by_name_and_class(new_name, subject.class_id)
                if duplicate and duplicate.id != subject_id:
                    raise ConflictError("Subject with this name already exists for this class")
                subject.name = new_name

        return await self.repo.update(subject)

    async def delete(self, subject_id: int, institute_id: int) -> None:
        subject = await verify_subject(self.db, subject_id, institute_id)
        await self.repo.delete(subject)
