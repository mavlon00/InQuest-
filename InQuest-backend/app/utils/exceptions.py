"""
Custom exception classes for InQuest Mobility Service.

Comprehensive exception hierarchy following specification Section 1 error codes.
Each exception has an associated HTTP status code and error code for API responses.
"""

from fastapi import HTTPException, status


# ============================================================================
# BASE EXCEPTION
# ============================================================================

class InQuestException(HTTPException):
    """
    Base exception for all InQuest errors.
    
    Attributes:
        status_code: HTTP status code.
        error_code: API error code (AUTH_001, BOOKING_002, etc.).
        message: User-friendly error message.
        details: Additional error context.
    """
    
    status_code: int = 400
    error_code: str = "UNKNOWN_ERROR"
    message: str = "An error occurred"
    
    def __init__(self, message: str = None, error_code: str = None, status_code: int = None, details: dict = None, **kwargs):
        self.message = message or self.message
        self.error_code = error_code or kwargs.get("code") or self.error_code
        self.code = self.error_code  # Add alias for compatibility
        self.status_code = status_code or self.status_code
        self.details = details or {}
        
        super().__init__(
            status_code=self.status_code,
            detail={
                "success": False,
                "error": {
                    "code": self.error_code,
                    "message": self.message,
                    "details": details
                }
            }
        )


# ============================================================================
# AUTHENTICATION ERRORS (Section 1)
# ============================================================================

class AuthenticationException(InQuestException):
    """Generic authentication error for backward compatibility."""
    def __init__(self, message: str = "Authentication failed", code: str = "AUTH_011"):
        super().__init__(message=message, status_code=401, error_code=code)


class InvalidPhoneFormatError(InQuestException):
    """AUTH_001: Invalid phone number format."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "AUTH_001"
    message = "Invalid phone number format. Must be +234 Nigerian format."


class PhoneAlreadyRegisteredError(InQuestException):
    """AUTH_002: Phone already registered."""
    status_code = status.HTTP_409_CONFLICT
    error_code = "AUTH_002"
    message = "Phone number already registered. Use login instead."


class InvalidReferralCodeError(InQuestException):
    """AUTH_003: Invalid or expired referral code."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "AUTH_003"
    message = "Invalid or expired referral code."


class InvalidOTPError(InQuestException):
    """AUTH_004: Invalid OTP."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "AUTH_004"
    message = "Invalid OTP."


class OTPExpiredError(InQuestException):
    """AUTH_005: OTP has expired."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "AUTH_005"
    message = "OTP has expired. Request a new one."


class NoPendingSessionError(InQuestException):
    """AUTH_006: No pending registration session found."""
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "AUTH_006"
    message = "No pending registration session found for this phone."


class MaxResendAttemptsError(InQuestException):
    """AUTH_007: Maximum resend attempts reached."""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    error_code = "AUTH_007"
    message = "Maximum 3 resend attempts reached. Try again in X minutes."


class NoPendingOTPError(InQuestException):
    """AUTH_008: No pending OTP session."""
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "AUTH_008"
    message = "No pending session found for this phone number."


class AccountNotFoundError(InQuestException):
    """AUTH_009: No account with this phone number."""
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "AUTH_009"
    message = "No account found with this phone number. Use register instead."


class RefreshTokenInvalidError(InQuestException):
    """AUTH_010: Refresh token invalid or revoked."""
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "AUTH_010"
    message = "Refresh token is invalid or has been revoked."


class PhoneLockedError(InQuestException):
    """AUTH_011: Phone locked due to too many failed attempts."""
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "AUTH_011"
    message = "Phone locked due to too many failed attempts. Try again in X minutes."


# ============================================================================
# BOOKING ERRORS (Sections 3/4)
# ============================================================================

class InvalidCoordinatesError(InQuestException):
    """BOOKING_001: Invalid coordinates."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "BOOKING_001"
    message = "Invalid coordinates provided."


class InsufficientWalletBalanceError(InQuestException):
    """BOOKING_002: Insufficient wallet balance."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "BOOKING_002"
    message = "Insufficient wallet balance for this trip."


class NoDriversAvailableError(InQuestException):
    """BOOKING_003: No drivers available."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = "BOOKING_003"
    message = "No drivers available in your area right now."


class ActiveBookingExistsError(InQuestException):
    """BOOKING_004: User already has active booking."""
    status_code = status.HTTP_409_CONFLICT
    error_code = "BOOKING_004"
    message = "You already have an active booking."


class PassengerTooFarError(InQuestException):
    """BOOKING_005: Passenger more than 500m from keke."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "BOOKING_005"
    message = "You are more than 500m from this keke."


class NotEnoughSeatsError(InQuestException):
    """BOOKING_006: Not enough available seats."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "BOOKING_006"
    message = "Not enough available seats in this keke."


class KekeNotAvailableError(InQuestException):
    """BOOKING_007: Keke no longer available."""
    status_code = status.HTTP_409_CONFLICT
    error_code = "BOOKING_007"
    message = "This keke is no longer available."


class RouteNotAvailableError(InQuestException):
    """BOOKING_008: No route available between locations."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "BOOKING_008"
    message = "No route available between these locations."


class InvalidScheduledTimeError(InQuestException):
    """BOOKING_009: Scheduled time must be 30+ minutes in future."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "BOOKING_009"
    message = "Scheduled time must be at least 30 minutes in the future."


# ============================================================================
# WALLET ERRORS (Section 8)
# ============================================================================

class InsufficientBalanceError(InQuestException):
    """WALLET_001: Insufficient balance."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "WALLET_001"
    message = "Insufficient wallet balance for this transaction."


class InvalidPINError(InQuestException):
    """WALLET_002: Invalid transaction PIN."""
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "WALLET_002"
    message = "Invalid transaction PIN."


class PINNotSetError(InQuestException):
    """WALLET_003: Transaction PIN not set."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "WALLET_003"
    message = "Transaction PIN not set. Please create one first."


# ============================================================================
# GUARDIAN ERRORS (Section 10)
# ============================================================================

class MaxGuardiansError(InQuestException):
    """GUARDIAN_001: Maximum guardians exceeded."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "GUARDIAN_001"
    message = "Maximum 5 guardians per user."


# ============================================================================
# GENERAL ERRORS
# ============================================================================

class NotFoundError(InQuestException):
    """Generic 404 error."""
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "NOT_FOUND"
    message = "Resource not found."


class UnauthorizedError(InQuestException):
    """Generic 401 error."""
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "UNAUTHORIZED"
    message = "Unauthorized access."


class ForbiddenError(InQuestException):
    """Generic 403 error."""
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "FORBIDDEN"
    message = "Access forbidden."


class ValidationError(InQuestException):
    """Generic validation error."""
    status_code = status.HTTP_400_BAD_REQUEST
    error_code = "VALIDATION_ERROR"
    message = "Validation failed."


class InternalServerError(InQuestException):
    """Generic 500 error."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "INTERNAL_ERROR"
    message = "Internal server error. Please try again later."

    def __init__(self, message: str = None, code: str = None, details: dict = None):
        super().__init__(message=message, error_code=code, status_code=500, details=details)


class OTPException(InQuestException):
    """Raised when OTP verification fails."""

    def __init__(self, message: str, code: str = "OTP_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=400, details=details)


class OTPExpiredException(OTPException):
    """Raised when OTP has expired."""

    def __init__(self, message: str = "OTP has expired", details: dict = None):
        super().__init__(message=message, code="OTP_002", details=details)


class RateLimitException(InQuestException):
    """Raised when rate limit is exceeded."""

    def __init__(self, message: str, code: str = "RATE_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=429, details=details)


class ValidationException(InQuestException):
    """Raised when input validation fails."""

    def __init__(self, message: str, code: str = "VALIDATION_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=400, details=details)


class GeofenceException(InQuestException):
    """Raised when geofence check fails."""

    def __init__(self, message: str, code: str = "GEOFENCE_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=400, details=details)


class RideException(InQuestException):
    """Raised when ride operation fails."""

    def __init__(self, message: str, code: str = "RIDE_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=400, details=details)


class PaymentException(InQuestException):
    """Raised when payment operation fails."""

    def __init__(self, message: str, code: str = "PAYMENT_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=400, details=details)


class WalletException(InQuestException):
    """Raised when wallet operation fails."""

    def __init__(self, message: str, code: str = "WALLET_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=400, details=details)


class ExternalAPIException(InQuestException):
    """Raised when external API call fails."""

    def __init__(self, message: str, code: str = "EXT_API_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=502, details=details)


class ResourceNotFoundException(InQuestException):
    """Raised when a requested resource is not found."""

    def __init__(self, message: str, code: str = "NOT_FOUND_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=404, details=details)


class DuplicateResourceException(InQuestException):
    """Raised when attempting to create a duplicate resource."""

    def __init__(self, message: str, code: str = "DUPLICATE_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=409, details=details)


class InternalServerException(InQuestException):
    """Raised for unexpected internal server errors."""

    def __init__(self, message: str, code: str = "INTERNAL_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=500, details=details)
