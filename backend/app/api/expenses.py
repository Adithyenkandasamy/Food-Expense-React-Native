"""
MessMate - Expenses API Routes
"""
from fastapi import APIRouter, HTTPException, status, Query

from app.core.deps import DBSession, CurrentUser
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseListResponse
from app.schemas.auth import MessageResponse
from app.crud import expense as expense_crud
from app.crud import group as group_crud

router = APIRouter()


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(data: ExpenseCreate, current_user: CurrentUser, db: DBSession):
    """Add a new expense to a group."""
    # Verify user is a member of the group
    membership = group_crud.get_membership(db, data.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    items_data = [item.model_dump() for item in data.items] if data.items else None

    expense = expense_crud.create_expense(
        db=db,
        group_id=data.group_id,
        paid_by=current_user.id,
        category=data.category,
        title=data.title,
        total_amount=data.total_amount,
        expense_date=data.date,
        description=data.description,
        items=items_data,
    )
    return expense_crud.get_expense_by_id(db, expense.id)


@router.get("", response_model=list[ExpenseListResponse])
def list_expenses(
    group_id: int = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = Query(None),
    month: int | None = Query(None, ge=1, le=12),
    year: int | None = Query(None, ge=2020),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """List expenses for a group with optional filters."""
    membership = group_crud.get_membership(db, group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    offset = (page - 1) * page_size
    return expense_crud.get_group_expenses(
        db, group_id, offset=offset, limit=page_size, category=category, month=month, year=year
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, current_user: CurrentUser, db: DBSession):
    """Get expense details with items."""
    expense = expense_crud.get_expense_by_id(db, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    membership = group_crud.get_membership(db, expense.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, data: ExpenseUpdate, current_user: CurrentUser, db: DBSession):
    """Update an expense. Only the payer or admin can update."""
    expense = expense_crud.get_expense_by_id(db, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense.paid_by != current_user.id and not group_crud.is_admin(db, expense.group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only the payer or admin can update this expense")

    update_data = data.model_dump(exclude_unset=True)
    updated = expense_crud.update_expense(db, expense, **update_data)
    return expense_crud.get_expense_by_id(db, updated.id)


@router.delete("/{expense_id}", response_model=MessageResponse)
def delete_expense(expense_id: int, current_user: CurrentUser, db: DBSession):
    """Delete an expense. Only the payer or admin can delete."""
    expense = expense_crud.get_expense_by_id(db, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if expense.paid_by != current_user.id and not group_crud.is_admin(db, expense.group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only the payer or admin can delete this expense")

    expense_crud.delete_expense(db, expense)
    return MessageResponse(message="Expense deleted successfully")
