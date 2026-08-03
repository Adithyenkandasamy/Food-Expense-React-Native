"""
MessMate - Users API Routes
"""
from fastapi import APIRouter, status

from app.core.deps import DBSession, CurrentUser
from app.schemas.user import UserResponse, UserUpdate
from app.crud import user as user_crud

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: CurrentUser):
    """Get the currently authenticated user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(data: UserUpdate, current_user: CurrentUser, db: DBSession):
    """Update the currently authenticated user's profile."""
    update_data = data.model_dump(exclude_unset=True)
    updated = user_crud.update_user(db, current_user, **update_data)
    return updated
