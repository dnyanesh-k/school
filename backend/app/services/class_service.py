from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.class_ import Class
from app.repositories.class_repository import ClassRepository
from app.schemas.class_ import ClassCreate, ClassUpdate


class ClassService:
    def __init__(self, db: AsyncSession):
        self.repo = ClassRepository(db)

    async def create(self, payload: ClassCreate):
        class_name = payload.name.strip()
        if not class_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Class name cannot be empty")

        existing = await self.repo.get_by_name(class_name)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail="Class with this name already exists")

        class_obj = Class(name=class_name)
        return await self.repo.create(class_obj)

    async def get_all(self):
        return await self.repo.list_all()

    async def get_by_id(self, class_id: int):
        class_obj = await self.repo.get_by_id(class_id)
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")
        return class_obj

    async def update(self, class_id: int, payload: ClassUpdate):
        class_obj = await self.repo.get_by_id(class_id)
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

        if payload.name is not None:
            new_name = payload.name.strip()
            if not new_name:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, detail="Class name cannot be empty")

            if new_name != class_obj.name:
                duplicate = await self.repo.get_by_name(new_name)
                if duplicate and duplicate.id != class_id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, detail="Class with this name already exists")
                class_obj.name = new_name

        return await self.repo.update(class_obj)

    async def delete(self, class_id: int) -> None:
        class_obj = await self.repo.get_by_id(class_id)
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Class not found")

        await self.repo.delete(class_obj)
