"""
Feature API routes for SOS, Guardians, Saved Places, and Notifications.
"""

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.feature_service import FeatureService
from app.schemas.profile import (
    TriggerSOSRequest, ResolveSOSRequest,
    AddGuardianRequest, GuardiansListResponse, SendGuardianAlertRequest,
    SavePlaceRequest, UpdatePlaceRequest, SavedPlacesListResponse,
    NotificationsListResponse, RegisterDeviceTokenRequest, UpdateNotificationPreferencesRequest
)
from app.utils.responses import StandardResponse, ErrorResponse
from app.utils.security import verify_token
from app.utils.logging_config import get_logger
from app.utils.exceptions import InQuestException, AuthenticationException, ResourceNotFoundException

logger = get_logger(__name__)

# Create features router
router = APIRouter(prefix="/api/v1", tags=["Safety & Features"])

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

# --- SOS ---
@router.post("/sos/trigger", response_model=StandardResponse)
async def trigger_sos(
    request: TriggerSOSRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        sos = await FeatureService.trigger_sos(
            db, user_id, request.location["lat"], request.location["lng"], request.trip_id
        )
        return StandardResponse(
            message="SOS alert triggered successfully",
            data={"id": str(sos.id), "status": "ACTIVE"}
        )
    except Exception as e:
        logger.error(f"Error triggering SOS: {e}")
        raise

@router.post("/sos/{sos_id}/resolve", response_model=StandardResponse)
async def resolve_sos(
    sos_id: str,
    request: ResolveSOSRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        # Verify user is owner or admin (omitted for now)
        sos = await FeatureService.resolve_sos(db, sos_id, request.resolution, request.notes)
        return StandardResponse(
            message="SOS alert resolved",
            data={"id": str(sos.id), "status": "RESOLVED"}
        )
    except ResourceNotFoundException as e:
        raise
    except Exception as e:
        logger.error(f"Error resolving SOS: {e}")
        raise

# --- Guardians ---
@router.post("/guardians", response_model=StandardResponse)
async def add_guardian(
    request: AddGuardianRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        guardian = await FeatureService.add_guardian(
            db, user_id, request.name, request.phone, request.relation
        )
        return StandardResponse(
            message="Guardian added successfully",
            data={"id": str(guardian.id), "status": "PENDING"}
        )
    except Exception as e:
        logger.error(f"Error adding guardian: {e}")
        raise

@router.get("/guardians", response_model=StandardResponse)
async def get_guardians(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        guardians = await FeatureService.get_guardians(db, user_id)
        return StandardResponse(
            message="Guardians retrieved successfully",
            data=[
                {
                    "id": str(g.id),
                    "name": g.name,
                    "phone": g.phone,
                    "relation": g.relation,
                    "status": g.status.value
                } for g in guardians
            ]
        )
    except Exception as e:
        logger.error(f"Error getting guardians: {e}")
        raise

# --- Saved Places ---
@router.post("/places", response_model=StandardResponse)
async def add_place(
    request: SavePlaceRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        place = await FeatureService.add_place(
            db, user_id, request.label, request.address, request.location["lat"], request.location["lng"], request.name
        )
        return StandardResponse(
            message="Place saved successfully",
            data={"id": str(place.id)}
        )
    except Exception as e:
        logger.error(f"Error adding place: {e}")
        raise

@router.get("/places", response_model=StandardResponse)
async def get_places(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        places = await FeatureService.get_places(db, user_id)
        return StandardResponse(
            message="Saved places retrieved successfully",
            data=[
                {
                    "id": str(p.id),
                    "label": p.label.value,
                    "name": p.name,
                    "address": p.address,
                    "lat": float(p.lat),
                    "lng": float(p.lng)
                } for p in places
            ]
        )
    except Exception as e:
        logger.error(f"Error getting places: {e}")
        raise

# --- Notifications ---
@router.get("/notifications", response_model=StandardResponse)
async def get_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        notifications = await FeatureService.get_notifications(db, user_id, limit, offset)
        return StandardResponse(
            message="Notifications retrieved successfully",
            data={
                "notifications": [
                    {
                        "id": str(n.id),
                        "type": n.type.value,
                        "title": n.title,
                        "body": n.body,
                        "data": n.data,
                        "is_read": n.is_read,
                        "created_at": n.created_at.isoformat()
                    } for n in notifications
                ],
                "limit": limit,
                "offset": offset,
                "count": len(notifications)
            }
        )
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise

@router.get("/notifications/unread-count", response_model=StandardResponse)
async def get_unread_count(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        # Mocking for now
        return StandardResponse(
            message="Unread count retrieved",
            data={"count": 0}
        )
    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        raise
