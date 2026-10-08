from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    is_default: bool = False


class UserSignInRequest(BaseModel):
    email: EmailStr


class UserSwitchRequest(BaseModel):
    user_id: str


class UserResponse(UserBase):
    id: str
    is_default: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
