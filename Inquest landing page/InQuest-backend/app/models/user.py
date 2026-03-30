"""
User and authentication-related database models.

This module defines the User model and related authentication models for the passenger app.
All models use SQLAlchemy 2.0+ with proper type hints and relationships, following the spec.
"""

from datetime import datetime
from decimal import Decimal
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
import enum
import uuid
from app.database import Base


class MembershipTier(str, enum.Enum):
    """Enum for user membership tiers."""
    STANDARD = "Standard"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"


class User(Base):
    """
    User model for passengers in the InQuest system.
    Phone-based authentication, referenced by all user activities.
    
    Attributes:
        id: UUID primary key.
        phone: Nigerian phone number in +234 format (unique, indexed).
        first_name: User's first name.
        last_name: User's last name.
        email: User's email (optional, unique).
        profile_photo_url: CDN URL to profile photo.
        referral_code: 6-char unique code for referrals.
        referred_by_id: FK to user who referred this user.
        membership_tier: Current tier (Standard/Silver/Gold/Platinum).
        total_trips: Denormalized counter for tier calculations.
        rating: Average passenger rating (1-5).
        pin_hash: Bcrypt hash of 4-digit transaction PIN.
        deleted_at: Soft delete timestamp.
        created_at: Account creation time.
        updated_at: Last update time.
        relationships:
            trips: All trips as passenger.
            wallet: Wallet account.
            guardians: Emergency contacts.
            saved_places: Saved locations.
            recurring_bookings: Scheduled rides.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone: Mapped[str] = mapped_column(sa.String(20), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(sa.String(255), unique=True, nullable=True)
    profile_photo_url: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    
    # Referral system
    referral_code: Mapped[str] = mapped_column(sa.String(10), unique=True, nullable=False)
    referred_by_id: Mapped[str | None] = mapped_column(sa.String(36), sa.ForeignKey("users.id"), nullable=True)
    
    # Membership and rating
    membership_tier: Mapped[MembershipTier] = mapped_column(
        Enum(MembershipTier), default=MembershipTier.STANDARD, nullable=False
    )
    total_trips: Mapped[int] = mapped_column(default=0, nullable=False)
    rating: Mapped[Decimal | None] = mapped_column(sa.DECIMAL(3, 2), nullable=True)
    
    # Security
    pin_hash: Mapped[str | None] = mapped_column(sa.String(255), nullable=True)
    
    # Soft delete
    deleted_at: Mapped[datetime | None] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    trips: Mapped[list["Trip"]] = relationship(
        "Trip",
        foreign_keys="Trip.passenger_id",
        back_populates="passenger",
        cascade="all, delete-orphan",
    )
    rides_as_driver: Mapped[list["Ride"]] = relationship(
        "Ride",
        foreign_keys="Ride.driver_id",
        back_populates="driver",
        cascade="all, delete-orphan",
    )
    wallet: Mapped["Wallet"] = relationship(
        "Wallet",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    driver_profile: Mapped["Driver"] = relationship(
        "Driver",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        """String representation of User."""
        return f"<User(id={self.id}, phone={self.phone_number}, role={self.role})>"


class OTP(Base):
    """
    OTP (One-Time Password) model for phone number verification.
    
    Stores OTPs sent to users for authentication. OTPs are temporary and expire
    after a configured duration.
    
    Attributes:
        id: Unique OTP record identifier.
        phone_number: Phone number for which OTP was generated.
        otp_code: The 6-digit OTP value.
        attempts: Number of verification attempts made.
        is_used: Whether this OTP has been successfully used.
        created_at: When the OTP was generated.
        expires_at: When the OTP expires.
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
        """String representation of OTP."""
        return f"<OTP(phone={self.phone_number}, used={self.is_used})>"


class JWTBlacklist(Base):
    """
    JWT Token blacklist for logout functionality.
    
    Stores JWTs that have been invalidated (e.g., on logout) to prevent reuse.
    This allows for proper session management and secure logout.
    
    Attributes:
        id: Unique blacklist entry identifier.
        token_jti: JWT ID claim (unique token identifier).
        user_id: User who owns this token.
        created_at: When token was blacklisted.
        expires_at: When token would have expired anyway.
    """

    __tablename__ = "jwt_blacklist"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    token_jti: Mapped[str] = mapped_column(sa.String(500), unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(nullable=False, index=True)

    def __repr__(self) -> str:
        """String representation of JWTBlacklist."""
        return f"<JWTBlacklist(user_id={self.user_id})>"
