"""
MessMate - Meal CRUD Operations
"""
from datetime import date
from sqlalchemy.orm import Session, joinedload

from app.models.meal import Meal, MealAttendance


def get_or_create_meal(db: Session, group_id: int, meal_date: date, meal_type: str) -> Meal:
    """Get existing meal record or create a new one."""
    meal = (
        db.query(Meal)
        .filter(
            Meal.group_id == group_id,
            Meal.date == meal_date,
            Meal.meal_type == meal_type,
        )
        .first()
    )
    if not meal:
        meal = Meal(group_id=group_id, date=meal_date, meal_type=meal_type)
        db.add(meal)
        db.commit()
        db.refresh(meal)
    return meal


def get_meal_by_id(db: Session, meal_id: int) -> Meal | None:
    return (
        db.query(Meal)
        .options(joinedload(Meal.attendances).joinedload(MealAttendance.user))
        .filter(Meal.id == meal_id)
        .first()
    )


def get_meals_by_date(db: Session, group_id: int, meal_date: date) -> list[Meal]:
    return (
        db.query(Meal)
        .options(joinedload(Meal.attendances).joinedload(MealAttendance.user))
        .filter(Meal.group_id == group_id, Meal.date == meal_date)
        .order_by(Meal.meal_type)
        .all()
    )


def get_meals_by_range(
    db: Session, group_id: int, start_date: date, end_date: date
) -> list[Meal]:
    return (
        db.query(Meal)
        .options(joinedload(Meal.attendances))
        .filter(
            Meal.group_id == group_id,
            Meal.date >= start_date,
            Meal.date <= end_date,
        )
        .order_by(Meal.date, Meal.meal_type)
        .all()
    )


def set_attendance(db: Session, meal_id: int, user_id: int, status: str) -> MealAttendance:
    """Set or update meal attendance for a user."""
    attendance = (
        db.query(MealAttendance)
        .filter(MealAttendance.meal_id == meal_id, MealAttendance.user_id == user_id)
        .first()
    )
    if attendance:
        attendance.status = status
    else:
        attendance = MealAttendance(meal_id=meal_id, user_id=user_id, status=status)
        db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


def bulk_set_attendance(db: Session, meal_id: int, entries: list[dict]) -> list[MealAttendance]:
    """Bulk set attendance for multiple users on a meal."""
    results = []
    for entry in entries:
        att = set_attendance(db, meal_id, entry["user_id"], entry["status"])
        results.append(att)
    return results


def count_user_meals(
    db: Session, group_id: int, user_id: int, month: int, year: int
) -> int:
    """Count meals a user actually ate in a month (for settlement calculations)."""
    from sqlalchemy import extract

    return (
        db.query(MealAttendance)
        .join(Meal)
        .filter(
            Meal.group_id == group_id,
            MealAttendance.user_id == user_id,
            MealAttendance.status == "ate",
            extract("month", Meal.date) == month,
            extract("year", Meal.date) == year,
        )
        .count()
    )
