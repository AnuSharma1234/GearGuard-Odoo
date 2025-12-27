from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


# Base schema with common fields
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.user


# Schema for creating a user
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


# Schema for updating a user
class UserUpdate(BaseModel):
    email: EmailStr | None = None
    name: str | None = None
    role: UserRole | None = None
    password: str | None = Field(None, min_length=8)


# Schema for user response
class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# Schema for login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Schema for token response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
