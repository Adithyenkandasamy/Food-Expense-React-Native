"""
MessMate - Settlement Model
Stores computed monthly settlement results as JSON data.
"""
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, ForeignKey, Enum, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class SettlementStatus(str, PyEnum):
    PENDING = "pending"
    CLOSED = "closed"


class Settlement(Base):
    __tablename__ = "settlements"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum(SettlementStatus, name="settlement_status_enum", create_constraint=True),
        default=SettlementStatus.PENDING,
        nullable=False,
    )
    data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    """
    Settlement data JSON structure:
    {
        "total_expense": 5000.0,
        "members": [
            {
                "user_id": 1,
                "name": "Adhi",
                "meals_consumed": 60,
                "total_paid": 2000.0,
                "total_contributed": 500.0,
                "actual_share": 1650.0,
                "balance": 850.0  # positive = receives, negative = pays
            },
            ...
        ]
    }
    """
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    group = relationship("Group", back_populates="settlements")
    creator = relationship("User", foreign_keys=[created_by])

    def __repr__(self) -> str:
        return f"<Settlement(id={self.id}, group_id={self.group_id}, {self.month}/{self.year})>"
