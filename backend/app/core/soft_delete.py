from sqlalchemy.ext.asyncio import AsyncSession


async def soft_delete(db: AsyncSession, entity, *, refresh: bool = True) -> None:
    """Mark an entity as deleted without removing the row."""
    entity.is_deleted = True
    await db.commit()
    if refresh:
        await db.refresh(entity)
