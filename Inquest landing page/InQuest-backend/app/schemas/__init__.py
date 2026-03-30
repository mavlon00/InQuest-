"""
Pydantic schemas for all API endpoints.

Request/response schemas following the specification exactly.
"""

# Authentication schemas
from app.schemas.auth import (
    RegisterRequest,
    VerifyOTPRequest,
    LoginRequest,
    ResendOTPRequest,
    RefreshTokenRequest,
    LogoutRequest,
    DeleteAccountRequest,
    StandardResponse,
    ErrorResponse,
    UserResponse,
    AuthTokenResponse,
    LoginResponse,
    ProfileUpdateRequest,
)

# Booking schemas
from app.schemas.booking import (
    Location,
    Stop,
    Driver,
    FareEstimateRequest,
    FareEstimateResponse,
    CreateBookingRequest,
    CreateBookingResponse,
    ActiveBookingResponse,
    CancelBookingRequest,
    BookOnSpotRequest,
    CreateRecurringBookingRequest,
    FileDisputeRequest,
    SubmitRatingRequest,
)

# Wallet and payment schemas
from app.schemas.wallet import (
    WalletBalanceResponse,
    TransactionHistoryResponse,
    InitiateTopupRequest,
    TransferRequest,
    CreatePINRequest,
    RedeemGreenPointsRequest,
)

# Profile and features schemas
from app.schemas.profile import (
    UpdateProfileRequest,
    MembershipTierResponse,
    EmergencyContact,
    AddGuardianRequest,
    GuardianDetail,
    TriggerSOSRequest,
    ResolveSOSRequest,
    SavePlaceRequest,
    UpdatePlaceRequest,
    RegisterDeviceTokenRequest,
)

__all__ = [
    # Auth
    "RegisterRequest",
    "RegisterResponse",
    "VerifyOTPRequest",
    "VerifyOTPResponse",
    "LoginRequest",
    "ResendOTPRequest",
    "RefreshTokenRequest",
    "LogoutRequest",
    "DeleteAccountRequest",
    "StandardResponse",
    "ErrorResponse",
    "UserResponse",
    
    # Booking
    "Location",
    "Stop",
    "Driver",
    "FareEstimateRequest",
    "FareEstimateResponse",
    "CreateBookingRequest",
    "CreateBookingResponse",
    "ActiveBookingResponse",
    "CancelBookingRequest",
    "BookOnSpotRequest",
    "CreateRecurringBookingRequest",
    "FileDisputeRequest",
    "SubmitRatingRequest",
    
    # Wallet
    "WalletBalanceResponse",
    "TransactionHistoryResponse",
    "InitiateTopupRequest",
    "TransferRequest",
    "CreatePINRequest",
    "RedeemGreenPointsRequest",
    
    # Profile
    "UpdateProfileRequest",
    "MembershipTierResponse",
    "EmergencyContact",
    "AddGuardianRequest",
    "GuardianDetail",
    "TriggerSOSRequest",
    "ResolveSOSRequest",
    "SavePlaceRequest",
    "UpdatePlaceRequest",
    "RegisterDeviceTokenRequest",
]

