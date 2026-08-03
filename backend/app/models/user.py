"""
MessMate - User Model
"""
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.utils.helpers import generate_unique_user_id


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    avatar: Mapped[str | None] = mapped_column(Text, nullable=True)
    unique_user_id: Mapped[str] = mapped_column(
        String(10), unique=True, nullable=False, index=True, default=generate_unique_user_id
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    group_memberships = relationship("GroupMember", back_populates="user", cascade="all, delete-orphan")
    expenses_paid = relationship("Expense", back_populates="payer", cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="user", cascade="all, delete-orphan")
    meal_attendances = relationship("MealAttendance", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, name='{self.name}', uid='{self.unique_user_id}')>"
