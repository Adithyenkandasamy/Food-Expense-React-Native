"""
MessMate - Groups API Routes
Create, join, manage groups and members.
"""
from fastapi import APIRouter, HTTPException, status, Query

from app.core.deps import DBSession, CurrentUser
from app.schemas.group import (
    GroupCreate,
    GroupUpdate,
    GroupResponse,
    GroupDetailResponse,
    GroupMemberResponse,
    AddMemberRequest,
    JoinGroupRequest,
)
from app.schemas.auth import MessageResponse
from app.crud import group as group_crud
from app.crud import user as user_crud

router = APIRouter()


@router.post("", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(data: GroupCreate, current_user: CurrentUser, db: DBSession):
    """Create a new group. The creator becomes the admin."""
    group = group_crud.create_group(db, data.name, data.description, current_user.id)
    group.member_count = 1
    return group


@router.get("", response_model=list[GroupResponse])
def list_my_groups(current_user: CurrentUser, db: DBSession):
    """List all groups the current user belongs to."""
    groups = group_crud.get_user_groups(db, current_user.id)
    result = []
    for g in groups:
        members = group_crud.get_group_members(db, g.id)
        g.member_count = len(members)
        result.append(g)
    return result


@router.get("/{group_id}", response_model=GroupDetailResponse)
def get_group(group_id: int, current_user: CurrentUser, db: DBSession):
    """Get group details with members."""
    group = group_crud.get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Verify user is a member
    membership = group_crud.get_membership(db, group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    return group


@router.put("/{group_id}", response_model=GroupResponse)
def update_group(group_id: int, data: GroupUpdate, current_user: CurrentUser, db: DBSession):
    """Update group details. Admin only."""
    if not group_crud.is_admin(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only admins can update the group")

    group = group_crud.get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    update_data = data.model_dump(exclude_unset=True)
    updated = group_crud.update_group(db, group, **update_data)
    members = group_crud.get_group_members(db, group_id)
    updated.member_count = len(members)
    return updated


@router.delete("/{group_id}", response_model=MessageResponse)
def delete_group(group_id: int, current_user: CurrentUser, db: DBSession):
    """Delete a group. Admin only."""
    if not group_crud.is_admin(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only admins can delete the group")

    group = group_crud.get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    group_crud.delete_group(db, group)
    return MessageResponse(message="Group deleted successfully")


@router.post("/join", response_model=MessageResponse)
def join_group(data: JoinGroupRequest, current_user: CurrentUser, db: DBSession):
    """Join a group using an invite code."""
    group = group_crud.get_group_by_invite_code(db, data.invite_code)
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")

    existing = group_crud.get_membership(db, group.id, current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="You are already a member of this group")

    group_crud.add_member(db, group.id, current_user.id)
    return MessageResponse(message=f"Successfully joined '{group.name}'")


@router.get("/{group_id}/members", response_model=list[GroupMemberResponse])
def list_members(group_id: int, current_user: CurrentUser, db: DBSession):
    """List all members of a group."""
    membership = group_crud.get_membership(db, group_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this group")

    return group_crud.get_group_members(db, group_id)


@router.post("/{group_id}/members", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_member(group_id: int, data: AddMemberRequest, current_user: CurrentUser, db: DBSession):
    """Add a member by their unique user ID. Admin only."""
    if not group_crud.is_admin(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="Only admins can add members")

    target_user = user_crud.get_user_by_unique_id(db, data.unique_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found with that ID")

    existing = group_crud.get_membership(db, group_id, target_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")

    group_crud.add_member(db, group_id, target_user.id)
    return MessageResponse(message=f"Added {target_user.name} to the group")


@router.delete("/{group_id}/members/{user_id}", response_model=MessageResponse)
def remove_member(group_id: int, user_id: int, current_user: CurrentUser, db: DBSession):
    """Remove a member from the group. Admin only, or self-removal."""
    is_self = current_user.id == user_id
    is_group_admin = group_crud.is_admin(db, group_id, current_user.id)

    if not is_self and not is_group_admin:
        raise HTTPException(status_code=403, detail="Only admins can remove other members")

    membership = group_crud.get_membership(db, group_id, user_id)
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found in this group")

    group_crud.remove_member(db, membership)
    return MessageResponse(message="Member removed successfully")
