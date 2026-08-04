"""
MessMate - Contribution Schemas
"""
from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field

from app.schemas.user import UserBrief


class ContributionCreate(BaseModel):
    group_id: int
    amount: float = Field(..., gt=0)
    date: date
    notes: Optional[str] = None


class ContributionResponse(BaseModel):
    id: int
    user_id: int
    group_id: int
    amount: float
    date: date
    notes: Optional[str]
    created_at: datetime
    user: UserBrief

    model_config = {"from_attributes": True}
