"""
MessMate - User CRUD Operations
"""
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password
from app.utils.helpers import generate_unique_user_id


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_unique_id(db: Session, unique_user_id: str) -> User | None:
    return db.query(User).filter(User.unique_user_id == unique_user_id).first()


def create_user(db: Session, name: str, email: str, password: str, phone: str | None = None) -> User:
    """Create a new user with a hashed password and unique ID."""
    # Ensure unique user ID doesn't collide
    uid = generate_unique_user_id()
    while get_user_by_unique_id(db, uid):
        uid = generate_unique_user_id()

    user = User(
        name=name,
        email=email,
        phone=phone,
        hashed_password=hash_password(password),
        unique_user_id=uid,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, **kwargs) -> User:
    """Update user fields."""
    for key, value in kwargs.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def update_password(db: Session, user: User, new_password: str) -> User:
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    return user
