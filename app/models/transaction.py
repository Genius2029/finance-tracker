from sqlmodel import SQLModel, Field

class Transaction(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    category_id: int = Field(foreign_key="category.id")
    amount: float
    type: str
    date: str
    description: str