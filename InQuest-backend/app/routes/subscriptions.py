"""
Subscription / Recurring Booking API routes.
"""

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.subscription_service import SubscriptionService
from app.schemas.booking import (
    CreateRecurringBookingRequest,
    UpdateRecurringBookingStatusRequest,
)
from app.utils.responses import StandardResponse, ErrorResponse
from app.utils.security import verify_token
from app.utils.logging_config import get_logger
from app.utils.exceptions import InQuestException, AuthenticationException, ResourceNotFoundException

logger = get_logger(__name__)

# Create subscriptions router
router = APIRouter(prefix="/api/v1/recurring-bookings", tags=["Recurring Bookings"])

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

@router.post("/", response_model=StandardResponse)
async def create_recurring_booking(
    request: CreateRecurringBookingRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        booking = await SubscriptionService.create_recurring_booking(
            db, user_id,
            request.pickup.lat, request.pickup.lng, request.pickup.address,
            request.destination.lat, request.destination.lng, request.destination.address,
            request.days_of_week, request.time, request.payment_method, request.label
        )
        return StandardResponse(
            message="Recurring booking created successfully",
            data={"id": str(booking.id), "status": "ACTIVE"}
        )
    except Exception as e:
        logger.error(f"Error creating recurring booking: {e}")
        raise

@router.get("/", response_model=StandardResponse)
async def get_recurring_bookings(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        bookings = await SubscriptionService.get_user_subscriptions(db, user_id)
        return StandardResponse(
            message="Recurring bookings retrieved successfully",
            data=[
                {
                    "id": str(b.id),
                    "pickup": {"lat": float(b.pickup_lat), "lng": float(b.pickup_lng), "address": b.pickup_address},
                    "destination": {"lat": float(b.dest_lat), "lng": float(b.dest_lng), "address": b.dest_address},
                    "days_of_week": b.days_of_week,
                    "time": b.time,
                    "payment_method": b.payment_method,
                    "status": b.status.value,
                    "label": b.label
                } for b in bookings
            ]
        )
    except Exception as e:
        logger.error(f"Error getting recurring bookings: {e}")
        raise

@router.patch("/{id}/status", response_model=StandardResponse)
async def update_status(
    id: str,
    request: UpdateRecurringBookingStatusRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        booking = await SubscriptionService.update_subscription_status(db, id, request.status)
        return StandardResponse(
            message=f"Subscription status updated to {request.status}",
            data={"id": str(booking.id), "status": booking.status.value}
        )
    except Exception as e:
        logger.error(f"Error updating status: {e}")
        raise

@router.delete("/{id}", response_model=StandardResponse)
async def delete_subscription(
    id: str,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        await SubscriptionService.delete_subscription(db, id)
        return StandardResponse(message="Subscription deleted successfully")
    except Exception as e:
        logger.error(f"Error deleting subscription: {e}")
        raise
