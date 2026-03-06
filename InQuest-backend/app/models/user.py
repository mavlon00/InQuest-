"""
User and authentication-related database models.

This module defines the User, OTP, and JWT blacklist models for authentication.
All models use SQLAlchemy 2.0+ with proper type hints and relationships.
"""

from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """Enum for user roles in the system."""
    PASSENGER = "Passenger"
    DRIVER = "Driver"
    ADMIN = "Admin"
    SUPPORT = "Support"


class User(Base):
    """
    User model representing both passengers and drivers.
    
    Attributes:
        id: Unique user identifier.
        phone_number: International format phone number (unique, indexed).
        first_name: User's first name.
        last_name: User's last name.
        email: User's email address (optional).
        photo_url: URL to user's profile photo (optional).
        role: User role (Passenger, Driver, Admin, Support).
        is_active: Whether the account is active.
        is_verified: Whether the phone number is verified.
        emergency_contact: Emergency contact phone number (optional).
        created_at: Account creation timestamp.
        updated_at: Last update timestamp.
        last_login_at: Last login timestamp.
        relationships:
            rides_as_passenger: Rides where user is the passenger.
            rides_as_driver: Rides where user is the driver.
            wallet: User's wallet account.
            driver_profile: Driver-specific profile (if user is a driver).
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    phone_number: Mapped[str] = mapped_column(
        sa.String(20), unique=True, index=True, nullable=False
    )
    first_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(sa.String(255), unique=True, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(sa.String(500), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.PASSENGER, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(default=False, nullable=False)
    emergency_contact: Mapped[str | None] = mapped_column(
        sa.String(20), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(nullable=True)

    # Relationships
    rides_as_passenger: Mapped[list["Ride"]] = relationship(
        "Ride",
        foreign_keys="Ride.passenger_id",
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
