"""
MessMate - Group and GroupMember Models
"""
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, ForeignKey, Text, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.utils.helpers import generate_invite_code


class GroupRole(str, PyEnum):
    ADMIN = "admin"
    MEMBER = "member"


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    invite_code: Mapped[str] = mapped_column(
        String(10), unique=True, nullable=False, index=True, default=generate_invite_code
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    members = relationship("GroupMember", back_populates="group", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="group", cascade="all, delete-orphan")
    contributions = relationship("Contribution", back_populates="group", cascade="all, delete-orphan")
    meals = relationship("Meal", back_populates="group", cascade="all, delete-orphan")
    settlements = relationship("Settlement", back_populates="group", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Group(id={self.id}, name='{self.name}')>"


class GroupMember(Base):
    __tablename__ = "group_members"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(
        Enum(GroupRole, name="group_role_enum", create_constraint=True),
        default=GroupRole.MEMBER,
        nullable=False,
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uq_group_member"),
    )

    # Relationships
    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")

    def __repr__(self) -> str:
        return f"<GroupMember(group_id={self.group_id}, user_id={self.user_id}, role='{self.role}')>"
