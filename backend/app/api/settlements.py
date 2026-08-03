"""
MessMate - Settlements API
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.settlement import SettlementResponse, SettlementCreate
from app.crud import settlement as crud_settlement
from app.crud import group as crud_group

router = APIRouter()


@router.post("/groups/{group_id}/calculate", response_model=SettlementResponse)
def calculate_and_save_settlement(
    group_id: int,
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculate and generate a settlement for a specific month and year for a group.
    Only group admins can do this.
    """
    # Verify group and admin status
    group_member = crud_group.get_group_member(db, group_id=group_id, user_id=current_user.id)
    if not group_member:
        raise HTTPException(status_code=404, detail="Group not found or you are not a member")
    
    if group_member.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can generate settlements")
        
    # Check if settlement already exists for this period
    existing = crud_settlement.get_group_settlements(db, group_id=group_id)
    for ext in existing:
        if ext.month == month and ext.year == year:
            return ext
            
    # Calculate settlement data
    try:
        settlement_data = crud_settlement.calculate_settlement(db, group_id=group_id, month=month, year=year)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if not settlement_data:
        raise HTTPException(status_code=400, detail="Cannot calculate settlement (no data)")

    # Save settlement
    obj = SettlementCreate(
        group_id=group_id,
        month=month,
        year=year,
        settlement_data=settlement_data
    )
    return crud_settlement.create_settlement(db, obj=obj, generated_by_id=current_user.id)


@router.get("/groups/{group_id}", response_model=list[SettlementResponse])
def list_group_settlements(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group_member = crud_group.get_group_member(db, group_id=group_id, user_id=current_user.id)
    if not group_member:
        raise HTTPException(status_code=404, detail="Not found")
        
    return crud_settlement.get_group_settlements(db, group_id=group_id)
