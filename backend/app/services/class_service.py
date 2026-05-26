from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationError
from app.core.tenant import verify_class
from app.models.class_ import Class
from app.repositories.class_repository import ClassRepository
from app.schemas.class_ import ClassCreate, ClassUpdate


class ClassService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ClassRepository(db)

    async def create(self, payload: ClassCreate, institute_id: int):
        class_name = payload.name.strip()
        if not class_name:
            raise ValidationError("Class name cannot be empty")

        existing = await self.repo.get_by_name(class_name, institute_id)
        if existing:
            raise ConflictError("Class with this name already exists")

        class_obj = Class(name=class_name, institute_id=institute_id)
        return await self.repo.create(class_obj)

    async def get_all(self, institute_id: int):
        return await self.repo.list_all(institute_id)

    async def get_by_id(self, class_id: int, institute_id: int):
        return await verify_class(self.db, class_id, institute_id)

    async def update(self, class_id: int, payload: ClassUpdate, institute_id: int):
        class_obj = await verify_class(self.db, class_id, institute_id)

        if payload.name is not None:
            new_name = payload.name.strip()
            if not new_name:
                raise ValidationError("Class name cannot be empty")

            if new_name != class_obj.name:
                duplicate = await self.repo.get_by_name(new_name, institute_id)
                if duplicate and duplicate.id != class_id:
                    raise ConflictError("Class with this name already exists")
                class_obj.name = new_name

        return await self.repo.update(class_obj)

    async def delete(self, class_id: int, institute_id: int) -> None:
        class_obj = await verify_class(self.db, class_id, institute_id)
        await self.repo.delete(class_obj)
