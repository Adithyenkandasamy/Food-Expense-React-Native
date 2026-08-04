"""
MessMate - Expense Schemas
"""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.user import UserBrief


class ExpenseItemCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=200)
    quantity: float = Field(..., gt=0)
    unit: Optional[str] = Field(None, max_length=20)
    price: float = Field(..., ge=0)
    subtotal: float = Field(..., ge=0)


class ExpenseItemResponse(BaseModel):
    id: int
    item_name: str
    quantity: float
    unit: Optional[str]
    price: float
    subtotal: float

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    group_id: int
    category: str = Field(..., examples=["groceries"])
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    date: date
    total_amount: float = Field(..., gt=0)
    items: list[ExpenseItemCreate] = []


class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    date: Optional[date] = None
    total_amount: Optional[float] = Field(None, gt=0)


class ExpenseResponse(BaseModel):
    id: int
    group_id: int
    paid_by: int
    category: str
    title: str
    description: Optional[str]
    date: date
    total_amount: float
    created_at: datetime
    payer: UserBrief
    items: list[ExpenseItemResponse] = []

    model_config = {"from_attributes": True}


class ExpenseListResponse(BaseModel):
    id: int
    group_id: int
    paid_by: int
    category: str
    title: str
    date: date
    total_amount: float
    created_at: datetime
    payer: UserBrief

    model_config = {"from_attributes": True}
