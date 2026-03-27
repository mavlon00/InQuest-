"""
Authentication request/response schemas.

Pydantic models for all authentication endpoints per specification.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    """
    Request body for POST /api/v1/auth/register
    
    Spec: Section 1.1 - Register
    """
    phone_number: str = Field(..., pattern=r"^\+234[789]\d{9}$", description="Nigerian phone in +234 format")
    first_name: Optional[str] = Field(None, min_length=2, max_length=100, description="User's first name")
    last_name: Optional[str] = Field(None, min_length=2, max_length=100, description="User's last name")
    role: Optional[str] = Field("Passenger", description="User role (Passenger or Driver)")
    referral_code: Optional[str] = Field(None, description="Optional referral code")


class LoginRequest(BaseModel):
    """
    Request body for POST /api/v1/auth/login
    
    Spec: Section 1.4 - Login
    """
    phone_number: str = Field(..., pattern=r"^\+234[789]\d{9}$", description="Registered phone number")


class VerifyOTPRequest(BaseModel):
    """
    Request body for POST /api/v1/auth/verify-otp
    
    Spec: Section 1.2 - Verify OTP
    """
    phone_number: str = Field(..., pattern=r"^\+234[789]\d{9}$", description="Phone that received OTP")
    otp: str = Field(..., pattern=r"^\d{6}$", description="6-digit OTP code")
    role: Optional[str] = Field(None, description="User role to assign if new user (Passenger or Driver)")


class ResendOTPRequest(BaseModel):
    """
    Request body for POST /api/v1/auth/resend-otp
    
    Spec: Section 1.3 - Resend OTP
    """
    phone_number: str = Field(..., pattern=r"^\+234[789]\d{9}$", description="Phone number that needs OTP resent")


class RefreshTokenRequest(BaseModel):
    """
    Request body for POST /api/v1/auth/refresh
    
    Spec: Section 1.5 - Refresh Token
    """
    refresh_token: str = Field(..., description="Valid refresh token")


class LogoutRequest(BaseModel):
    """
    Request body for POST /api/v1/auth/logout
    
    Spec: Section 1.6 - Logout
    """
    refresh_token: str = Field(..., description="Refresh token to invalidate")
    device_token: Optional[str] = Field(None, description="FCM push token")


class DeleteAccountRequest(BaseModel):
    """
    Request body for DELETE /api/v1/auth/account
    
    Spec: Section 1.7 - Delete Account
    """
    pin: str = Field(..., pattern=r"^\d{4}$", description="4-digit transaction PIN")
    reason: Optional[str] = Field(None, description="Deletion reason")
    refund_account: Optional[str] = Field(None, description="Bank account for refund")


class ProfileUpdateRequest(BaseModel):
    """
    Request body for PUT /api/v1/profile
    
    Spec: Section 2.2 - Update Profile
    """
    first_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
        description="User's first name",
    )
    last_name: Optional[str] = Field(
        None,
        max_length=100,
        description="User's last name",
    )
    email: Optional[str] = Field(
        None,
        description="User's email address",
    )
    photo_url: Optional[str] = Field(
        None,
        description="URL to profile photo",
    )
    emergency_contact: Optional[str] = Field(
        None,
        description="Emergency contact phone number",
    )


class UserResponse(BaseModel):
    """User data in response objects."""
    id: str = Field(..., description="User unique identifier")
    phone_number: str = Field(..., description="User's phone number")
    first_name: str = Field(..., description="User's first name")
    last_name: str = Field(..., description="User's last name")
    email: Optional[str] = Field(None, description="User's email")
    photo_url: Optional[str] = Field(None, description="Profile photo URL")
    membership_tier: str = Field(..., description="Membership tier (Standard/Silver/Gold/Platinum)")
    wallet_balance: float = Field(..., description="Current wallet balance")
    green_points: int = Field(..., description="Green points balance")
    referral_code: str = Field(..., description="User's unique referral code")
    is_new_user: bool = Field(..., description="Whether this is a new user")

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class AuthTokenResponse(BaseModel):
    """Response containing JWT token after successful authentication."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    expires_in: int = Field(..., description="Token expiration in seconds")
    refresh_token: str = Field(..., description="Refresh token for token rotation")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 900,
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            }
        }


class LoginResponse(BaseModel):
    """Response for successful login/registration."""
    user: UserResponse = Field(..., description="User information")
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "user": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "phone": "+2341234567890",
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": None,
                    "profile_photo_url": None,
                    "membership_tier": "Standard",
                    "wallet_balance": 0.0,
                    "green_points": 0,
                    "referral_code": "ABC123",
                    "is_new_user": True,
                },
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 900,
            }
        }



