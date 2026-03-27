"""
Authentication API routes (/api/v1/auth).

Implements all authentication endpoints including registration, OTP verification,
profile management, and logout.
"""

from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import (
    RegisterRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    LoginRequest,
    ProfileUpdateRequest,
    UserResponse,
    AuthTokenResponse,
    LoginResponse,
)
from app.utils.responses import StandardResponse, ErrorResponse
from app.utils.security import extract_user_id_from_token
from app.utils.logging_config import get_logger
from app.utils.exceptions import InQuestException, AuthenticationException

logger = get_logger(__name__)

# Create authentication router
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def get_current_user_id(authorization: str = Header(...)) -> int:
    """
    Dependency to extract and verify user ID from JWT token in Authorization header.
    
    Args:
        authorization: Authorization header (format: "Bearer <token>").
        
    Returns:
        User ID extracted from token.
        
    Raises:
        AuthenticationException: If token is missing, invalid, or expired.
    """
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise AuthenticationException(
                "Invalid authentication scheme. Use 'Bearer <token>'",
                code="AUTH_INVALID_SCHEME",
            )
        user_id = int(extract_user_id_from_token(token).split("@")[0] if "@" in extract_user_id_from_token(token) else extract_user_id_from_token(token))
        # Extract actual user ID from token
        from app.utils.security import verify_token
        payload = verify_token(token)
        return payload.get("user_id")
    except ValueError:
        raise AuthenticationException(
            "Invalid authorization header format",
            code="AUTH_INVALID_HEADER",
        )
    except Exception as e:
        raise AuthenticationException(
            str(e),
            code="AUTH_TOKEN_ERROR",
        )


@router.post(
    "/register",
    response_model=StandardResponse,
    status_code=200,
    summary="Initiate user registration",
    description="Register a new user or initiate login by providing phone number. Sends OTP via SMS.",
    responses={
        200: {"description": "OTP sent successfully"},
        400: {"description": "Invalid phone number"},
    },
)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Initiate user registration or login.
    
    Sends a 6-digit OTP to the provided phone number. The user must verify
    this OTP with the /verify-otp endpoint to complete authentication.
    
    Args:
        request: Phone number in international format.
        db: Database session.
        
    Returns:
        Success response with OTP status.
        
    Example:
        POST /api/v1/auth/register
        {
            "phone_number": "+2341234567890"
        }
    """
    try:
        result = await AuthService.register_or_login(db, request.phone_number)
        return StandardResponse(message="OTP sent successfully", data=result)
    except InQuestException as e:
        logger.warning("Registration failed", error=e.message, code=e.code)
        raise
    except Exception as e:
        logger.error("Unexpected error in registration", error=str(e))
        raise InQuestException(
            "An unexpected error occurred",
            code="INTERNAL_001",
            status_code=500,
        )


@router.post(
    "/login",
    response_model=StandardResponse,
    status_code=200,
    summary="Initiate user login",
    description="Login by providing phone number. Same as /register - sends OTP.",
    responses={
        200: {"description": "OTP sent successfully"},
        400: {"description": "Invalid phone number"},
    },
)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Initiate user login (same flow as registration).
    
    Args:
        request: Phone number.
        db: Database session.
        
    Returns:
        Success response with OTP status.
    """
    try:
        result = await AuthService.register_or_login(db, request.phone_number)
        return StandardResponse(message="OTP sent successfully", data=result)
    except InQuestException as e:
        logger.warning("Login failed", error=e.message)
        raise
    except Exception as e:
        logger.error("Unexpected error in login", error=str(e))
        raise InQuestException(
            "An unexpected error occurred",
            code="INTERNAL_001",
            status_code=500,
        )


@router.post(
    "/verify-otp",
    response_model=StandardResponse,
    status_code=200,
    summary="Verify OTP and complete authentication",
    description="Verify 6-digit OTP. If valid, returns JWT token and user information.",
    responses={
        200: {"description": "OTP verified, JWT token issued"},
        400: {"description": "Invalid or expired OTP"},
    },
)
async def verify_otp(
    request: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Verify OTP and issue JWT token.
    
    This completes the authentication flow. If OTP is valid:
    1. User is created if new, or logged in if existing
    2. JWT token is generated and returned
    3. User can now use authenticated endpoints
    
    Args:
        request: Phone number and OTP code.
        db: Database session.
        
    Returns:
        Success response containing user info and JWT token.
        
    Example:
        POST /api/v1/auth/verify-otp
        {
            "phone_number": "+2341234567890",
            "otp": "123456"
        }
    """
    try:
        result = await AuthService.verify_otp_and_login(
            db, request.phone_number, request.otp, request.role or "Passenger"
        )
        return StandardResponse(
            message="Authentication successful",
            data=result,
        )
    except InQuestException as e:
        logger.warning(
            "OTP verification failed",
            error=e.message,
            code=e.code,
            phone=request.phone_number,
        )
        raise
    except Exception as e:
        logger.error("Unexpected error in OTP verification", error=str(e))
        raise InQuestException(
            "An unexpected error occurred",
            code="INTERNAL_001",
            status_code=500,
        )


@router.post(
    "/resend-otp",
    response_model=StandardResponse,
    status_code=200,
    summary="Resend OTP to phone number",
    description="Generate and send a new OTP code.",
)
async def resend_otp(
    request: ResendOTPRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Resend OTP to phone number.
    
    Invalidates any previous OTP and sends a new one.
    
    Args:
        request: Phone number.
        db: Database session.
        
    Returns:
        Success response.
    """
    try:
        result = await AuthService.resend_otp(db, request.phone_number)
        return StandardResponse(message="OTP resent successfully", data=result)
    except InQuestException as e:
        logger.warning("OTP resend failed", error=e.message)
        raise
    except Exception as e:
        logger.error("Unexpected error in OTP resend", error=str(e))
        raise


@router.put(
    "/profile",
    response_model=StandardResponse,
    status_code=200,
    summary="Update user profile",
    description="Update user profile information (requires authentication).",
    responses={
        200: {"description": "Profile updated successfully"},
        401: {"description": "Unauthorized"},
    },
)
async def update_profile(
    request: ProfileUpdateRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Update authenticated user's profile.
    
    Allows users to update their name, photo, and emergency contact.
    
    Args:
        request: Profile update data.
        authorization: Bearer token header.
        db: Database session.
        
    Returns:
        Success response with updated user data.
        
    Example:
        PUT /api/v1/auth/profile
        Headers: Authorization: Bearer <token>
        {
            "first_name": "John",
            "last_name": "Doe",
            "photo_url": "https://example.com/photo.jpg"
        }
    """
    try:
        user_id = get_current_user_id(authorization)
        user = await AuthService.update_profile(
            db,
            user_id,
            first_name=request.first_name,
            last_name=request.last_name,
            photo_url=request.photo_url,
            emergency_contact=request.emergency_contact,
        )

        return StandardResponse(
            message="Profile updated successfully",
            data={
                "id": user.id,
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "photo_url": user.photo_url,
                "role": user.role.value,
                "emergency_contact": user.emergency_contact,
                "updated_at": user.updated_at,
            },
        )
    except AuthenticationException as e:
        logger.warning("Authentication failed in profile update", error=e.message)
        raise
    except InQuestException as e:
        logger.warning("Profile update failed", error=e.message)
        raise
    except Exception as e:
        logger.error("Unexpected error in profile update", error=str(e))
        raise


@router.get(
    "/profile",
    response_model=StandardResponse,
    status_code=200,
    summary="Get user profile",
    description="Retrieve authenticated user's profile information.",
)
async def get_profile(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Retrieve authenticated user's profile.
    
    Args:
        authorization: Bearer token header.
        db: Database session.
        
    Returns:
        Success response with user profile data.
    """
    try:
        user_id = get_current_user_id(authorization)
        user = await AuthService.get_user_by_id(db, user_id)

        return StandardResponse(
            message="Profile retrieved successfully",
            data={
                "id": user.id,
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "photo_url": user.photo_url,
                "role": user.role.value,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "emergency_contact": user.emergency_contact,
                "created_at": user.created_at,
                "last_login_at": user.last_login_at,
            },
        )
    except AuthenticationException as e:
        logger.warning("Authentication failed", error=e.message)
        raise
    except InQuestException as e:
        logger.warning("Profile retrieval failed", error=e.message)
        raise


@router.post(
    "/logout",
    response_model=StandardResponse,
    status_code=200,
    summary="Logout user",
    description="Logout and invalidate the current JWT token.",
)
async def logout(
    authorization: str = Header(...),
) -> StandardResponse:
    """
    Logout user (invalidate JWT token).
    
    Args:
        authorization: Bearer token header to invalidate.
        
    Returns:
        Success response.
    """
    try:
        user_id = get_current_user_id(authorization)
        logger.info("User logged out", user_id=user_id)
        return StandardResponse(message="Logged out successfully")
    except AuthenticationException as e:
        logger.warning("Logout failed", error=e.message)
        raise
