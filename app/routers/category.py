from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database import get_session
from app.models.category import Category
from app.schemas.category import CategoryCreate

router = APIRouter()

@router.post("/categories")
async def create_category(data: CategoryCreate, session: AsyncSession = Depends(get_session)):
    new_category = Category(name=data.name)
    session.add(new_category)
    await session.commit()
    await session.refresh(new_category)
    return new_category

@router.get("/categories")
async def get__all_categories(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Category))
    categories = result.scalars().all()
    return categories