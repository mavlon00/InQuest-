"""
Driver and Vehicle models.

Represents driver profiles and vehicle information for the driver side of the system.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Driver(Base):
    """
    Driver profile information.
    
    Attributes:
        id: UUID primary key.
        name: Driver's full name.
        phone: Driver's phone number (unique).
        photo_url: URL to driver's profile photo.
        rating: Average driver rating (calculated after each trip rating).
        total_trips: Denormalized counter for statistics.
        is_online: Online status (updated by driver app heartbeat).
        lat, lng: Current location (from Redis in production).
        heading: Direction in degrees 0-360.
        vehicle_id: FK to Vehicle they're driving.
        created_at: When driver registered.
    """

    __tablename__ = "drivers"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    phone: Mapped[str] = mapped_column(sa.String(20), unique=True, nullable=False)
    photo_url: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    
    rating: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(3, 2), nullable=True)
    total_trips: Mapped[int] = mapped_column(default=0, nullable=False)
    
    is_online: Mapped[bool] = mapped_column(default=False, nullable=False)
    
    # Current location (normally from Redis)
    lat: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(10, 8), nullable=True)
    lng: Mapped[Optional[Decimal]] = mapped_column(sa.DECIMAL(11, 8), nullable=True)
    heading: Mapped[Optional[Decimal]] = mapped_column(nullable=True)  # 0-360 degrees
    
    vehicle_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("vehicles.id"), nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", foreign_keys=[vehicle_id])
    trips: Mapped[list["Trip"]] = relationship(
        "Trip",
        foreign_keys="Trip.driver_id",
        back_populates="driver"
    )
    
    def __repr__(self) -> str:
        return f"<Driver(id={self.id}, name={self.name}, online={self.is_online})>"


class Vehicle(Base):
    """
    Vehicle information for drivers.
    
    Attributes:
        id: UUID primary key.
        plate_number: Vehicle registration plate (unique).
        model: Vehicle make and model (e.g., "Bajaj RE").
        color: Vehicle color.
        year: Year manufactured.
        seating_capacity: Total seats available.
        created_at: When vehicle was registered.
    """

    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    plate_number: Mapped[str] = mapped_column(sa.String(20), unique=True, nullable=False)
    model: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    color: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    year: Mapped[int] = mapped_column(nullable=False)
    seating_capacity: Mapped[int] = mapped_column(default=4, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    
    def __repr__(self) -> str:
        return f"<Vehicle(plate={self.plate_number}, model={self.model})>"
