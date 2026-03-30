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
    ProfileUpdateRequest,
    UserResponse,
    AuthTokenResponse,
    LoginResponse,
    EmailRegisterRequest,
    EmailLoginRequest,
    GoogleAuthRequest,
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
        # Extract actual user ID from token
        from app.utils.security import verify_token
        payload = verify_token(token)
        user_id = payload.get("user_id")
        
        if not user_id:
            raise AuthenticationException(
                "Token missing user ID",
                code="AUTH_INVALID_TOKEN",
            )
            
        return user_id
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


# ── Email / Password Routes ───────────────────────────────────────────────────

@router.post(
    "/email-register",
    response_model=StandardResponse,
    status_code=201,
    summary="Register with email and password",
    description="Create a new account using email, password, first name, last name, and an optional referral code.",
)
async def email_register(
    request: EmailRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        result = await AuthService.email_register(
            db,
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name,
            role=request.role,
            referral_code=request.referral_code,
        )
        return StandardResponse(message="Account created successfully", data=result)
    except InQuestException as e:
        logger.warning("Email registration failed", error=e.message)
        raise
    except Exception as e:
        logger.error("Unexpected error in email registration", error=str(e))
        raise InQuestException("An unexpected error occurred", code="INTERNAL_001", status_code=500)


@router.post(
    "/email-login",
    response_model=StandardResponse,
    status_code=200,
    summary="Login with email and password",
)
async def email_login(
    request: EmailLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        result = await AuthService.email_login(db, email=request.email, password=request.password)
        return StandardResponse(message="Login successful", data=result)
    except InQuestException as e:
        logger.warning("Email login failed", error=e.message)
        raise
    except Exception as e:
        logger.error("Unexpected error in email login", error=str(e))
        raise InQuestException("An unexpected error occurred", code="INTERNAL_001", status_code=500)


# ── Google OAuth Route ────────────────────────────────────────────────────────

@router.post(
    "/google",
    response_model=StandardResponse,
    status_code=200,
    summary="Authenticate with Google",
    description="Sign in or register using a Google ID token obtained from the frontend.",
)
async def google_auth(
    request: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        result = await AuthService.google_auth(
            db,
            id_token=request.id_token,
            role=request.role,
            referral_code=request.referral_code,
        )
        return StandardResponse(message="Google authentication successful", data=result)
    except InQuestException as e:
        logger.warning("Google auth failed", error=e.message)
        raise
    except Exception as e:
        logger.error("Unexpected error in Google auth", error=str(e))
        raise InQuestException("An unexpected error occurred", code="INTERNAL_001", status_code=500)
