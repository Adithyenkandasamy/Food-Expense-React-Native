"""
MessMate - Settlement CRUD & Calculation Engine
Computes fair expense splits based on meals consumed.
"""
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import extract, func

from app.models.settlement import Settlement, SettlementStatus
from app.models.expense import Expense
from app.models.contribution import Contribution
from app.models.meal import Meal, MealAttendance
from app.models.group import GroupMember
from app.models.user import User


def calculate_settlement(db: Session, group_id: int, month: int, year: int) -> dict:
    """
    Core settlement engine.
    
    Algorithm:
    1. Sum total grocery expenses for the month
    2. Count total meals consumed across all members
    3. Calculate cost per meal = total_expense / total_meals
    4. For each member: actual_share = meals_consumed * cost_per_meal
    5. Balance = (total_paid + total_contributed) - actual_share
       - Positive balance → member receives money
       - Negative balance → member owes money
    """
    # Get all group members
    members = (
        db.query(GroupMember)
        .join(User)
        .filter(GroupMember.group_id == group_id)
        .all()
    )

    # Total expenses for the month
    total_expense = (
        db.query(func.coalesce(func.sum(Expense.total_amount), 0))
        .filter(
            Expense.group_id == group_id,
            extract("month", Expense.date) == month,
            extract("year", Expense.date) == year,
        )
        .scalar()
    )
    total_expense = float(total_expense)

    # Count total meals consumed by all members
    total_meals = (
        db.query(MealAttendance)
        .join(Meal)
        .filter(
            Meal.group_id == group_id,
            MealAttendance.status == "ate",
            extract("month", Meal.date) == month,
            extract("year", Meal.date) == year,
        )
        .count()
    )

    cost_per_meal = total_expense / total_meals if total_meals > 0 else 0

    member_data = []
    for gm in members:
        user = db.query(User).filter(User.id == gm.user_id).first()

        # Meals this member ate
        meals_consumed = (
            db.query(MealAttendance)
            .join(Meal)
            .filter(
                Meal.group_id == group_id,
                MealAttendance.user_id == gm.user_id,
                MealAttendance.status == "ate",
                extract("month", Meal.date) == month,
                extract("year", Meal.date) == year,
            )
            .count()
        )

        # Total paid by this member (expenses they bought)
        total_paid = float(
            db.query(func.coalesce(func.sum(Expense.total_amount), 0))
            .filter(
                Expense.group_id == group_id,
                Expense.paid_by == gm.user_id,
                extract("month", Expense.date) == month,
                extract("year", Expense.date) == year,
            )
            .scalar()
        )

        # Total contributed (money added without purchases)
        total_contributed = float(
            db.query(func.coalesce(func.sum(Contribution.amount), 0))
            .filter(
                Contribution.group_id == group_id,
                Contribution.user_id == gm.user_id,
                extract("month", Contribution.date) == month,
                extract("year", Contribution.date) == year,
            )
            .scalar()
        )

        actual_share = round(meals_consumed * cost_per_meal, 2)
        balance = round((total_paid + total_contributed) - actual_share, 2)

        member_data.append({
            "user_id": gm.user_id,
            "name": user.name if user else "Unknown",
            "meals_consumed": meals_consumed,
            "total_paid": total_paid,
            "total_contributed": total_contributed,
            "actual_share": actual_share,
            "balance": balance,
        })

    return {
        "total_expense": total_expense,
        "total_meals": total_meals,
        "cost_per_meal": round(cost_per_meal, 2),
        "members": member_data,
    }


def create_settlement(
    db: Session, group_id: int, month: int, year: int, created_by: int
) -> Settlement:
    """Calculate and persist a settlement."""
    data = calculate_settlement(db, group_id, month, year)

    settlement = Settlement(
        group_id=group_id,
        month=month,
        year=year,
        status=SettlementStatus.PENDING,
        data=data,
        created_by=created_by,
    )
    db.add(settlement)
    db.commit()
    db.refresh(settlement)
    return settlement


def get_settlement_by_id(db: Session, settlement_id: int) -> Settlement | None:
    return db.query(Settlement).filter(Settlement.id == settlement_id).first()


def get_group_settlements(db: Session, group_id: int) -> list[Settlement]:
    return (
        db.query(Settlement)
        .filter(Settlement.group_id == group_id)
        .order_by(Settlement.year.desc(), Settlement.month.desc())
        .all()
    )


def close_settlement(db: Session, settlement: Settlement) -> Settlement:
    settlement.status = SettlementStatus.CLOSED
    db.commit()
    db.refresh(settlement)
    return settlement
