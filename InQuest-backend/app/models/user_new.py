"""
User model for passengers in the InQuest Mobility system.

Phone-based authentication, foundational entity for all user activities.
Follows the specification exactly with all required fields and relationships.
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
    from app.models.trip import Trip
    from app.models.wallet import Wallet
    from app.models.features import Guardian, SavedPlace, RecurringBooking, SOS, Notification


class MembershipTier(str, enum.Enum):
    """User membership tiers with benefits."""
    STANDARD = "Standard"
    SILVER = "Silver"
    GOLD = "Gold"
    PLATINUM = "Platinum"


class User(Base):
    """
    User model for passengers in the InQuest system.
    Phone-based authentication, referenced by all user activities.
    
    All attributes match the specification Section 18 - User model.
    
    Attributes:
        id: UUID v4 primary key.
        phone: Nigerian phone number (+234 format), unique and indexed.
        first_name: User's first name (2+ characters).
        last_name: User's last name (2+ characters).
        email: User's email address (optional, unique).
        profile_photo_url: CDN URL to profile photo.
        
        Referral System:
            referral_code: 6-char alphanumeric unique code.
            referred_by_id: FK to user who referred this user.
        
        Tier & Stats:
            membership_tier: Current tier (Standard/Silver/Gold/Platinum).
            total_trips: Denormalized counter for tier calculations.
            rating: Average passenger rating (1-5, NULL if no ratings).
        
        Security:
            pin_hash: Bcrypt hash of 4-digit transaction PIN (optional).
        
        Soft Delete:
            deleted_at: Soft delete timestamp (NULL if active).
        
        Timestamps:
            created_at: Account creation time.
            updated_at: Last update time.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        sa.String(36), primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    
    # Core identity
    phone: Mapped[str] = mapped_column(
        sa.String(20), unique=True, index=True, nullable=False
    )
    first_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(
        sa.String(255), unique=True, nullable=True
    )
    profile_photo_url: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    
    # Referral system
    referral_code: Mapped[str] = mapped_column(
        sa.String(10), unique=True, nullable=False
    )
    referred_by_id: Mapped[Optional[str]] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    
    # Membership and stats
    membership_tier: Mapped[MembershipTier] = mapped_column(
        Enum(MembershipTier), default=MembershipTier.STANDARD, nullable=False
    )
    total_trips: Mapped[int] = mapped_column(default=0, nullable=False)
    rating: Mapped[Optional[Decimal]] = mapped_column(
        sa.DECIMAL(3, 2), nullable=True
    )
    
    # Security
    pin_hash: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    
    # Soft delete
    deleted_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    trips: Mapped[list["Trip"]] = relationship(
        "Trip",
        foreign_keys="Trip.passenger_id",
        back_populates="passenger",
        cascade="all, delete-orphan"
    )
    
    wallet: Mapped[Optional["Wallet"]] = relationship(
        "Wallet",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        foreign_keys="Wallet.user_id"
    )
    
    guardians: Mapped[list["Guardian"]] = relationship(
        "Guardian",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Guardian.user_id"
    )
    
    saved_places: Mapped[list["SavedPlace"]] = relationship(
        "SavedPlace",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="SavedPlace.user_id"
    )
    
    recurring_bookings: Mapped[list["RecurringBooking"]] = relationship(
        "RecurringBooking",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="RecurringBooking.user_id"
    )
    
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Notification.user_id"
    )
    
    sos_records: Mapped[list["SOS"]] = relationship(
        "SOS",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="SOS.user_id"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, phone={self.phone}, tier={self.membership_tier})>"
    
    def is_deleted(self) -> bool:
        """Check if user account is soft-deleted."""
        return self.deleted_at is not None
