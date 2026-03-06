"""
Exception classes and error handling for InQuest.

This module defines custom exceptions used throughout the application.
All exceptions inherit from a base class and provide context for error handling.
"""


class InQuestException(Exception):
    """
    Base exception class for all InQuest-specific exceptions.
    
    Attributes:
        code: Error code for API responses.
        message: User-friendly error message.
        status_code: HTTP status code.
        details: Additional error details.
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict = None,
    ):
        """
        Initialize InQuestException.
        
        Args:
            code: Error code identifier (e.g., 'AUTH_001').
            message: Human-readable error message.
            status_code: HTTP status code.
            details: Optional additional details.
        """
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationException(InQuestException):
    """Raised when authentication fails."""

    def __init__(self, message: str, code: str = "AUTH_001", details: dict = None):
        super().__init__(code=code, message=message, status_code=401, details=details)


class AuthorizationException(InQuestException):
    """Raised when user lacks required permissions."""

    def __init__(self, message: str, code: str = "AUTH_002", details: dict = None):
        super().__init__(code=code, message=message, status_code=403, details=details)


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
