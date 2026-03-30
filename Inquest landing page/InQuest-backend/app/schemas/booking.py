"""
Booking request/response schemas for personal, on-spot, and recurring rides.

Pydantic models for all booking endpoints per specification.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ============================================================================
# LOCATION & COMMON MODELS
# ============================================================================

class Location(BaseModel):
    """A geographic location with coordinates and address."""
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")
    address: str = Field(..., description="Formatted address")


class Stop(BaseModel):
    """Additional stop during a trip."""
    lat: float
    lng: float
    address: str


class Driver(BaseModel):
    """Driver information in trip responses."""
    id: str
    name: str
    phone: str
    rating: float
    photo_url: Optional[str] = None
    vehicle_plate: str
    vehicle_color: str
    vehicle_model: str
    location: Location


# ============================================================================
# FARE ESTIMATE
# ============================================================================

class FareEstimateRequest(BaseModel):
    """
    Request body for POST /api/v1/bookings/estimate
    
    Spec: Section 3.1 - Get Fare Estimate
    """
    pickup: Location = Field(..., description="Pickup location")
    destination: Location = Field(..., description="Destination location")
    stops: Optional[List[Stop]] = Field(None, description="Additional stops")
    insurance: bool = Field(False, description="Include insurance")
    scheduled_time: Optional[str] = Field(None, description="ISO8601 timestamp for scheduled rides")


class FareBreakdown(BaseModel):
    """Detailed fare breakdown."""
    base_rate: float
    per_km_rate: float
    dead_mileage_km: float
    dead_mileage_rate: float


class FareEstimateResponse(BaseModel):
    """Response for fare estimation."""
    success: bool = True
    data: dict


# ============================================================================
# PERSONAL RIDE BOOKING
# ============================================================================

class CreateBookingRequest(BaseModel):
    """
    Request body for POST /api/v1/bookings
    
    Spec: Section 3.2 - Create Booking
    """
    pickup: Location = Field(..., description="Pickup location")
    destination: Location = Field(..., description="Destination location")
    stops: Optional[List[Stop]] = Field(None, description="Additional stops")
    scheduled_time: Optional[str] = Field(None, description="ISO8601 for scheduled rides (30+ min future)")
    insurance: bool = Field(False, description="Include insurance")
    payment_method: str = Field(..., description="WALLET, CASH, or CARD")
    guest: Optional[dict] = Field(None, description="Guest booking: {name, phone}")
    estimate_ref: Optional[str] = Field(None, description="Reference from estimate call")


class CreateBookingResponse(BaseModel):
    """Response for booking creation."""
    success: bool = True
    data: dict


class ActiveBookingResponse(BaseModel):
    """
    Response for GET /api/v1/bookings/active
    
    Spec: Section 3.3 - Get Active Booking
    """
    success: bool = True
    data: Optional[dict] = None  # None if no active booking


class BookingStatusResponse(BaseModel):
    """Status of a booking (poll response)."""
    success: bool = True
    data: dict


class CancelBookingRequest(BaseModel):
    """
    Request body for POST /api/v1/bookings/:bookingId/cancel
    
    Spec: Section 3.5 - Cancel Booking
    """
    reason: Optional[str] = Field(None, description="Cancellation reason")


# ============================================================================
# ON-SPOT BOOKING
# ============================================================================

class NearbyKekes(BaseModel):
    """Available on-spot kekes near passenger."""
    class Keke(BaseModel):
        driver_id: str
        driver_name: str
        driver_rating: float
        location: Location
        heading: int
        distance_meters: int
        available_seats: int
        total_seats: int
        vehicle_plate: str
        vehicle_color: str
        is_bookable: bool
    
    kekes: List[Keke]
    bookable_count: int
    timestamp: str


class BookOnSpotRequest(BaseModel):
    """
    Request body for POST /api/v1/on-spot/book
    
    Spec: Section 4.2 - Book On-Spot Keke
    """
    driver_id: str = Field(..., description="UUID of driver")
    passenger_location: Location = Field(..., description="Current passenger location")
    destination: Location = Field(..., description="Destination")
    seats_required: int = Field(..., ge=1, description="Number of seats needed")
    payment_method: str = Field(..., description="WALLET or CASH")


# ============================================================================
# RECURRING / SCHEDULED BOOKINGS
# ============================================================================

class CreateRecurringBookingRequest(BaseModel):
    """
    Request body for POST /api/v1/recurring-bookings
    
    Spec: Section 5.1 - Create Recurring Booking
    """
    pickup: Location = Field(..., description="Pickup location")
    destination: Location = Field(..., description="Destination location")
    days_of_week: List[int] = Field(
        ..., 
        description="0=Sun, 1=Mon... 6=Sat. E.g. [1,2,3,4,5] for weekdays"
    )
    time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="24-hour HH:mm format")
    payment_method: str = Field(..., description="WALLET or CASH")
    label: Optional[str] = Field(None, description="User label (e.g., 'Morning commute')")


class UpdateRecurringBookingStatusRequest(BaseModel):
    """
    Request body for PATCH /api/v1/recurring-bookings/:id/status
    
    Spec: Section 5.3 - Pause/Resume
    """
    status: str = Field(..., description="ACTIVE or PAUSED")


# ============================================================================
# TRIP HISTORY & DISPUTES
# ============================================================================

class FileDisputeRequest(BaseModel):
    """
    Request body for POST /api/v1/trips/:tripId/dispute
    
    Spec: Section 7.4 - File a Dispute
    """
    category: str = Field(
        ..., 
        description="OVERCHARGE, WRONG_ROUTE, DRIVER_BEHAVIOUR, ACCIDENT, OTHER"
    )
    description: str = Field(..., min_length=20, max_length=500, description="Dispute description")
    evidence: Optional[List[str]] = Field(None, description="Base64 images or URLs (max 3)")


class ReportLostItemRequest(BaseModel):
    """
    Request body for POST /api/v1/trips/:tripId/lost-and-found
    
    Spec: Section 7.5 - Report Lost and Found
    """
    item_description: str = Field(..., description="What was lost")
    contact_phone: Optional[str] = Field(None, description="Alternative contact phone")


# ============================================================================
# RATING
# ============================================================================

class SubmitRatingRequest(BaseModel):
    """
    Request body for POST /api/v1/trips/:tripId/rating
    
    Spec: Section 16.1 - Submit Driver Rating
    """
    rating: int = Field(..., ge=1, le=5, description="Rating 1-5")
    comment: Optional[str] = Field(None, max_length=300, description="Optional comment")
    tags: Optional[List[str]] = Field(None, description="CLEAN_VEHICLE, SAFE_DRIVER, FRIENDLY, FAST, etc.")
