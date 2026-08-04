"""
MessMate - Group Schemas
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.user import UserBrief


class GroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None


class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    invite_code: str
    created_by: int
    created_at: datetime
    member_count: int = 0

    model_config = {"from_attributes": True}


class GroupDetailResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    invite_code: str
    created_by: int
    created_at: datetime
    members: list["GroupMemberResponse"] = []

    model_config = {"from_attributes": True}


class GroupMemberResponse(BaseModel):
    id: int
    user_id: int
    role: str
    joined_at: datetime
    user: UserBrief

    model_config = {"from_attributes": True}


class AddMemberRequest(BaseModel):
    unique_user_id: str = Field(..., examples=["MM-5GFK28"])


class JoinGroupRequest(BaseModel):
    invite_code: str = Field(..., min_length=6, max_length=10)
