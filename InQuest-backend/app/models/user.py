"""
User and authentication-related database models.

This module defines the User model and related authentication models for the InQuest system.
All models use SQLAlchemy 2.0+ with proper type hints and relationships.
"""

from datetime import datetime
from decimal import Decimal
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
import enum
import uuid
from app.database import Base


class UserRole(str, enum.Enum):
    """Enum for user roles."""
    PASSENGER = "Passenger"
    DRIVER = "Driver"
    ADMIN = "Admin"
    SUPPORT = "Support"


class MembershipTier(str, enum.Enum):
    """Enum for user membership tiers."""
    STANDARD = "Standard"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"


class User(Base):
    """
    User model for the InQuest system.
    Handles both Passengers and Drivers (roles).
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number: Mapped[str] = mapped_column(sa.String(20), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(sa.String(100), default="", nullable=False)
    last_name: Mapped[str] = mapped_column(sa.String(100), default="", nullable=False)
    email: Mapped[str | None] = mapped_column(sa.String(255), unique=True, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.PASSENGER, nullable=False
    )
    
    # Referral system
    referral_code: Mapped[str] = mapped_column(sa.String(10), unique=True, nullable=False, default=lambda: str(uuid.uuid4())[:6].upper())
    referred_by_id: Mapped[str | None] = mapped_column(sa.String(36), sa.ForeignKey("users.id"), nullable=True)
    
    # Membership and rating
    membership_tier: Mapped[MembershipTier] = mapped_column(
        Enum(MembershipTier), default=MembershipTier.STANDARD, nullable=False
    )
    total_trips: Mapped[int] = mapped_column(default=0, nullable=False)
    rating: Mapped[Decimal | None] = mapped_column(sa.DECIMAL(3, 2), nullable=True)
    
    # Performance/Security
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(default=False, nullable=False)
    emergency_contact: Mapped[str | None] = mapped_column(sa.String(20), nullable=True)
    pin_hash: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    
    # Soft delete
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    trips: Mapped[list["Trip"]] = relationship(
        "Trip",
        primaryjoin="User.id == Trip.passenger_id",
        back_populates="passenger",
        cascade="all, delete-orphan",
    )
    
    # Ride relationships for Passenger/Driver roles
    rides_as_passenger: Mapped[list["Ride"]] = relationship(
        "Ride",
        primaryjoin="User.id == Ride.passenger_id",
        back_populates="passenger",
        cascade="all, delete-orphan",
    )
    
    rides_as_driver: Mapped[list["Ride"]] = relationship(
        "Ride",
        primaryjoin="User.id == Ride.driver_id",
        back_populates="driver",
        cascade="all, delete-orphan",
    )
    
    # A User can be a Driver (KYC/Verification Profile)
    driver_profile: Mapped["DriverProfile"] = relationship(
        "DriverProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
    # Real-time Driver Tracking (from driver.py)
    active_driver_profile: Mapped["Driver"] = relationship(
        "Driver",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
    wallet: Mapped["Wallet"] = relationship(
        "Wallet",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
    guardians: Mapped[list["Guardian"]] = relationship("Guardian", back_populates="user", cascade="all, delete-orphan")
    saved_places: Mapped[list["SavedPlace"]] = relationship("SavedPlace", back_populates="user", cascade="all, delete-orphan")
    recurring_bookings: Mapped[list["RecurringBooking"]] = relationship("RecurringBooking", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    sos_records: Mapped[list["SOS"]] = relationship("SOS", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, phone={self.phone_number}, role={self.role})>"


class OTP(Base):
    """
    OTP (One-Time Password) model for phone number verification.
    """

    __tablename__ = "otps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    phone_number: Mapped[str] = mapped_column(sa.String(20), index=True, nullable=False)
    otp_code: Mapped[str] = mapped_column(sa.String(6), nullable=False)
    attempts: Mapped[int] = mapped_column(default=0, nullable=False)
    is_used: Mapped[bool] = mapped_column(default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<OTP(phone={self.phone_number}, used={self.is_used})>"


class JWTBlacklist(Base):
    """
    JWT Token blacklist for logout functionality.
    """

    __tablename__ = "jwt_blacklist"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    token_jti: Mapped[str] = mapped_column(sa.String(500), unique=True, nullable=False)
    user_id: Mapped[str] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(nullable=False, index=True)

    def __repr__(self) -> str:
        return f"<JWTBlacklist(user_id={self.user_id})>"
