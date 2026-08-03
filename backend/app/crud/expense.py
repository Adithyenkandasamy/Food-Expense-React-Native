"""
MessMate - Expense CRUD Operations
"""
from datetime import date
from sqlalchemy.orm import Session, joinedload

from app.models.expense import Expense, ExpenseItem


def create_expense(
    db: Session,
    group_id: int,
    paid_by: int,
    category: str,
    title: str,
    total_amount: float,
    expense_date: date,
    description: str | None = None,
    items: list[dict] | None = None,
) -> Expense:
    expense = Expense(
        group_id=group_id,
        paid_by=paid_by,
        category=category,
        title=title,
        description=description,
        date=expense_date,
        total_amount=total_amount,
    )
    db.add(expense)
    db.flush()

    if items:
        for item_data in items:
            item = ExpenseItem(expense_id=expense.id, **item_data)
            db.add(item)

    db.commit()
    db.refresh(expense)
    return expense


def get_expense_by_id(db: Session, expense_id: int) -> Expense | None:
    return (
        db.query(Expense)
        .options(joinedload(Expense.items), joinedload(Expense.payer))
        .filter(Expense.id == expense_id)
        .first()
    )


def get_group_expenses(
    db: Session,
    group_id: int,
    offset: int = 0,
    limit: int = 20,
    category: str | None = None,
    month: int | None = None,
    year: int | None = None,
) -> list[Expense]:
    query = (
        db.query(Expense)
        .options(joinedload(Expense.payer))
        .filter(Expense.group_id == group_id)
    )
    if category:
        query = query.filter(Expense.category == category)
    if month and year:
        from sqlalchemy import extract
        query = query.filter(
            extract("month", Expense.date) == month,
            extract("year", Expense.date) == year,
        )
    return query.order_by(Expense.date.desc()).offset(offset).limit(limit).all()


def count_group_expenses(db: Session, group_id: int) -> int:
    return db.query(Expense).filter(Expense.group_id == group_id).count()


def update_expense(db: Session, expense: Expense, **kwargs) -> Expense:
    for key, value in kwargs.items():
        if value is not None and hasattr(expense, key):
            setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense: Expense) -> None:
    db.delete(expense)
    db.commit()
