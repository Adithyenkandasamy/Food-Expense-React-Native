"""
MessMate - Contributions API Routes
"""
from fastapi import APIRouter, HTTPException, status, Query

from app.core.deps import DBSession, CurrentUser
from app.schemas.contribution import ContributionCreate, ContributionResponse
from app.schemas.auth import MessageResponse
from app.crud import contribution as contribution_crud
from app.crud import group as group_crud

router = APIRouter(prefix="/api/contributions", tags=["Contributions"])


@router.post("", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
def create_contribution(data: ContributionCreate, current_user: CurrentUser, db: DBSession):
    """Add a money contribution to a group."""
    membership = group_crud.get_membership(db, data.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    contrib = contribution_crud.create_contribution(
        db=db,
        user_id=current_user.id,
        group_id=data.group_id,
        amount=data.amount,
        contribution_date=data.date,
        notes=data.notes,
    )
    return contribution_crud.get_contribution_by_id(db, contrib.id)


@router.get("", response_model=list[ContributionResponse])
def list_contributions(
    group_id: int = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = None,
    db: DBSession = None,
):
    """List contributions for a group."""
    membership = group_crud.get_membership(db, group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    offset = (page - 1) * page_size
    return contribution_crud.get_group_contributions(db, group_id, offset=offset, limit=page_size)


@router.get("/{contribution_id}", response_model=ContributionResponse)
def get_contribution(contribution_id: int, current_user: CurrentUser, db: DBSession):
    """Get contribution details."""
    contrib = contribution_crud.get_contribution_by_id(db, contribution_id)
    if not contrib:
        raise HTTPException(status_code=404, detail="Contribution not found")

    membership = group_crud.get_membership(db, contrib.group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    return contrib


@router.delete("/{contribution_id}", response_model=MessageResponse)
def delete_contribution(contribution_id: int, current_user: CurrentUser, db: DBSession):
    """Delete a contribution. Only the contributor or admin can delete."""
    contrib = contribution_crud.get_contribution_by_id(db, contribution_id)
    if not contrib:
        raise HTTPException(status_code=404, detail="Contribution not found")

    if contrib.user_id != current_user.id and not group_crud.is_admin(db, contrib.group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only the contributor or admin can delete")

    contribution_crud.delete_contribution(db, contrib)
    return MessageResponse(message="Contribution deleted successfully")
