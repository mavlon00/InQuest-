"""
Profile API routes (/api/v1/profile).
"""

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.profile_service import ProfileService
from app.services.auth_service import AuthService
from app.schemas.profile import (
    UpdateProfileRequest,
    MembershipTierResponse,
    UpdateEmergencyContactsRequest,
    ReferralStatsResponse,
)
from app.utils.responses import StandardResponse, ErrorResponse
from app.utils.security import verify_token
from app.utils.logging_config import get_logger
from app.utils.exceptions import InQuestException, AuthenticationException, ResourceNotFoundException

logger = get_logger(__name__)

# Create profile router
router = APIRouter(prefix="/api/v1/profile", tags=["User Profile"])

async def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract user ID from JWT token."""
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise AuthenticationException(
                "Invalid authentication scheme",
                code="AUTH_INVALID_SCHEME",
            )
        payload = verify_token(token)
        return str(payload.get("user_id"))
    except ValueError:
        raise AuthenticationException(
            "Invalid authorization header format",
            code="AUTH_INVALID_HEADER",
        )
    except Exception as e:
        raise AuthenticationException(str(e), code="AUTH_ERROR")

@router.get(
    "/detail",
    response_model=StandardResponse,
    summary="Get user profile detail",
    description="Retrieve full authenticated user profile details.",
)
async def get_profile_detail(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
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
                "membership_tier": user.membership_tier.value,
                "referral_code": user.referral_code,
                "total_trips": user.total_trips,
                "rating": float(user.rating) if user.rating else None,
                "emergency_contact": user.emergency_contact,
                "created_at": user.created_at.isoformat()
            }
        )
    except Exception as e:
        logger.error(f"Error getting profile detail: {e}")
        raise

@router.patch(
    "/update",
    response_model=StandardResponse,
    summary="Update user profile",
    description="Update non-critical profile information like name or email.",
)
async def update_profile_partial(
    request: UpdateProfileRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        user = await AuthService.update_profile(
            db, 
            user_id, 
            first_name=request.first_name, 
            last_name=request.last_name
        )
        
        if request.email:
            user.email = request.email
            await db.commit()
            
        return StandardResponse(
            message="Profile updated successfully",
            data={"id": user.id, "updated_at": user.updated_at.isoformat()}
        )
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise

@router.get(
    "/tier",
    response_model=StandardResponse,
    summary="Get membership tier info",
    description="Retrieve current membership level and progress to next level.",
)
async def get_tier_info(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        tier_data = await ProfileService.get_membership_tier(db, user_id)
        return StandardResponse(
            message="Tier info retrieved successfully",
            data=tier_data
        )
    except Exception as e:
        logger.error(f"Error getting tier info: {e}")
        raise

@router.put(
    "/emergency-contacts",
    response_model=StandardResponse,
    summary="Update emergency contacts",
)
async def update_emergency_contacts(
    request: UpdateEmergencyContactsRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        # Update first contact as main emergency_contact in User table
        if request.contacts:
            user = await AuthService.get_user_by_id(db, user_id)
            user.emergency_contact = request.contacts[0].phone
            await db.commit()
            
        return StandardResponse(message="Emergency contacts updated successfully")
    except Exception as e:
        logger.error(f"Error updating emergency contacts: {e}")
        raise

@router.get(
    "/referrals",
    response_model=StandardResponse,
    summary="Get referral statistics",
)
async def get_referral_stats(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        ref_data = await ProfileService.get_referral_stats(db, user_id)
        return StandardResponse(
            message="Referral stats retrieved successfully",
            data=ref_data
        )
    except Exception as e:
        logger.error(f"Error getting referral stats: {e}")
        raise
