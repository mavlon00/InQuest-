"""
Ride and booking-related Pydantic schemas.

Defines request and response schemas for ride booking endpoints.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


class LocationRequest(BaseModel):
    """Request schema for location with coordinates."""

    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude coordinate (-90 to 90)",
    )
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude coordinate (-180 to 180)",
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "latitude": 6.5244,
                "longitude": 3.3792,
            }
        }


class OnSpotRideRequest(BaseModel):
    """Request schema for on-spot ride booking."""

    pickup_latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Pickup location latitude",
    )
    pickup_longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Pickup location longitude",
    )
    destination_latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Destination latitude",
    )
    destination_longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Destination longitude",
    )

    @validator("pickup_latitude", "pickup_longitude", "destination_latitude", "destination_longitude", pre=True)
    def validate_coordinates(cls, v):
        """Validate coordinates"""
        return float(v)

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "pickup_latitude": 6.5244,
                "pickup_longitude": 3.3792,
                "destination_latitude": 6.5300,
                "destination_longitude": 3.3850,
            }
        }


class ScheduledRideRequest(BaseModel):
    """Request schema for scheduled ride booking."""

    pickup_latitude: float = Field(..., description="Pickup latitude")
    pickup_longitude: float = Field(..., description="Pickup longitude")
    destination_latitude: float = Field(..., description="Destination latitude")
    destination_longitude: float = Field(..., description="Destination longitude")
    scheduled_time: Optional[datetime] = Field(
        None,
        description="Scheduled departure time (ISO format). If None, ASAP.",
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "pickup_latitude": 6.5244,
                "pickup_longitude": 3.3792,
                "destination_latitude": 6.5300,
                "destination_longitude": 3.3850,
                "scheduled_time": "2024-01-20T10:30:00",
            }
        }


class RideStatusUpdate(BaseModel):
    """Request schema for updating ride status."""

    status: str = Field(
        ...,
        description="New ride status (CONFIRMED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED)",
    )
    notes: Optional[str] = Field(
        None,
        description="Additional notes or reason for status change",
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "status": "ARRIVED",
                "notes": "Driver has arrived at pickup location",
            }
        }


class RideDeclineRequest(BaseModel):
    """Request schema for declining a ride."""

    reason: Optional[str] = Field(
        None,
        description="Reason for declining the ride",
    )

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "reason": "Too far away",
            }
        }


class RideResponse(BaseModel):
    """Response schema for ride information."""

    id: int = Field(..., description="Ride ID")
    passenger_id: int = Field(..., description="Passenger user ID")
    driver_id: Optional[int] = Field(None, description="Driver user ID")
    ride_type: str = Field(..., description="Ride type (ONSPOT, SCHEDULED, RECURRING)")
    status: str = Field(..., description="Current ride status")

    # Locations
    pickup_latitude: float = Field(..., description="Pickup latitude")
    pickup_longitude: float = Field(..., description="Pickup longitude")
    destination_latitude: float = Field(..., description="Destination latitude")
    destination_longitude: float = Field(..., description="Destination longitude")

    # Distance and fare
    distance_km: Optional[Decimal] = Field(None, description="Distance in kilometers")
    estimated_fare: Decimal = Field(..., description="Estimated fare in NGN")
    actual_fare: Optional[Decimal] = Field(None, description="Actual fare charged")

    # Timing
    scheduled_time: Optional[datetime] = Field(None, description="Scheduled departure time")
    created_at: datetime = Field(..., description="Ride creation timestamp")
    started_at: Optional[datetime] = Field(None, description="Ride start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Ride completion timestamp")

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "passenger_id": 5,
                "driver_id": 3,
                "ride_type": "ONSPOT",
                "status": "IN_PROGRESS",
                "pickup_latitude": 6.5244,
                "pickup_longitude": 3.3792,
                "destination_latitude": 6.5300,
                "destination_longitude": 3.3850,
                "distance_km": "12.50",
                "estimated_fare": "5000.00",
                "actual_fare": "5200.00",
                "created_at": "2024-01-15T10:30:00",
                "started_at": "2024-01-15T10:45:00",
                "completed_at": None,
            }
        }


class FareBreakdownResponse(BaseModel):
    """Response schema for fare calculation breakdown."""

    base_fare: Decimal = Field(..., description="Base fare in NGN")
    distance_km: Decimal = Field(..., description="Distance in kilometers")
    distance_charge: Decimal = Field(..., description="Charge for distance")
    dead_mileage_charge: Decimal = Field(..., description="Charge for dead mileage")
    waiting_time_minutes: int = Field(..., description="Estimated waiting time in minutes")
    waiting_time_charge: Decimal = Field(..., description="Charge for waiting time")
    estimated_total: Decimal = Field(..., description="Total estimated fare")
    currency: str = Field(default="NGN", description="Currency code")

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "base_fare": "500.00",
                "distance_km": "12.50",
                "distance_charge": "1250.00",
                "dead_mileage_charge": "250.00",
                "waiting_time_minutes": 5,
                "waiting_time_charge": "100.00",
                "estimated_total": "2100.00",
                "currency": "NGN",
            }
        }


class NearbyDriversResponse(BaseModel):
    """Response schema for nearby drivers search."""

    driver_id: int = Field(..., description="Driver user ID")
    driver_name: str = Field(..., description="Driver full name")
    vehicle_plate: str = Field(..., description="Vehicle license plate")
    vehicle_model: str = Field(..., description="Vehicle model")
    current_latitude: float = Field(..., description="Current driver latitude")
    current_longitude: float = Field(..., description="Current driver longitude")
    distance_to_pickup_meters: float = Field(..., description="Distance to pickup in meters")
    rating: Decimal = Field(..., description="Driver rating")
    total_trips: int = Field(..., description="Driver's total completed trips")
    estimated_arrival_seconds: int = Field(..., description="ETA in seconds")

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "driver_id": 3,
                "driver_name": "Mohammed Ahmed",
                "vehicle_plate": "KTW 234 BK",
                "vehicle_model": "Toyota Corolla",
                "current_latitude": 6.5250,
                "current_longitude": 3.3800,
                "distance_to_pickup_meters": 450.5,
                "rating": "4.85",
                "total_trips": 250,
                "estimated_arrival_seconds": 180,
            }
        }


class RideHistoryFilter(BaseModel):
    """Request schema for filtering ride history."""

    status: Optional[str] = Field(
        None,
        description="Filter by ride status",
    )
    ride_type: Optional[str] = Field(
        None,
        description="Filter by ride type",
    )
    start_date: Optional[datetime] = Field(
        None,
        description="Filter rides from this date onwards",
    )
    end_date: Optional[datetime] = Field(
        None,
        description="Filter rides until this date",
    )
    page: int = Field(default=1, ge=1, description="Page number")
    size: int = Field(default=20, ge=1, le=100, description="Items per page")

    @validator("size")
    def validate_size(cls, v):
        """Validate page size"""
        return min(v, 100)  # Max 100 items per page

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "status": "COMPLETED",
                "ride_type": "ONSPOT",
                "start_date": "2024-01-01T00:00:00",
                "end_date": "2024-01-31T23:59:59",
                "page": 1,
                "size": 20,
            }
        }
