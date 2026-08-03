"""
MessMate - Expense and ExpenseItem Models
"""
from datetime import datetime, date as date_type, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, ForeignKey, Text, Enum, Numeric, Date, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ExpenseCategory(str, PyEnum):
    GROCERIES = "groceries"
    MILK = "milk"
    VEGETABLES = "vegetables"
    GAS = "gas"
    CLEANING = "cleaning"
    SNACKS = "snacks"
    OTHERS = "others"


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    paid_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(
        Enum(ExpenseCategory, name="expense_category_enum", create_constraint=True),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[date_type] = mapped_column(Date, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    group = relationship("Group", back_populates="expenses")
    payer = relationship("User", back_populates="expenses_paid")
    items = relationship("ExpenseItem", back_populates="expense", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Expense(id={self.id}, title='{self.title}', amount={self.total_amount})>"


class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    expense_id: Mapped[int] = mapped_column(ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True)
    item_name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)  # kg, L, pcs, etc.
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Relationships
    expense = relationship("Expense", back_populates="items")

    def __repr__(self) -> str:
        return f"<ExpenseItem(id={self.id}, name='{self.item_name}', subtotal={self.subtotal})>"
