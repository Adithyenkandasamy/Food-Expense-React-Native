"""
MessMate - Contribution CRUD Operations
"""
from datetime import date
from sqlalchemy.orm import Session, joinedload

from app.models.contribution import Contribution


def create_contribution(
    db: Session,
    user_id: int,
    group_id: int,
    amount: float,
    contribution_date: date,
    notes: str | None = None,
) -> Contribution:
    contribution = Contribution(
        user_id=user_id,
        group_id=group_id,
        amount=amount,
        date=contribution_date,
        notes=notes,
    )
    db.add(contribution)
    db.commit()
    db.refresh(contribution)
    return contribution


def get_contribution_by_id(db: Session, contribution_id: int) -> Contribution | None:
    return (
        db.query(Contribution)
        .options(joinedload(Contribution.user))
        .filter(Contribution.id == contribution_id)
        .first()
    )


def get_group_contributions(
    db: Session, group_id: int, offset: int = 0, limit: int = 20
) -> list[Contribution]:
    return (
        db.query(Contribution)
        .options(joinedload(Contribution.user))
        .filter(Contribution.group_id == group_id)
        .order_by(Contribution.date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def delete_contribution(db: Session, contribution: Contribution) -> None:
    db.delete(contribution)
    db.commit()
