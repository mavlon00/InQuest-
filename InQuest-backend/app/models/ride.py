"""
Ride and booking-related database models.

This module defines models for rides, bookings, and ride history.
Supports on-spot, scheduled, and recurring ride types.
"""

from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
import enum
from decimal import Decimal
from app.database import Base


class RideStatus(str, enum.Enum):
    """Enum for ride status progression."""
    REQUESTED = "REQUESTED"  # Initial request created
    CONFIRMED = "CONFIRMED"  # Driver accepted
    ARRIVED = "ARRIVED"  # Driver arrived at pickup
    IN_PROGRESS = "IN_PROGRESS"  # Ride started
    COMPLETED = "COMPLETED"  # Ride finished
    CANCELLED = "CANCELLED"  # Ride cancelled
    NO_SHOW = "NO_SHOW"  # Passenger didn't show up


class RideType(str, enum.Enum):
    """Enum for ride booking types."""
    ONSPOT = "ONSPOT"  # Street hailing
    SCHEDULED = "SCHEDULED"  # Personal/scheduled rides
    RECURRING = "RECURRING"  # Subscription-based recurring


class Ride(Base):
    """
    Ride model representing a ride request and execution.
    
    This is the core model for all ride types (on-spot, scheduled, recurring).
    
    Attributes:
        id: Unique ride identifier.
        passenger_id: ID of the passenger requesting the ride.
        driver_id: ID of the driver accepting the ride (nullable until accepted).
        ride_type: Type of ride (ONSPOT, SCHEDULED, RECURRING).
        status: Current ride status.
        pickup_latitude: Latitude of pickup location.
        pickup_longitude: Longitude of pickup location.
        destination_latitude: Latitude of destination.
        destination_longitude: Longitude of destination.
        distance_km: Estimated distance in kilometers.
        estimated_fare: Estimated fare in NGN.
        actual_fare: Actual fare charged (set after completion).
        scheduled_time: Scheduled departure time (for scheduled rides).
        created_at: When ride was requested.
        started_at: When ride actually started.
        completed_at: When ride was completed.
        updated_at: Last status update.
        relationships:
            passenger: The passenger who requested the ride.
            driver: The driver who accepted the ride.
            payments: Payment records for this ride.
    """

    __tablename__ = "rides"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    passenger_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    driver_id: Mapped[int | None] = mapped_column(
        sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    subscription_id: Mapped[int | None] = mapped_column(
        sa.ForeignKey("recurring_subscriptions.id", ondelete="SET NULL"), nullable=True, index=True
    )

    ride_type: Mapped[RideType] = mapped_column(
        Enum(RideType), nullable=False, index=True
    )
    status: Mapped[RideStatus] = mapped_column(
        Enum(RideStatus), default=RideStatus.REQUESTED, nullable=False, index=True
    )

    # Location
    pickup_latitude: Mapped[float] = mapped_column(nullable=False)
    pickup_longitude: Mapped[float] = mapped_column(nullable=False)
    destination_latitude: Mapped[float] = mapped_column(nullable=False)
    destination_longitude: Mapped[float] = mapped_column(nullable=False)

    # Distance and fare
    distance_km: Mapped[Decimal] = mapped_column(
        sa.Numeric(10, 2), nullable=True
    )
    estimated_fare: Mapped[Decimal] = mapped_column(
        sa.Numeric(12, 2), nullable=False
    )
    actual_fare: Mapped[Decimal | None] = mapped_column(
        sa.Numeric(12, 2), nullable=True
    )

    # Timing
    scheduled_time: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    passenger: Mapped["User"] = relationship(
        "User",
        foreign_keys="Ride.passenger_id",
        back_populates="rides_as_passenger",
    )
    driver: Mapped["User | None"] = relationship(
        "User",
        foreign_keys="Ride.driver_id",
        back_populates="rides_as_driver",
    )
    payments: Mapped[list["Payment"]] = relationship(
        "Payment",
        back_populates="ride",
        cascade="all, delete-orphan",
    )
    subscription: Mapped["RecurringSubscription | None"] = relationship(
        "RecurringSubscription",
        foreign_keys="Ride.subscription_id",
        back_populates="rides",
    )

    def __repr__(self) -> str:
        """String representation of Ride."""
        return f"<Ride(id={self.id}, status={self.status}, type={self.ride_type})>"


class DriverProfile(Base):
    """
    Extended driver profile with vehicle and verification details.
    
    Attributes:
        id: Unique profile identifier.
        user_id: Associated user ID (driver).
        license_number: Driver's license number.
        license_expiry: When license expires.
        vehicle_plate: Vehicle license plate number.
        vehicle_model: Vehicle model (e.g., "Toyota Corolla").
        vehicle_year: Vehicle year of manufacture.
        insurance_expiry: Vehicle insurance expiry date.
        national_id: National ID number.
        bank_name: Bank for commission payments.
        bank_account: Bank account number.
        account_name: Bank account holder name.
        rating: Driver's average rating (1-5).
        total_trips: Total number of completed trips.
        total_earnings: Total earnings to date.
        package_tier: Driver's commission package tier.
        is_available: Whether driver is currently available.
        is_verified: Whether driver has completed verification.
        created_at: Profile creation date.
        updated_at: Last profile update.
        relationships:
            user: Associated User object.
    """

    __tablename__ = "driver_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    # License and ID
    license_number: Mapped[str] = mapped_column(sa.String(50), unique=True, nullable=False)
    license_expiry: Mapped[datetime] = mapped_column(nullable=False)
    national_id: Mapped[str] = mapped_column(sa.String(50), unique=True, nullable=False)

    # Vehicle
    vehicle_plate: Mapped[str] = mapped_column(sa.String(10), unique=True, nullable=False)
    vehicle_model: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    vehicle_year: Mapped[int] = mapped_column(nullable=False)
    insurance_expiry: Mapped[datetime] = mapped_column(nullable=False)

    # Bank
    bank_name: Mapped[str] = mapped_column(sa.String(100), nullable=True)
    bank_account: Mapped[str] = mapped_column(sa.String(20), nullable=True)
    account_name: Mapped[str] = mapped_column(sa.String(100), nullable=True)

    # Stats
    rating: Mapped[Decimal] = mapped_column(
        sa.Numeric(3, 2), default=Decimal("5.00"), nullable=False
    )
    total_trips: Mapped[int] = mapped_column(default=0, nullable=False)
    total_earnings: Mapped[Decimal] = mapped_column(
        sa.Numeric(15, 2), default=Decimal("0.00"), nullable=False
    )

    # Status
    package_tier: Mapped[str] = mapped_column(
        sa.String(50),
        default="Basic",
        nullable=False,
    )
    is_available: Mapped[bool] = mapped_column(default=False, nullable=False, index=True)
    is_verified: Mapped[bool] = mapped_column(default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="driver_profile")

    def __repr__(self) -> str:
        """String representation of DriverProfile."""
        return f"<DriverProfile(user_id={self.user_id}, plate={self.vehicle_plate})>"


class Ride_Decline(Base):
    """
    Track when drivers decline rides for analytics and fairness.
    
    Used to implement round-robin or fair distribution among drivers
    who have declined this ride.
    
    Attributes:
        id: Unique record identifier.
        ride_id: Ride that was declined.
        driver_id: Driver who declined.
        reason: Reason for declining (optional).
        declined_at: When decline happened.
    """

    __tablename__ = "ride_declines"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ride_id: Mapped[int] = mapped_column(
        sa.ForeignKey("rides.id", ondelete="CASCADE"), nullable=False
    )
    driver_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    reason: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    declined_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    def __repr__(self) -> str:
        """String representation of RideDecline."""
        return f"<RideDecline(ride_id={self.ride_id}, driver_id={self.driver_id})>"
