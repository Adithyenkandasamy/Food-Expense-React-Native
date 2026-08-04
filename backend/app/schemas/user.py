"""
MessMate - User Schemas
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    avatar: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    avatar: Optional[str]
    unique_user_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBrief(BaseModel):
    """Lightweight user representation for lists."""
    id: int
    name: str
    unique_user_id: str
    avatar: Optional[str]

    model_config = {"from_attributes": True}
