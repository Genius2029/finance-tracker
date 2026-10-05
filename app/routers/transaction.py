from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database import get_session
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate
from app.core.security import get_current_user

router = APIRouter()



@router.post("/transactions")
async def create_transaction(
    data: TransactionCreate,
    category_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    if data.type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="type must be 'income' or 'expense'")

    new_transaction = Transaction(
        user_id=current_user.id,
        category_id=category_id,
        amount=data.amount,
        type=data.type,
        date=datetime.now(timezone.utc).isoformat(),
        description=data.description
    )
    session.add(new_transaction)
    await session.commit()
    await session.refresh(new_transaction)
    return new_transaction

@router.get("/transactions")
async def get_my_transactions(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Transaction).where(Transaction.user_id == current_user.id)
    result = await session.execute(query)
    transactions = result.scalars().all()
    return transactions

@router.delete("/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(Transaction).where(Transaction.id == transaction_id)
    result = await session.execute(query)
    transaction = result.first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    transaction = transaction[0]

    if transaction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This is not your transaction")

    await session.delete(transaction)
    await session.commit()
    return {"detail": "Transaction deleted"}

@router.get("/transactions/summary")
async def get_transaction_summary(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = (
        select(
            Transaction.category_id,
            Transaction.type,
            func.sum(Transaction.amount).label("total_amount")
        )
        .where(Transaction.user_id == current_user.id)
        .group_by(Transaction.category_id, Transaction.type)
    )
    result = await session.execute(query)
    rows = result.all()

    return [
        {
            "category_id": row[0],
            "type": row[1],
            "total": row[2]
        }
        for row in rows
    ]
