"""
MessMate - Dashboard API Routes
Aggregated dashboard data for a group.
"""
from datetime import date, datetime, timezone
from fastapi import APIRouter, HTTPException
from sqlalchemy import extract, func

from app.core.deps import DBSession, CurrentUser
from app.schemas.dashboard import DashboardResponse, MemberContributionSummary, TodayMealStatus
from app.models.expense import Expense
from app.models.contribution import Contribution
from app.models.meal import Meal, MealAttendance
from app.models.group import GroupMember
from app.models.settlement import Settlement, SettlementStatus
from app.models.user import User
from app.crud import group as group_crud
from app.crud import meal as meal_crud
from app.crud import expense as expense_crud

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/{group_id}", response_model=DashboardResponse)
def get_dashboard(group_id: int, current_user: CurrentUser, db: DBSession):
    """Get aggregated dashboard data for a group."""
    membership = group_crud.get_membership(db, group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    today = date.today()
    current_month = today.month
    current_year = today.year

    # Monthly expense total
    monthly_expense = float(
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.group_id == group_id,
            extract("month", Expense.date) == current_month,
            extract("year", Expense.date) == current_year,
        )
        .scalar()
    )

    # Total contributions this month
    total_contributions = float(
        db.query(func.coalesce(func.sum(Contribution.amount), 0))
        .filter(
            Contribution.group_id == group_id,
            extract("month", Contribution.date) == current_month,
            extract("year", Contribution.date) == current_year,
        )
        .scalar()
    )

    # Current user's balance: (paid + contributed) - share
    user_paid = float(
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.group_id == group_id,
            Expense.paid_by == current_user.id,
            extract("month", Expense.date) == current_month,
            extract("year", Expense.date) == current_year,
        )
        .scalar()
    )
    user_contributed = float(
        db.query(func.coalesce(func.sum(Contribution.amount), 0))
        .filter(
            Contribution.group_id == group_id,
            Contribution.user_id == current_user.id,
            extract("month", Contribution.date) == current_month,
            extract("year", Contribution.date) == current_year,
        )
        .scalar()
    )

    # Count members and total meals to find per-person share
    members = group_crud.get_group_members(db, group_id)
    member_count = len(members)

    total_meals_consumed = (
        db.query(MealAttendance)
        .join(Meal)
        .filter(
            Meal.group_id == group_id,
            MealAttendance.status == "ate",
            extract("month", Meal.date) == current_month,
            extract("year", Meal.date) == current_year,
        )
        .count()
    )

    user_meals = (
        db.query(MealAttendance)
        .join(Meal)
        .filter(
            Meal.group_id == group_id,
            MealAttendance.user_id == current_user.id,
            MealAttendance.status == "ate",
            extract("month", Meal.date) == current_month,
            extract("year", Meal.date) == current_year,
        )
        .count()
    )

    cost_per_meal = monthly_expense / total_meals_consumed if total_meals_consumed > 0 else 0
    user_share = user_meals * cost_per_meal
    current_balance = round((user_paid + user_contributed) - user_share, 2)

    # Pending settlement check
    pending_settlement = (
        db.query(Settlement)
        .filter(
            Settlement.group_id == group_id,
            Settlement.status == SettlementStatus.PENDING,
        )
        .first()
    ) is not None

    # Recent expenses (last 5)
    recent_expenses = expense_crud.get_group_expenses(db, group_id, offset=0, limit=5)

    # Contribution summary per member this month
    contribution_summary = []
    for gm in members:
        user = db.query(User).filter(User.id == gm.user_id).first()
        paid = float(
            db.query(func.coalesce(func.sum(Expense.total_amount), 0))
            .filter(
                Expense.group_id == group_id,
                Expense.paid_by == gm.user_id,
                extract("month", Expense.date) == current_month,
                extract("year", Expense.date) == current_year,
            )
            .scalar()
        )
        contributed = float(
            db.query(func.coalesce(func.sum(Contribution.amount), 0))
            .filter(
                Contribution.group_id == group_id,
                Contribution.user_id == gm.user_id,
                extract("month", Contribution.date) == current_month,
                extract("year", Contribution.date) == current_year,
            )
            .scalar()
        )
        contribution_summary.append(
            MemberContributionSummary(
                user_id=gm.user_id,
                name=user.name if user else "Unknown",
                total_paid=paid,
                total_contributed=contributed,
            )
        )

    # Today's meals for current user
    todays_meals_data = meal_crud.get_meals_by_date(db, group_id, today)
    todays_meals = []
    for meal_type in ["breakfast", "lunch", "dinner"]:
        meal_record = next((m for m in todays_meals_data if m.meal_type == meal_type), None)
        user_status = None
        if meal_record:
            att = next(
                (a for a in meal_record.attendances if a.user_id == current_user.id), None
            )
            if att:
                user_status = att.status
        todays_meals.append(TodayMealStatus(meal_type=meal_type, status=user_status))

    return DashboardResponse(
        current_balance=current_balance,
        monthly_expense=monthly_expense,
        total_contributions=total_contributions,
        pending_settlement=pending_settlement,
        recent_expenses=recent_expenses,
        contribution_summary=contribution_summary,
        todays_meals=todays_meals,
        member_count=member_count,
    )
