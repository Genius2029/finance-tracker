from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(user_router)
app.include_router(category_router)
app.include_router(transaction_router)

@app.get("/register")
def serve_register():
    return FileResponse("app/templates/register.html")

@app.get("/login")
def serve_login():
    return FileResponse("app/templates/login.html")

@app.get("/dashboard")
def serve_dashboard():
    return FileResponse("app/templates/dashboard.html")
