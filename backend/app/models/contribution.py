"""
MessMate - Contribution Model
Tracks money contributed by users without purchasing groceries.
"""
from datetime import datetime, date as date_type, timezone

from sqlalchemy import String, DateTime, ForeignKey, Text, Numeric, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Contribution(Base):
    __tablename__ = "contributions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="contributions")
    group = relationship("Group", back_populates="contributions")

    def __repr__(self) -> str:
        return f"<Contribution(id={self.id}, user_id={self.user_id}, amount={self.amount})>"
