"""
Authentication-related Pydantic schemas for API requests and responses.

These schemas define the structure of authentication endpoint payloads
and provide automatic validation and documentation.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime


class PhoneNumberRequest(BaseModel):
    """
    Request schema for phone number-based authentication.
    
    Used for /register and /login endpoints.
    """

    phone_number: str = Field(
        ...,
        description="Phone number in international format (e.g., +2341234567890 or 2341234567890)",
        example="+2341234567890",
    )

    @validator("phone_number")
    def validate_phone(cls, v: str) -> str:
        """validate phone number format"""
        from app.utils.validators import validate_phone_number
        return validate_phone_number(v)

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {"phone_number": "+2341234567890"}
        }


class OTPVerificationRequest(BaseModel):
    """
    Request schema for OTP verification.
    
    Used for /verify-otp endpoint.
    """

    phone_number: str = Field(
        ...,
        description="Phone number",
        example="+2341234567890",
    )
    otp: str = Field(
        ...,
        description="6-digit OTP code",
        example="123456",
    )

    @validator("phone_number")
    def validate_phone(cls, v: str) -> str:
        """Validate phone number"""
        from app.utils.validators import validate_phone_number
        return validate_phone_number(v)

    @validator("otp")
    def validate_otp(cls, v: str) -> str:
        """Validate OTP format"""
        from app.utils.validators import validate_otp
        return validate_otp(v)

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "phone_number": "+2341234567890",
                "otp": "123456",
            }
        }


class ResendOTPRequest(BaseModel):
    """Request schema for resending OTP."""

    phone_number: str = Field(
        ...,
        description="Phone number to resend OTP to",
        example="+2341234567890",
    )

    @validator("phone_number")
    def validate_phone(cls, v: str) -> str:
        """Validate phone number"""
        from app.utils.validators import validate_phone_number
        return validate_phone_number(v)

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {"phone_number": "+2341234567890"}
        }


class AuthTokenResponse(BaseModel):
    """Response schema containing JWT token after successful authentication."""

    access_token: str = Field(
        ...,
        description="JWT access token for authenticated requests",
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer' for JWT)",
    )
    expires_in: int = Field(
        ...,
        description="Token expiration time in seconds",
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 86400,
            }
        }


class UserBase(BaseModel):
    """Base user schema with common fields."""

    first_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User's first name",
    )
    last_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User's last name",
    )
    email: Optional[EmailStr] = Field(
        None,
        description="User's email address",
    )
    emergency_contact: Optional[str] = Field(
        None,
        description="Emergency contact phone number",
    )

    @validator("first_name", "last_name")
    def validate_name(cls, v: str) -> str:
        """Validate name format"""
        from app.utils.validators import validate_name
        return validate_name(v)

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    """Request schema for updating user profile."""

    first_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="User's first name",
    )
    last_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="User's last name",
    )
    photo_url: Optional[str] = Field(
        None,
        description="URL to profile photo",
    )
    emergency_contact: Optional[str] = Field(
        None,
        description="Emergency contact phone number",
    )

    @validator("photo_url")
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        """Validate URL if provided"""
        if v:
            from app.utils.validators import validate_url
            return validate_url(v)
        return v

    @validator("first_name", "last_name")
    def validate_names(cls, v: Optional[str]) -> Optional[str]:
        """Validate name if provided"""
        if v:
            from app.utils.validators import validate_name
            return validate_name(v)
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe",
                "photo_url": "https://example.com/photo.jpg",
                "emergency_contact": "+2341234567890",
            }
        }


class UserResponse(UserBase):
    """Response schema for user data."""

    id: int = Field(..., description="User ID")
    phone_number: str = Field(..., description="User's phone number")
    role: str = Field(..., description="User role (Passenger, Driver, Admin, Support)")
    is_active: bool = Field(..., description="Whether account is active")
    is_verified: bool = Field(..., description="Whether phone is verified")
    created_at: datetime = Field(..., description="Account creation date")
    last_login_at: Optional[datetime] = Field(None, description="Last login timestamp")

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "phone_number": "+2341234567890",
                "first_name": "John",
                "last_name": "Doe",
                "email": "john@example.com",
                "role": "Passenger",
                "is_active": True,
                "is_verified": True,
                "created_at": "2024-01-15T10:30:00",
                "last_login_at": "2024-01-15T15:45:00",
            }
        }


class LoginResponse(BaseModel):
    """Response schema for login endpoint combining token and user info."""

    user: UserResponse = Field(..., description="User information")
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "user": {
                    "id": 1,
                    "phone_number": "+2341234567890",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "Passenger",
                    "is_active": True,
                    "is_verified": True,
                    "created_at": "2024-01-15T10:30:00",
                },
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 86400,
            }
        }
