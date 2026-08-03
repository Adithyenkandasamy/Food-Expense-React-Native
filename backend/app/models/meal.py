"""
MessMate - Meal and MealAttendance Models
Tracks daily meals and each member's attendance (ate/skipped).
"""
from datetime import datetime, date as date_type, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, ForeignKey, Enum, Date, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class MealType(str, PyEnum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class AttendanceStatus(str, PyEnum):
    ATE = "ate"
    SKIPPED = "skipped"


class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    meal_type: Mapped[str] = mapped_column(
        Enum(MealType, name="meal_type_enum", create_constraint=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        UniqueConstraint("group_id", "date", "meal_type", name="uq_group_date_meal"),
    )

    # Relationships
    group = relationship("Group", back_populates="meals")
    attendances = relationship("MealAttendance", back_populates="meal", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Meal(id={self.id}, date={self.date}, type='{self.meal_type}')>"


class MealAttendance(Base):
    __tablename__ = "meal_attendance"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        Enum(AttendanceStatus, name="attendance_status_enum", create_constraint=True),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("meal_id", "user_id", name="uq_meal_user_attendance"),
    )

    # Relationships
    meal = relationship("Meal", back_populates="attendances")
    user = relationship("User", back_populates="meal_attendances")

    def __repr__(self) -> str:
        return f"<MealAttendance(meal_id={self.meal_id}, user_id={self.user_id}, status='{self.status}')>"
