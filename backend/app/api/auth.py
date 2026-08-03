"""
MessMate - Auth API Routes
Register, Login, Refresh Token, Logout, Change Password, Forgot Password
"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user, DBSession, CurrentUser
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    MessageResponse,
)
from app.schemas.user import UserResponse
from app.crud import user as user_crud

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: DBSession):
    """Register a new user account."""
    # Check if email already exists
    existing = user_crud.get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = user_crud.create_user(
        db=db,
        name=data.name,
        email=data.email,
        password=data.password,
        phone=data.phone,
    )
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: DBSession):
    """Authenticate and return JWT tokens."""
    user = user_crud.get_user_by_email(db, data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshTokenRequest, db: DBSession):
    """Get new access token using a valid refresh token."""
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    user = user_crud.get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: CurrentUser):
    """
    Logout the current user.
    Note: With stateless JWT, this is handled client-side by deleting tokens.
    A production app would use a token blacklist (Redis).
    """
    return MessageResponse(message="Successfully logged out")


@router.post("/change-password", response_model=MessageResponse)
def change_password(data: ChangePasswordRequest, current_user: CurrentUser, db: DBSession):
    """Change the current user's password."""
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    user_crud.update_password(db, current_user, data.new_password)
    return MessageResponse(message="Password changed successfully")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, db: DBSession):
    """
    Initiate password reset.
    In production, this would send an email with a reset link.
    """
    user = user_crud.get_user_by_email(db, data.email)
    if not user:
        # Don't reveal whether the email exists
        return MessageResponse(message="If the email exists, a reset link has been sent")

    # TODO: Implement email sending with reset token
    return MessageResponse(message="If the email exists, a reset link has been sent")
