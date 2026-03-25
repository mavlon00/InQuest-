"""
Subscription and IoT-related database models.

This module handles recurring subscription rides and IoT sensor data.
"""

from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
import enum
from decimal import Decimal
from app.database import Base


class SubscriptionStatus(str, enum.Enum):
    """Enum for subscription status."""
    ACTIVE = "ACTIVE"  # Currently active
    PAUSED = "PAUSED"  # Temporarily paused
    CANCELLED = "CANCELLED"  # Cancelled
    EXPIRED = "EXPIRED"  # Ended


class RecurringSubscription(Base):
    """
   Recurring trip subscription for regular commuters.
    
    Allows passengers to subscribe to regular routes with:
    - Auto-assignment of drivers
    - Preferential pricing
    - Guaranteed availability during subscription times
    
    Attributes:
        id: Unique subscription identifier.
        passenger_id: Passenger subscribing.
        pickup_latitude: Regular pickup location latitude.
        pickup_longitude: Regular pickup location longitude.
        destination_latitude: Regular destination latitude.
        destination_longitude: Regular destination longitude.
        days_of_week: Days when subscription is active (JSON: [1-7]).
        scheduled_time: Daily ride time (HH:MM format).
        status: Subscription status.
        total_cost: Total subscription cost in NGN.
        monthly_cost: Monthly cost breakdown.
        start_date: Subscription start date.
        end_date: Subscription end date.
        next_ride_date: Next scheduled ride date.
        created_at: When subscription was created.
        updated_at: Last update.
        relationships:
            passenger: Passenger User object.
            subscribed_drivers: Drivers enrolled in this subscription.
            rides: Historical rides under this subscription.
    """

    __tablename__ = "recurring_subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    passenger_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Route
    pickup_latitude: Mapped[float] = mapped_column(nullable=False)
    pickup_longitude: Mapped[float] = mapped_column(nullable=False)
    destination_latitude: Mapped[float] = mapped_column(nullable=False)
    destination_longitude: Mapped[float] = mapped_column(nullable=False)

    # Schedule
    days_of_week: Mapped[str] = mapped_column(
        sa.String(50), nullable=False
    )  # JSON: [1,2,3,4,5]
    scheduled_time: Mapped[str] = mapped_column(
        sa.String(5), nullable=False
    )  # HH:MM format

    # Status and Costs
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False
    )
    total_cost: Mapped[Decimal] = mapped_column(sa.Numeric(12, 2), nullable=False)
    monthly_cost: Mapped[Decimal] = mapped_column(
        sa.Numeric(12, 2), nullable=False
    )

    # Dates
    start_date: Mapped[datetime] = mapped_column(nullable=False)
    end_date: Mapped[datetime | None] = mapped_column(nullable=True)
    next_ride_date: Mapped[datetime] = mapped_column(nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    passenger: Mapped["User"] = relationship("User")
    subscribed_drivers: Mapped[list["SubscriptionDriverMapping"]] = relationship(
        "SubscriptionDriverMapping",
        back_populates="subscription",
        cascade="all, delete-orphan",
    )
    rides: Mapped[list["Ride"]] = relationship(
        "Ride",
        foreign_keys="Ride.subscription_id",
        back_populates="subscription",
    )

    def __repr__(self) -> str:
        """String representation of RecurringSubscription."""
        return f"<RecurringSubscription(id={self.id}, passenger_id={self.passenger_id}, status={self.status})>"


class SubscriptionDriverMapping(Base):
    """
    Maps drivers who opted in to handle specific recurring subscriptions.
    
    Used for driver availability management and auto-assignment.
    
    Attributes:
        id: Unique mapping identifier.
        subscription_id: Subscription.
        driver_id: Driver who opted in.
        is_available: Whether driver is currently available for this subscription.
        total_rides_completed: Total rides completed under this subscription.
       rating_on_route: Driver rating specific to this subscription.
        opted_in_at: When driver opted in.
    """

    __tablename__ = "subscription_driver_mappings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subscription_id: Mapped[int] = mapped_column(
        sa.ForeignKey("recurring_subscriptions.id", ondelete="CASCADE"), nullable=False
    )
    driver_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    is_available: Mapped[bool] = mapped_column(default=True, nullable=False)
    total_rides_completed: Mapped[int] = mapped_column(default=0, nullable=False)
    rating_on_route: Mapped[Decimal] = mapped_column(
        sa.Numeric(3, 2), nullable=True
    )

    opted_in_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )

    # Relationships
    subscription: Mapped["RecurringSubscription"] = relationship(
        "RecurringSubscription", back_populates="subscribed_drivers"
    )
    driver: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        """String representation."""
        return f"<SubscriptionDriverMapping(subscription_id={self.subscription_id}, driver_id={self.driver_id})>"


class IoTSensorReading(Base):
    """
    IoT sensor data from vehicles (GPS, occupancy, emergency alerts).
    
    Attributes:
        id: Unique reading identifier.
        vehicle_id: Vehicle sending the data (driver's user_id).
        latitude: Vehicle GPS latitude.
        longitude: Vehicle GPS longitude.
        occupancy_level: Passenger count (0-4).
        speed_kmh: Vehicle speed in km/h.
        temperature_celsius: Vehicle internal temperature.
        panic_button_triggered: Whether panic button was activated.
        reading_timestamp: Timestamp from device.
        created_at: When reading was received by backend.
    """

    __tablename__ = "iot_sensor_readings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Location
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)

    # Sensors
    occupancy_level: Mapped[int | None] = mapped_column(nullable=True)
    speed_kmh: Mapped[float | None] = mapped_column(nullable=True)
    temperature_celsius: Mapped[float | None] = mapped_column(nullable=True)
    panic_button_triggered: Mapped[bool] = mapped_column(default=False, nullable=False)

    reading_timestamp: Mapped[datetime] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<IoTSensorReading(vehicle_id={self.vehicle_id}, created_at={self.created_at})>"


class EmergencyAlert(Base):
    """
    Emergency/SOS alerts from drivers or passengers.
    
    Used for safety monitoring and immediate response coordination.
    
    Attributes:
        id: Unique alert identifier.
        triggered_by_id: User who triggered the alert.
        ride_id: Associated ride (if any).
        latitude: Alert location latitude.
        longitude: Alert location longitude.
        alert_type: Type of emergency.
        description: Additional details.
        status: Alert status (NEW, ACKNOWLEDGED, RESOLVED).
        created_at: When alert was triggered.
        acknowledged_at: When acknowledged by support.
        resolved_at: When marked as resolved.
    """

    __tablename__ = "emergency_alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    triggered_by_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    ride_id: Mapped[int | None] = mapped_column(
        sa.ForeignKey("rides.id", ondelete="SET NULL"), nullable=True
    )

    # Location
    latitude: Mapped[float] = mapped_column(nullable=False)
    longitude: Mapped[float] = mapped_column(nullable=False)

    # Alert Info
    alert_type: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.String(500), nullable=True)
    status: Mapped[str] = mapped_column(
        sa.String(20), default="NEW", nullable=False, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    acknowledged_at: Mapped[datetime | None] = mapped_column(nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    triggered_by: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        """String representation."""
        return f"<EmergencyAlert(id={self.id}, type={self.alert_type}, status={self.status})>"
