"""
MessMate - Group CRUD Operations
"""
from sqlalchemy.orm import Session, joinedload

from app.models.group import Group, GroupMember, GroupRole
from app.utils.helpers import generate_invite_code


def create_group(db: Session, name: str, description: str | None, creator_id: int) -> Group:
    """Create a group and add the creator as admin."""
    # Generate unique invite code
    code = generate_invite_code()
    while db.query(Group).filter(Group.invite_code == code).first():
        code = generate_invite_code()

    group = Group(name=name, description=description, invite_code=code, created_by=creator_id)
    db.add(group)
    db.flush()

    # Add creator as admin member
    membership = GroupMember(group_id=group.id, user_id=creator_id, role=GroupRole.ADMIN)
    db.add(membership)
    db.commit()
    db.refresh(group)
    return group


def get_group_by_id(db: Session, group_id: int) -> Group | None:
    return (
        db.query(Group)
        .options(joinedload(Group.members).joinedload(GroupMember.user))
        .filter(Group.id == group_id)
        .first()
    )


def get_group_by_invite_code(db: Session, invite_code: str) -> Group | None:
    return db.query(Group).filter(Group.invite_code == invite_code).first()


def get_user_groups(db: Session, user_id: int) -> list[Group]:
    """Get all groups a user belongs to."""
    return (
        db.query(Group)
        .join(GroupMember)
        .filter(GroupMember.user_id == user_id)
        .all()
    )


def update_group(db: Session, group: Group, **kwargs) -> Group:
    for key, value in kwargs.items():
        if value is not None and hasattr(group, key):
            setattr(group, key, value)
    db.commit()
    db.refresh(group)
    return group


def delete_group(db: Session, group: Group) -> None:
    db.delete(group)
    db.commit()


def add_member(db: Session, group_id: int, user_id: int, role: str = GroupRole.MEMBER) -> GroupMember:
    member = GroupMember(group_id=group_id, user_id=user_id, role=role)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def get_membership(db: Session, group_id: int, user_id: int) -> GroupMember | None:
    return (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
        .first()
    )


def remove_member(db: Session, membership: GroupMember) -> None:
    db.delete(membership)
    db.commit()


def get_group_members(db: Session, group_id: int) -> list[GroupMember]:
    return (
        db.query(GroupMember)
        .options(joinedload(GroupMember.user))
        .filter(GroupMember.group_id == group_id)
        .all()
    )


def is_admin(db: Session, group_id: int, user_id: int) -> bool:
    member = get_membership(db, group_id, user_id)
    return member is not None and member.role == GroupRole.ADMIN
