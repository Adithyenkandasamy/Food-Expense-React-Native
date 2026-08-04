"""
MessMate - Settlements API Routes
Calculate, view, and close monthly settlements.
"""
from fastapi import APIRouter, HTTPException, status, Query

from app.core.deps import DBSession, CurrentUser
from app.schemas.settlement import SettlementResponse, SettlementCreate
from app.schemas.auth import MessageResponse
from app.crud import settlement as settlement_crud
from app.crud import group as group_crud

router = APIRouter()


@router.post("", response_model=SettlementResponse, status_code=status.HTTP_201_CREATED)
def create_settlement(data: SettlementCreate, current_user: CurrentUser, db: DBSession):
    """Calculate and save a monthly settlement. Admin only."""
    if not group_crud.is_admin(db, data.group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only admins can generate settlements")

    # Check if settlement already exists for this period
    existing = settlement_crud.get_group_settlements(db, data.group_id)
    for s in existing:
        if s.month == data.month and s.year == data.year:
            raise HTTPException(
                status_code=400,
                detail=f"Settlement already exists for {data.month}/{data.year}",
            )

    settlement = settlement_crud.create_settlement(
        db=db,
        group_id=data.group_id,
        month=data.month,
        year=data.year,
        created_by=current_user.id,
    )
    return settlement


@router.get("", response_model=list[SettlementResponse])
def list_settlements(
    group_id: int = Query(...),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """List all settlements for a group."""
    membership = group_crud.get_membership(db, group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    return settlement_crud.get_group_settlements(db, group_id)


@router.get("/{settlement_id}", response_model=SettlementResponse)
def get_settlement(settlement_id: int, current_user: CurrentUser, db: DBSession):
    """Get a specific settlement."""
    settlement = settlement_crud.get_settlement_by_id(db, settlement_id)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")

    membership = group_crud.get_membership(db, settlement.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    return settlement


@router.put("/{settlement_id}/close", response_model=SettlementResponse)
def close_settlement(settlement_id: int, current_user: CurrentUser, db: DBSession):
    """Close a pending settlement. Admin only."""
    settlement = settlement_crud.get_settlement_by_id(db, settlement_id)
    if not settlement:
        raise HTTPException(status_code=404, detail="Settlement not found")

    if not group_crud.is_admin(db, settlement.group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only admins can close settlements")

    if settlement.status == "closed":
        raise HTTPException(status_code=400, detail="Settlement is already closed")

    return settlement_crud.close_settlement(db, settlement)
