from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subject import Subject
from app.repositories.class_repository import ClassRepository
from app.repositories.subject_repository import SubjectRepository
from app.schemas.subject import SubjectCreate, SubjectUpdate


class SubjectService:
    def __init__(self, db: AsyncSession):
        self.repo = SubjectRepository(db)
        self.class_repo = ClassRepository(db)

    async def create(self, class_id: int, payload: SubjectCreate):
        class_obj = await self.class_repo.get_by_id(class_id)
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

        subject_name = payload.name.strip()
        if not subject_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Subject name cannot be empty")

        existing = await self.repo.get_by_name_and_class(subject_name, class_id)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Subject with this name already exists for this class")

        subject = Subject(name=subject_name, class_id=class_id)
        return await self.repo.create(subject)

    async def list_by_class(self, class_id: int):
        class_obj = await self.class_repo.get_by_id(class_id)
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
        return await self.repo.list_by_class(class_id)

    async def get_by_id(self, subject_id: int):
        subject = await self.repo.get_by_id(subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
        return subject

    async def update(self, subject_id: int, payload: SubjectUpdate):
        subject = await self.repo.get_by_id(subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

        if payload.name is not None:
            new_name = payload.name.strip()
            if not new_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Subject name cannot be empty")

            if new_name != subject.name:
                duplicate = await self.repo.get_by_name_and_class(new_name, subject.class_id)
                if duplicate and duplicate.id != subject_id:
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                        detail="Subject with this name already exists for this class")
                subject.name = new_name

        return await self.repo.update(subject)

    async def delete(self, subject_id: int) -> None:
        subject = await self.repo.get_by_id(subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
        await self.repo.delete(subject)
