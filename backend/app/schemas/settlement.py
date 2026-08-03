from typing import Optional, Optional, Any
"""
MessMate - Settlement Schemas
"""
from datetime import datetime
from pydantic import BaseModel, Field


class SettlementMemberData(BaseModel):
    user_id: int
    name: str
    meals_consumed: int
    total_paid: float
    total_contributed: float
    actual_share: float
    balance: float  # positive = receives money, negative = pays money


class SettlementData(BaseModel):
    total_expense: float
    total_meals: int
    cost_per_meal: float
    members: list[SettlementMemberData]


class SettlementCreate(BaseModel):
    group_id: int
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020, le=2100)


class SettlementResponse(BaseModel):
    id: int
    group_id: int
    month: int
    year: int
    status: str
    data: Optional[SettlementData]
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
