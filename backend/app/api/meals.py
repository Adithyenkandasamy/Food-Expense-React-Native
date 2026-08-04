"""
MessMate - Meals API Routes
Meal tracking and attendance management.
"""
from datetime import date, timedelta
from fastapi import APIRouter, HTTPException, status, Query

from app.core.deps import DBSession, CurrentUser
from app.schemas.meal import (
    MealCreate,
    MealResponse,
    MealAttendanceBulkCreate,
    MealAttendanceResponse,
    DailyMealSummary,
)
from app.crud import meal as meal_crud
from app.crud import group as group_crud

router = APIRouter()


@router.post("", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
def create_meal(data: MealCreate, current_user: CurrentUser, db: DBSession):
    """Create or get a meal entry for a date and type."""
    membership = group_crud.get_membership(db, data.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    meal = meal_crud.get_or_create_meal(db, data.group_id, data.date, data.meal_type)
    return meal_crud.get_meal_by_id(db, meal.id)


@router.get("", response_model=list[MealResponse])
def list_meals(
    group_id: int = Query(...),
    date: date = Query(None),
    start_date: date = Query(None),
    end_date: date = Query(None),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """List meals for a group by date or date range."""
    membership = group_crud.get_membership(db, group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    if date:
        return meal_crud.get_meals_by_date(db, group_id, date)

    if start_date and end_date:
        return meal_crud.get_meals_by_range(db, group_id, start_date, end_date)

    # Default: return today's meals
    from datetime import date as date_cls
    today = date_cls.today()
    return meal_crud.get_meals_by_date(db, group_id, today)


@router.get("/{meal_id}", response_model=MealResponse)
def get_meal(meal_id: int, current_user: CurrentUser, db: DBSession):
    """Get a specific meal with attendance."""
    meal = meal_crud.get_meal_by_id(db, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    membership = group_crud.get_membership(db, meal.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    return meal


@router.post("/{meal_id}/attendance", response_model=list[MealAttendanceResponse])
def set_meal_attendance(meal_id: int, data: MealAttendanceBulkCreate, current_user: CurrentUser, db: DBSession):
    """Set attendance for multiple users on a meal."""
    meal = meal_crud.get_meal_by_id(db, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    membership = group_crud.get_membership(db, meal.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    entries = [att.model_dump() for att in data.attendances]
    results = meal_crud.bulk_set_attendance(db, meal_id, entries)
    return results


@router.put("/{meal_id}/attendance", response_model=MealAttendanceResponse)
def update_my_attendance(
    meal_id: int,
    meal_status: str = Query(..., alias="status", description="ate or skipped"),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """Update the current user's attendance for a meal."""
    meal = meal_crud.get_meal_by_id(db, meal_id)
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    membership = group_crud.get_membership(db, meal.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    if meal_status not in ("ate", "skipped"):
        raise HTTPException(status_code=400, detail="Status must be 'ate' or 'skipped'")

    result = meal_crud.set_attendance(db, meal_id, current_user.id, meal_status)
    return result
