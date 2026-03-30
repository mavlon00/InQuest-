"""
Ride service containing business logic for ride operations.

Handles on-spot, scheduled, and recurring ride booking, matching, and management.
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.ride import Ride, RideStatus, RideType, DriverProfile, Ride_Decline
from app.models.user import User
from app.utils.geofencing import haversine_distance, is_within_geofence, calculate_bounding_box
from app.utils.exceptions import (
    GeofenceException,
    RideException,
    ResourceNotFoundException,
    ExternalAPIException,
)
from app.utils.logging_config import get_logger
from config import settings

logger = get_logger(__name__)


class RideService:
    """Service for ride operations."""

    @staticmethod
    def calculate_fare(distance_km: Decimal, waiting_minutes: int = 0) -> Tuple[Decimal, dict]:
        """
        Calculate estimated fare based on distance and waiting time.
        
        Breakdown:
        - Base fare: Fixed amount (BASE_FARE_NGN)
        - Distance charge: distance_km * DEAD_MILEAGE_RATE
        - Waiting charge: waiting_minutes * (WAITING_TIME_RATE / 60)
        
        Args:
            distance_km: Distance in kilometers.
            waiting_minutes: Estimated waiting time in minutes.
            
        Returns:
            Tuple of (total_fare, breakdown_dict).
        """
        base_fare = Decimal(str(settings.BASE_FARE_NGN))
        distance_rate = Decimal(str(settings.DEAD_MILEAGE_RATE))
        waiting_rate = Decimal(str(settings.WAITING_TIME_RATE))

        # Convert to Decimals if needed
        distance_km = Decimal(str(distance_km))

        # Calculate components
        distance_charge = distance_km * distance_rate
        waiting_charge = Decimal(str(waiting_minutes)) * (waiting_rate / Decimal(60))
        
        total = base_fare + distance_charge + waiting_charge

        breakdown = {
            "base_fare": base_fare,
            "distance_km": distance_km,
            "distance_charge": distance_charge,
            "waiting_time_minutes": waiting_minutes,
            "waiting_time_charge": waiting_charge,
            "total": total,
        }

        return total, breakdown

    @staticmethod
    async def check_geofence(
        passenger_lat: float,
        passenger_lon: float,
        radius_meters: Optional[int] = None,
    ) -> bool:
        """
        Check if passenger location is within acceptable geofence for on-spot booking.
        
        Args:
            passenger_lat: Passenger latitude.
            passenger_lon: Passenger longitude.
            radius_meters: Geofence radius (defaults to config).
            
        Returns:
            True if within geofence.
            
        Raises:
            GeofenceException: If outside geofence.
        """
        if radius_meters is None:
            radius_meters = settings.GEOFENCE_RADIUS_METERS

        # For on-spot rides, the geofence check is against a reference point
        # In a real system, you might check against city center or specific zones
        # For now, we accept any valid coordinates
        return True

    @staticmethod
    async def find_nearby_drivers(
        db: AsyncSession,
        pickup_lat: float,
        pickup_lon: float,
        search_radius_meters: int = 2000,
        limit: int = 10,
    ) -> List[dict]:
        """
        Find available drivers near pickup location.
        
        Uses geofencing to find drivers within search radius, sorted by distance.
        
        Args:
            db: Database session.
            pickup_lat: Pickup location latitude.
            pickup_lon: Pickup location longitude.
            search_radius_meters: Search radius in meters.
            limit: Maximum drivers to return.
            
        Returns:
            List of nearby driver information dictionaries.
        """
        # Calculate bounding box for initial database query
        bbox = calculate_bounding_box(pickup_lat, pickup_lon, search_radius_meters)

        # Query drivers within bounding box
        result = await db.execute(
            select(
                User.id,
                User.first_name,
                User.last_name,
                DriverProfile.vehicle_plate,
                DriverProfile.vehicle_model,
                DriverProfile.rating,
                DriverProfile.total_trips,
            ).join(
                DriverProfile, User.id == DriverProfile.user_id
            ).where(
                and_(
                    DriverProfile.is_available == True,  # Only available drivers
                    DriverProfile.is_verified == True,  # Only verified drivers
                    User.is_active == True,  # Only active users
                )
            )
        )

        all_drivers = result.all()
        nearby_drivers = []

        # Filter by exact distance and sort
        for driver in all_drivers:
            # In production, store current driver location in Redis or separate table
            # For now, using dummy coordinates
            distance = haversine_distance(
                pickup_lat, pickup_lon,
                pickup_lat + 0.001, pickup_lon + 0.001,  # Dummy driver location
            )

            if distance <= search_radius_meters:
                nearby_drivers.append({
                    "driver_id": driver[0],
                    "driver_name": f"{driver[1]} {driver[2]}",
                    "vehicle_plate": driver[3],
                    "vehicle_model": driver[4],
                    "distance_meters": distance,
                    "rating": float(driver[5]),
                    "total_trips": driver[6],
                    "estimated_arrival_seconds": int(distance / (40 / 3.6)),  # Assuming 40 km/h avg
                })

        # Sort by distance
        nearby_drivers.sort(key=lambda x: x["distance_meters"])

        return nearby_drivers[:limit]

    @staticmethod
    async def create_onspot_ride(
        db: AsyncSession,
        passenger_id: int,
        pickup_lat: float,
        pickup_lon: float,
        destination_lat: float,
        destination_lon: float,
        estimated_distance_km: Optional[Decimal] = None,
    ) -> Ride:
        """
        Create an on-spot ride request.
        
        Validates geofence, calculates fare, and creates ride record.
        
        Args:
            db: Database session.
            passenger_id: Passenger user ID.
            pickup_lat: Pickup location latitude.
            pickup_lon: Pickup location longitude.
            destination_lat: Destination latitude.
            destination_lon: Destination longitude.
            estimated_distance_km: Pre-calculated distance (optional).
            
        Returns:
            Created Ride object.
            
        Raises:
            GeofenceException: If passenger is outside geofence.
            RideException: If ride creation fails.
        """
        try:
            # Validate geofence
            if not await RideService.check_geofence(pickup_lat, pickup_lon):
                raise GeofenceException(
                    "Pickup location is outside service area",
                    code="GEOFENCE_OUTSIDE_AREA",
                )

            # Calculate distance if not provided
            if estimated_distance_km is None:
                estimated_distance_km = Decimal(
                    str(haversine_distance(
                        pickup_lat, pickup_lon,
                        destination_lat, destination_lon,
                    ) / 1000)  # Convert meters to km
                )

            # Calculate fare
            estimated_fare, _ = RideService.calculate_fare(estimated_distance_km)

            # Create ride
            ride = Ride(
                passenger_id=passenger_id,
                ride_type=RideType.ONSPOT,
                status=RideStatus.REQUESTED,
                pickup_latitude=pickup_lat,
                pickup_longitude=pickup_lon,
                destination_latitude=destination_lat,
                destination_longitude=destination_lon,
                distance_km=estimated_distance_km,
                estimated_fare=estimated_fare,
            )

            db.add(ride)
            await db.commit()
            await db.refresh(ride)

            logger.info(
                "On-spot ride created",
                ride_id=ride.id,
                passenger_id=passenger_id,
                estimated_fare=estimated_fare,
            )

            return ride

        except Exception as e:
            await db.rollback()
            logger.error("Failed to create on-spot ride", error=str(e))
            raise

    @staticmethod
    async def accept_ride(
        db: AsyncSession,
        ride_id: int,
        driver_id: int,
    ) -> Ride:
        """
        Accept a ride as driver.
        
        Updates ride status to CONFIRMED and assigns driver.
        
        Args:
            db: Database session.
            ride_id: Ride to accept.
            driver_id: Driver accepting the ride.
            
        Returns:
            Updated Ride object.
            
        Raises:
            ResourceNotFoundException: If ride not found.
            RideException: If ride cannot be accepted.
        """
        # Fetch ride
        result = await db.execute(select(Ride).where(Ride.id == ride_id))
        ride = result.scalars().first()

        if not ride:
            raise ResourceNotFoundException(
                "Ride not found",
                code="RIDE_NOT_FOUND",
            )

        if ride.status != RideStatus.REQUESTED:
            raise RideException(
                f"Ride is not available for acceptance. Current status: {ride.status}",
                code="RIDE_UNAVAILABLE",
            )

        # Update ride
        ride.driver_id = driver_id
        ride.status = RideStatus.CONFIRMED
        ride.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(ride)

        logger.info(
            "Ride accepted",
            ride_id=ride_id,
            driver_id=driver_id,
        )

        return ride

    @staticmethod
    async def decline_ride(
        db: AsyncSession,
        ride_id: int,
        driver_id: int,
        reason: Optional[str] = None,
    ) -> None:
        """
        Decline a ride as driver.
        
        Records the decline for fairness tracking and reassignment.
        
        Args:
            db: Database session.
            ride_id: Ride to decline.
            driver_id: Driver declining the ride.
            reason: Reason for declining (optional).
            
        Raises:
            ResourceNotFoundException: If ride not found.
        """
        # Verify ride exists
        result = await db.execute(select(Ride).where(Ride.id == ride_id))
        ride = result.scalars().first()

        if not ride:
            raise ResourceNotFoundException(
                "Ride not found",
                code="RIDE_NOT_FOUND",
            )

        # Record decline
        decline = Ride_Decline(
            ride_id=ride_id,
            driver_id=driver_id,
            reason=reason,
        )
        db.add(decline)
        await db.commit()

        logger.info(
            "Ride declined",
            ride_id=ride_id,
            driver_id=driver_id,
            reason=reason,
        )

    @staticmethod
    async def update_ride_status(
        db: AsyncSession,
        ride_id: int,
        new_status: RideStatus,
    ) -> Ride:
        """
        Update ride status with appropriate timestamps.
        
        Args:
            db: Database session.
            ride_id: Ride to update.
            new_status: New status.
            
        Returns:
            Updated Ride object.
            
        Raises:
            ResourceNotFoundException: If ride not found.
        """
        result = await db.execute(select(Ride).where(Ride.id == ride_id))
        ride = result.scalars().first()

        if not ride:
            raise ResourceNotFoundException(
                "Ride not found",
                code="RIDE_NOT_FOUND",
            )

        # Update status and timestamp
        ride.status = new_status
        ride.updated_at = datetime.utcnow()

        # Set specific timestamps based on status
        if new_status == RideStatus.IN_PROGRESS:
            ride.started_at = datetime.utcnow()
        elif new_status == RideStatus.COMPLETED:
            ride.completed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(ride)

        logger.info(
            "Ride status updated",
            ride_id=ride_id,
            new_status=new_status,
        )

        return ride

    @staticmethod
    async def get_ride_by_id(db: AsyncSession, ride_id: int) -> Ride:
        """
        Fetch ride by ID.
        
        Args:
            db: Database session.
            ride_id: Ride ID to fetch.
            
        Returns:
            Ride object.
            
        Raises:
            ResourceNotFoundException: If ride not found.
        """
        result = await db.execute(select(Ride).where(Ride.id == ride_id))
        ride = result.scalars().first()

        if not ride:
            raise ResourceNotFoundException(
                "Ride not found",
                code="RIDE_NOT_FOUND",
            )

        return ride
