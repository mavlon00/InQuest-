"""
Ride API routes (/api/v1/rides).

Implements all ride management endpoints including on-spot booking,
scheduled rides, ride tracking, and history.
"""

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal
from app.database import get_db
from app.services.auth_service import AuthService
from app.services.ride_service import RideService
from app.schemas.ride import (
    OnSpotRideRequest,
    ScheduledRideRequest,
    RideStatusUpdate,
    RideDeclineRequest,
    RideResponse,
    FareBreakdownResponse,
    NearbyDriversResponse,
    RideHistoryFilter,
)
from app.utils.responses import StandardResponse, PaginatedResponse
from app.utils.security import extract_user_id_from_token, verify_token
from app.utils.logging_config import get_logger
from app.utils.exceptions import AuthenticationException, InQuestException
from app.models.ride import RideStatus

logger = get_logger(__name__)

# Create rides router
router = APIRouter(prefix="/api/v1/rides", tags=["Rides"])


def get_current_user_id(authorization: str = Header(...)) -> int:
    """Extract user ID from JWT token."""
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise AuthenticationException(
                "Invalid authentication scheme",
                code="AUTH_INVALID_SCHEME",
            )
        payload = verify_token(token)
        return payload.get("user_id")
    except ValueError:
        raise AuthenticationException(
            "Invalid authorization header format",
            code="AUTH_INVALID_HEADER",
        )
    except Exception as e:
        raise AuthenticationException(str(e), code="AUTH_ERROR")


@router.get(
    "/nearby-vehicles",
    response_model=StandardResponse,
    status_code=200,
    summary="Find nearby available drivers",
    description="Search for available drivers near passenger location.",
)
async def get_nearby_vehicles(
    latitude: float = Query(..., description="Passenger latitude"),
    longitude: float = Query(..., description="Passenger longitude"),
    search_radius_meters: int = Query(default=2000, ge=100, le=10000),
    limit: int = Query(default=10, ge=1, le=50),
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Find nearby available drivers.
    
    Returns a list of drivers within the search radius, sorted by distance.
    
    Args:
        latitude: Passenger's current latitude.
        longitude: Passenger's current longitude.
        search_radius_meters: Search radius in meters (100-10000, default 2000).
        limit: Max drivers to return (1-50, default 10).
        authorization: Bearer token.
        db: Database session.
        
    Returns:
        List of nearby drivers with their information.
    """
    try:
        user_id = get_current_user_id(authorization)
        
        drivers = await RideService.find_nearby_drivers(
            db, latitude, longitude, search_radius_meters, limit
        )
        
        logger.info(
            "Nearby drivers searched",
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            found_count=len(drivers),
        )
        
        return StandardResponse(
            message=f"Found {len(drivers)} nearby drivers",
            data=drivers,
        )
    except AuthenticationException as e:
        logger.warning("Authentication failed", error=e.message)
        raise
    except InQuestException as e:
        logger.warning("Error finding nearby drivers", error=e.message)
        raise
    except Exception as e:
        logger.error("Unexpected error in nearby vehicles search", error=str(e))
        raise


@router.post(
    "/onspot/book",
    response_model=StandardResponse,
    status_code=201,
    summary="Request on-spot ride",
    description="Create an on-spot ride request for immediate pickup.",
)
async def book_onspot_ride(
    request: OnSpotRideRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Create an on-spot ride request.
    
    Validates geofence, calculates fare, and creates ride record.
    Sends broadcast to nearby available drivers for acceptance.
    
    Args:
        request: Ride details (pickup and destination coordinates).
        authorization: Bearer token.
        db: Database session.
        
    Returns:
        Created ride details with estimated fare.
        
    Example:
        POST /api/v1/rides/onspot/book
        Headers: Authorization: Bearer <token>
        {
            "pickup_latitude": 6.5244,
            "pickup_longitude": 3.3792,
            "destination_latitude": 6.5300,
            "destination_longitude": 3.3850
        }
    """
    try:
        passenger_id = get_current_user_id(authorization)
        
        # Create ride
        ride = await RideService.create_onspot_ride(
            db,
            passenger_id,
            request.pickup_latitude,
            request.pickup_longitude,
            request.destination_latitude,
            request.destination_longitude,
        )
        
        logger.info(
            "On-spot ride booked",
            ride_id=ride.id,
            passenger_id=passenger_id,
            fare=ride.estimated_fare,
        )
        
        return StandardResponse(
            status="success",
            message="Ride request created successfully",
            data={
                "ride_id": ride.id,
                "status": ride.status.value,
                "estimated_fare": float(ride.estimated_fare),
                "distance_km": float(ride.distance_km) if ride.distance_km else None,
                "created_at": ride.created_at,
            },
            status_code=201,
        )
    except AuthenticationException as e:
        logger.warning("Authentication failed", error=e.message)
        raise
    except InQuestException as e:
        logger.warning("Error booking on-spot ride", error=e.message, code=e.code)
        raise
    except Exception as e:
        logger.error("Unexpected error in on-spot booking", error=str(e))
        raise


@router.post(
    "/personal/create",
    response_model=StandardResponse,
    status_code=201,
    summary="Create scheduled ride",
    description="Request a ride at a specific time (or ASAP).",
)
async def create_scheduled_ride(
    request: ScheduledRideRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Create a scheduled (personal) ride request.
    
    For immediate rides, leave scheduled_time null or set to now.
    
    Args:
        request: Ride details including optional scheduled time.
        authorization: Bearer token.
        db: Database session.
        
    Returns:
        Created ride details.
    """
    try:
        passenger_id = get_current_user_id(authorization)
        
        ride = await RideService.create_onspot_ride(
            db,
            passenger_id,
            request.pickup_latitude,
            request.pickup_longitude,
            request.destination_latitude,
            request.destination_longitude,
        )
        
        # Update scheduled time if provided
        if request.scheduled_time:
            from app.services.ride_service import RideService as RS
            ride.scheduled_time = request.scheduled_time
            await db.commit()
            await db.refresh(ride)
        
        logger.info(
            "Scheduled ride created",
            ride_id=ride.id,
            passenger_id=passenger_id,
        )
        
        return StandardResponse(
            message="Scheduled ride created successfully",
            data={
                "ride_id": ride.id,
                "status": ride.status.value,
                "estimated_fare": float(ride.estimated_fare),
                "scheduled_time": ride.scheduled_time,
            },
            status_code=201,
        )
    except AuthenticationException as e:
        raise
    except InQuestException as e:
        logger.warning("Error creating scheduled ride", error=e.message)
        raise


@router.put(
    "/{ride_id}/accept",
    response_model=StandardResponse,
    status_code=200,
    summary="Accept ride as driver",
    description="Accept a ride request as a driver.",
)
async def accept_ride(
    ride_id: int,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Accept a ride request as driver.
    
    Changes ride status from REQUESTED to CONFIRMED and assigns the driver.
    
    Args:
        ride_id: Ride to accept.
        authorization: Driver's bearer token.
        db: Database session.
        
    Returns:
        Updated ride details.
    """
    try:
        driver_id = get_current_user_id(authorization)
        
        ride = await RideService.accept_ride(db, ride_id, driver_id)
        
        logger.info(
            "Ride accepted by driver",
            ride_id=ride_id,
            driver_id=driver_id,
        )
        
        return StandardResponse(
            message="Ride accepted successfully",
            data={
                "ride_id": ride.id,
                "status": ride.status.value,
                "driver_id": ride.driver_id,
            },
        )
    except AuthenticationException as e:
        raise
    except InQuestException as e:
        logger.warning("Error accepting ride", error=e.message)
        raise


@router.put(
    "/{ride_id}/decline",
    response_model=StandardResponse,
    status_code=200,
    summary="Decline ride as driver",
    description="Decline a ride request and flag for reassignment.",
)
async def decline_ride(
    ride_id: int,
    request: RideDeclineRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Decline a ride as driver.
    
    Records the decline for fairness tracking and system analytics.
    
    Args:
        ride_id: Ride to decline.
        request: Decline reason (optional).
        authorization: Driver's bearer token.
        db: Database session.
        
    Returns:
        Success response.
    """
    try:
        driver_id = get_current_user_id(authorization)
        
        await RideService.decline_ride(db, ride_id, driver_id, request.reason)
        
        logger.info(
            "Ride declined",
            ride_id=ride_id,
            driver_id=driver_id,
        )
        
        return StandardResponse(
            message="Ride declined successfully"
        )
    except AuthenticationException as e:
        raise
    except InQuestException as e:
        logger.warning("Error declining ride", error=e.message)
        raise


@router.get(
    "/{ride_id}",
    response_model=StandardResponse,
    status_code=200,
    summary="Get ride details",
    description="Retrieve details of a specific ride.",
)
async def get_ride(
    ride_id: int,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Get ride details.
    
    Args:
        ride_id: Ride ID.
        authorization: Bearer token.
        db: Database session.
        
    Returns:
        Ride details.
    """
    try:
        user_id = get_current_user_id(authorization)
        
        ride = await RideService.get_ride_by_id(db, ride_id)
        
        # Verify user has access to this ride
        if ride.passenger_id != user_id and ride.driver_id != user_id:
            raise AuthenticationException(
                "You don't have access to this ride",
                code="AUTH_FORBIDDEN",
            )
        
        logger.info("Ride details retrieved", ride_id=ride_id)
        
        return StandardResponse(
            message="Ride details retrieved",
            data={
                "id": ride.id,
                "status": ride.status.value,
                "passenger_id": ride.passenger_id,
                "driver_id": ride.driver_id,
                "pickup_latitude": ride.pickup_latitude,
                "pickup_longitude": ride.pickup_longitude,
                "destination_latitude": ride.destination_latitude,
                "destination_longitude": ride.destination_longitude,
                "distance_km": float(ride.distance_km) if ride.distance_km else None,
                "estimated_fare": float(ride.estimated_fare),
                "actual_fare": float(ride.actual_fare) if ride.actual_fare else None,
                "created_at": ride.created_at,
                "started_at": ride.started_at,
                "completed_at": ride.completed_at,
            },
        )
    except AuthenticationException as e:
        raise
    except InQuestException as e:
        logger.warning("Error retrieving ride", error=e.message)
        raise


@router.post(
    "/{ride_id}/fare",
    response_model=StandardResponse,
    status_code=200,
    summary="Calculate fare breakdown",
    description="Get detailed fare breakdown for a ride.",
)
async def get_fare_breakdown(
    ride_id: int,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    """
    Get fare calculation breakdown.
    
    Returns itemized fare components.
    
    Args:
        ride_id: Ride ID.
        authorization: Bearer token.
        db: Database session.
        
    Returns:
        Detailed fare breakdown.
    """
    try:
        user_id = get_current_user_id(authorization)
        
        ride = await RideService.get_ride_by_id(db, ride_id)
        
        fare, breakdown = RideService.calculate_fare(ride.distance_km or Decimal(0))
        
        return StandardResponse(
            message="Fare breakdown calculated",
            data={
                "ride_id": ride.id,
                "base_fare": float(breakdown["base_fare"]),
                "distance_km": float(breakdown["distance_km"]),
                "distance_charge": float(breakdown["distance_charge"]),
                "waiting_time_minutes": breakdown["waiting_time_minutes"],
                "waiting_time_charge": float(breakdown["waiting_time_charge"]),
                "total_estimated_fare": float(breakdown["total"]),
                "currency": "NGN",
            },
        )
    except AuthenticationException as e:
        raise
    except InQuestException as e:
        logger.warning("Error calculating fare", error=e.message)
        raise
