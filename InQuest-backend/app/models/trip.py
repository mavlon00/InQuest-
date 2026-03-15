"""
Trip model for booking and ride management.

Replaces the Ride model. Represents a single trip from pickup to destination,
with comprehensive status tracking and fare breakdown.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
import enum
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.driver import Driver


class TripStatus(str, enum.Enum):
    """Trip status progression."""
    REQUESTED = "REQUESTED"           # Initial state
    ACCEPTED = "ACCEPTED"             # Driver has accepted
    EN_ROUTE = "EN_ROUTE"             # Driver moving to pickup
    ARRIVING = "ARRIVING"             # Within 100m of pickup
    ARRIVED = "ARRIVED"               # Driver at pickup location
    IN_PROGRESS = "IN_PROGRESS"       # Trip started (left pickup)
    COMPLETING = "COMPLETING"        # Within 300m of destination
    COMPLETED = "COMPLETED"           # Trip finished
    CANCELLED = "CANCELLED"           # Trip cancelled


class PaymentMethod(str, enum.Enum):
    """Payment methods for trips."""
    WALLET = "WALLET"
    CASH = "CASH"
    CARD = "CARD"


class Trip(Base):
    """
    Trip model representing a single booking from pickup to destination.
    
    Attributes:
        id: UUID primary key.
        passenger_id: FK to User (passenger).
        driver_id: FK to Driver (null until assigned).
        status: Current trip status (indexed for fast queries).
        
        Pickup/Destination:
            pickup_lat, pickup_lng: Pickup coordinates.
            pickup_address: Formatted pickup address.
            dest_lat, dest_lng: Destination coordinates.
            dest_address: Formatted destination address.
        
        Stops:
            stops: JSONB array of additional stops (optional).
        
        Fare Breakdown:
            base_fare: Flag fall + distance.
            dead_mileage_fee: Distance from driver to passenger.
            stop_fees: Charges for additional stops.
            waiting_fee: Charges after 5-min grace at pickup.
            insurance_fee: Optional insurance coverage.
            total_fare: Final calculated fare (null until completion).
        
        Payment & Booking:
            payment_method: WALLET, CASH, or CARD.
            insurance: Whether insurance is included.
            guest_name, guest_phone: If booked for someone else.
            scheduled_time: For scheduled/recurring rides.
        
        Timing:
            acceptance_timestamp: When driver accepted (used for cancellation fee).
            arrived_at: When driver arrived at pickup.
            started_at: When driver started trip (left pickup).
            completed_at: When trip was completed.
        
        Cancellation:
            cancellation_fee: Fee applied if cancelled after grace period.
            cancellation_reason: Why it was cancelled.
        
        Rewards:
            green_points_earned: Points credited to passenger.
    """

    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    passenger_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, index=True
    )
    driver_id: Mapped[Optional[str]] = mapped_column(
        sa.String(36), sa.ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True
    )
    
    # Status tracking (indexed for fast queries)
    status: Mapped[TripStatus] = mapped_column(
        Enum(TripStatus), default=TripStatus.REQUESTED, nullable=False, index=True
    )
    
    # Coordinates (use DECIMAL for precision)
    pickup_lat: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 8), nullable=False)
    pickup_lng: Mapped[Decimal] = mapped_column(sa.DECIMAL(11, 8), nullable=False)
    pickup_address: Mapped[str] = mapped_column(sa.Text, nullable=False)
    
    dest_lat: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 8), nullable=False)
    dest_lng: Mapped[Decimal] = mapped_column(sa.DECIMAL(11, 8), nullable=False)
    dest_address: Mapped[str] = mapped_column(sa.Text, nullable=False)
    
    # Additional stops as JSONB array
    stops: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)
    
    # Fare breakdown
    base_fare: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 2), nullable=False)
    dead_mileage_fee: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(10, 2), nullable=True)
    stop_fees: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(10, 2), nullable=True)
    waiting_fee: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(10, 2), nullable=True)
    insurance_fee: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(10, 2), nullable=True)
    total_fare: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(10, 2), nullable=True)
    
    # Payment and booking details
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod), nullable=False
    )
    insurance: Mapped[bool] = mapped_column(default=False, nullable=False)
    guest_name: Mapped[Optional[str]] = mapped_column(sa.String(100), nullable=True)
    guest_phone: Mapped[Optional[str]] = mapped_column(sa.String(20), nullable=True)
    scheduled_time: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    
    # Timestamps
    acceptance_timestamp: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    arrived_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    
    # Cancellation info
    cancellation_fee: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(10, 2), nullable=True)
    cancellation_reason: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    
    # Rewards
    green_points_earned: Mapped[Optional[int]] = mapped_column(nullable=True)
    
    # Standard timestamps
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships (use string references to avoid circular imports)
    passenger: Mapped["User"] = relationship("User", foreign_keys=[passenger_id])
    driver: Mapped[Optional["Driver"]] = relationship("Driver", foreign_keys=[driver_id])
    rating: Mapped[Optional["TripRating"]] = relationship(
        "TripRating", back_populates="trip", uselist=False, cascade="all, delete-orphan"
    )
    dispute: Mapped[Optional["Dispute"]] = relationship(
        "Dispute", back_populates="trip", uselist=False, cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Trip(id={self.id}, passenger_id={self.passenger_id}, status={self.status})>"


class TripRating(Base):
    """
    Rating submitted by passenger for a completed trip.
    Max 48 hours after completion.
    """

    __tablename__ = "trip_ratings"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    rating: Mapped[int] = mapped_column(nullable=False)  # 1-5
    comment: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    tags: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)  # CLEAN_VEHICLE, SAFE_DRIVER, etc.
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    
    trip: Mapped[Trip] = relationship("Trip", foreign_keys=[trip_id], back_populates="rating")
    
    def __repr__(self) -> str:
        return f"<TripRating(trip_id={self.trip_id}, rating={self.rating})>"


class Dispute(Base):
    """
    Dispute filed by passenger within 48 hours of trip completion.
    """

    __tablename__ = "disputes"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    category: Mapped[str] = mapped_column(nullable=False)  # OVERCHARGE, WRONG_ROUTE, DRIVER_BEHAVIOUR, ACCIDENT, OTHER
    description: Mapped[str] = mapped_column(sa.Text, nullable=False)
    evidence: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)  # URLs or base64 images
    status: Mapped[str] = mapped_column(default="OPEN", nullable=False)  # OPEN, IN_REVIEW, RESOLVED
    resolution: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    
    trip: Mapped[Trip] = relationship("Trip", foreign_keys=[trip_id], back_populates="dispute")
    
    def __repr__(self) -> str:
        return f"<Dispute(trip_id={self.trip_id}, status={self.status})>"

