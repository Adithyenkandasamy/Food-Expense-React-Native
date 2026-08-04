"""
MessMate - Dashboard Schemas
"""
from typing import Optional
from datetime import date
from pydantic import BaseModel

from app.schemas.expense import ExpenseListResponse
from app.schemas.contribution import ContributionResponse


class DashboardResponse(BaseModel):
    current_balance: float
    monthly_expense: float
    total_contributions: float
    pending_settlement: bool
    recent_expenses: list[ExpenseListResponse]
    contribution_summary: list["MemberContributionSummary"]
    todays_meals: list["TodayMealStatus"]
    member_count: int


class MemberContributionSummary(BaseModel):
    user_id: int
    name: str
    total_paid: float
    total_contributed: float


class TodayMealStatus(BaseModel):
    meal_type: str
    status: Optional[str]  # ate, skipped, or None if not marked
