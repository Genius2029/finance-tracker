from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str

class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: str