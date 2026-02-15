from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    is_active: Optional[bool] = True

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: Optional[EmailStr]) -> Optional[EmailStr]:
        if value is None:
            return value
        return EmailStr(str(value).strip().lower())

    @field_validator("full_name")
    @classmethod
    def normalize_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        name = value.strip()
        if len(name) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return name

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=120)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        password = value.strip()
        if not any(ch.islower() for ch in password):
            raise ValueError("Password must include a lowercase letter")
        if not any(ch.isupper() for ch in password):
            raise ValueError("Password must include an uppercase letter")
        if not any(ch.isdigit() for ch in password):
            raise ValueError("Password must include a number")
        return password

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)

class UserInDBBase(UserBase):
    id: Optional[int] = None
    plan: str

    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass
