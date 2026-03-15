"""
User Profile, Guardian, and Feature request/response schemas.

Pydantic models for profile, guardian, SOS, notifications, saved places endpoints.
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# ============================================================================
# PROFILE ENDPOINTS
# ============================================================================

class UpdateProfileRequest(BaseModel):
    """
    Request body for PATCH /api/v1/profile
    
    Spec: Section 2.2 - Update Profile
    """
    first_name: Optional[str] = Field(None, min_length=2)
    last_name: Optional[str] = Field(None, min_length=2)
    email: Optional[EmailStr] = Field(None, description="Must be unique")


class ProfilePhotoRequest(BaseModel):
    """Upload profile photo (multipart/form-data)."""
    # File handled by form-data, not JSON
    pass


class MembershipTierResponse(BaseModel):
    """
    Response for GET /api/v1/profile/tier
    
    Spec: Section 2.4 - Get Membership Tier
    """
    success: bool = True
    data: dict


class EmergencyContact(BaseModel):
    """Single emergency contact."""
    name: str
    phone: str
    relation: str


class UpdateEmergencyContactsRequest(BaseModel):
    """
    Request body for PUT /api/v1/profile/emergency-contacts
    
    Spec: Section 2.5 - Update Emergency Contacts
    """
    contacts: List[EmergencyContact] = Field(..., max_length=5, description="Max 5 contacts")


class ReferralStats(BaseModel):
    """Referral information."""
    referral_code: str
    share_url: str
    total_referred: int
    completed_referrals: int
    pending_referrals: int
    total_earned: float
    pending_earnings: float
    referrals: List[dict]


class ReferralStatsResponse(BaseModel):
    """
    Response for GET /api/v1/profile/referrals
    
    Spec: Section 2.6 - Get Referral Stats
    """
    success: bool = True
    data: ReferralStats


# ============================================================================
# GUARDIAN MODE
# ============================================================================

class AddGuardianRequest(BaseModel):
    """
    Request body for POST /api/v1/guardians
    
    Spec: Section 10.1 - Add Guardian
    """
    name: str = Field(..., description="Full name")
    phone: str = Field(..., description="Nigerian phone number")
    relation: str = Field(..., description="e.g. Mother, Brother, Friend")


class GuardianDetail(BaseModel):
    """Guardian information."""
    id: str
    name: str
    phone: str
    relation: str
    status: str  # PENDING, ACTIVE, DECLINED


class GuardiansListResponse(BaseModel):
    """
    Response for GET /api/v1/guardians
    
    Spec: Section 10.3 - Get All Guardians
    """
    success: bool = True
    data: List[GuardianDetail]


class SendGuardianAlertRequest(BaseModel):
    """
    Request body for POST /api/v1/guardians/alert
    
    Spec: Section 10.4 - Send Guardian Alert
    """
    trip_id: Optional[str] = Field(None, description="Active trip ID (uses current if omitted)")
    message: Optional[str] = Field(None, description="Optional custom message")


# ============================================================================
# SOS
# ============================================================================

class TriggerSOSRequest(BaseModel):
    """
    Request body for POST /api/v1/sos/trigger
    
    Spec: Section 11.1 - Trigger SOS
    """
    trip_id: Optional[str] = Field(None, description="Active trip ID if in a trip")
    location: dict = Field(..., description="{ lat: number, lng: number }")
    message: Optional[str] = Field(None, description="Optional context")


class ResolveSOSRequest(BaseModel):
    """
    Request body for POST /api/v1/sos/:sosId/resolve
    
    Spec: Section 11.3 - Resolve SOS
    """
    resolution: str = Field(
        ..., 
        description="FALSE_ALARM, RESOLVED, or ASSISTANCE_PROVIDED"
    )
    notes: Optional[str] = Field(None, description="Additional notes")


# ============================================================================
# SAVED PLACES
# ============================================================================

class SavePlaceRequest(BaseModel):
    """
    Request body for POST /api/v1/places
    
    Spec: Section 15.2 - Add Saved Place
    """
    label: str = Field(..., description="HOME, WORK, or OTHER")
    name: Optional[str] = Field(None, description="Required if label is OTHER")
    address: str = Field(..., description="Formatted address")
    location: dict = Field(..., description="{ lat: number, lng: number }")
    
    @field_validator("label")
    @classmethod
    def valid_label(cls, v):
        """Validate label."""
        if v not in ["HOME", "WORK", "OTHER"]:
            raise ValueError("Label must be HOME, WORK, or OTHER")
        return v
    
    @field_validator("name")
    @classmethod
    def name_if_other(cls, v, info):
        """Name required if label is OTHER."""
        if "label" in info.data and info.data["label"] == "OTHER" and not v:
            raise ValueError("Name is required when label is OTHER")
        return v


class UpdatePlaceRequest(BaseModel):
    """
    Request body for PATCH /api/v1/places/:id
    
    Spec: Section 15.3 - Update Saved Place
    """
    label: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    location: Optional[dict] = None


class SavedPlaceDetail(BaseModel):
    """Single saved place."""
    id: str
    label: str
    name: Optional[str] = None
    address: str
    lat: float
    lng: float
    created_at: str


class SavedPlacesListResponse(BaseModel):
    """Response for GET /api/v1/places"""
    success: bool = True
    data: List[SavedPlaceDetail]


# ============================================================================
# NOTIFICATIONS
# ============================================================================

class NotificationDetail(BaseModel):
    """Single notification."""
    id: str
    type: str
    title: str
    body: str
    data: Optional[dict] = None
    is_read: bool
    created_at: str


class NotificationsListResponse(BaseModel):
    """Response for GET /api/v1/notifications"""
    success: bool = True
    data: dict


class UnreadCountResponse(BaseModel):
    """Response for GET /api/v1/notifications/unread-count"""
    success: bool = True
    data: dict


class RegisterDeviceTokenRequest(BaseModel):
    """
    Request body for POST /api/v1/notifications/device-token
    
    Spec: Section 9.5 - Register Device Push Token
    """
    token: str = Field(..., description="Firebase Cloud Messaging device token")
    platform: str = Field(..., description="android or ios")


class NotificationPreferences(BaseModel):
    """Notification preference settings."""
    push_enabled: bool = True
    sms_enabled: bool = True
    email_enabled: bool = False


class UpdateNotificationPreferencesRequest(BaseModel):
    """
    Request body for PUT /api/v1/notifications/preferences
    
    Spec: Section 9.6 - Update Notification Preferences
    """
    preferences: NotificationPreferences
