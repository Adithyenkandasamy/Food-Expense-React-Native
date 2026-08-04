"""
MessMate - Auth Schemas
"""
from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, examples=["Adhi"])
    email: EmailStr = Field(..., examples=["adhi@example.com"])
    phone: Optional[str] = Field(None, max_length=20, examples=["+91-9876543210"])
    password: str = Field(..., min_length=6, max_length=128, examples=["SecurePass123"])


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["adhi@example.com"])
    password: str = Field(..., examples=["SecurePass123"])


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class MessageResponse(BaseModel):
    message: str
