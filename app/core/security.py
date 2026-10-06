from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database import get_session
from app.models.user import User

import os
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import jwt

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
#token creation and verification
def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> int:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return int(payload.get("sub"))

#hashing and verifying passwords
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

#getting the current user from the token
security_scheme = HTTPBearer()

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
        session: AsyncSession = Depends(get_session)
) -> User:
    token = credentials.credentials
    try:
        user_id = verify_token(token)
    except Exception as e: 
        print("Ошибка при валидации токена:", e)
        raise HTTPException(status_code=401, detail="Invalid token")

    query = select(User).where(User.id == user_id)
    result = await session.execute(query)
    user = result.first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user[0]