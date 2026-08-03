from typing import Optional, Optional, Any
"""
MessMate - Meal Schemas
"""
from datetime import datetime, date
from pydantic import BaseModel, Field

from app.schemas.user import UserBrief


class MealCreate(BaseModel):
    group_id: int
    date: date
    meal_type: str = Field(..., examples=["breakfast"])


class MealResponse(BaseModel):
    id: int
    group_id: int
    date: date
    meal_type: str
    created_at: datetime
    attendances: list["MealAttendanceResponse"] = []

    model_config = {"from_attributes": True}


class MealAttendanceCreate(BaseModel):
    user_id: int
    status: str = Field(..., examples=["ate"])


class MealAttendanceBulkCreate(BaseModel):
    """Bulk update attendance for a meal."""
    attendances: list[MealAttendanceCreate]


class MealAttendanceResponse(BaseModel):
    id: int
    meal_id: int
    user_id: int
    status: str
    user: Optional[UserBrief] = None

    model_config = {"from_attributes": True}


class DailyMealSummary(BaseModel):
    """Summary of meals for a specific date."""
    date: date
    meals: list[MealResponse] = []
