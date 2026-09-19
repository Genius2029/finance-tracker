from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlmodel import SQLModel

from app.database import engine
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction

from app.routers.user import router as user_router
from app.routers.category import router as category_router
from app.routers.transaction import router as transaction_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(user_router)
app.include_router(category_router)
app.include_router(transaction_router)


@app.get("/")
def root():
    return {"message": "Finance Tracker API is running"}