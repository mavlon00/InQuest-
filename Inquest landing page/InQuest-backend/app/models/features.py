"""
Guardian, Notification, SavedPlace, RecurringBooking, and SOS models.

Guardian: Emergency contacts for safety alerts.
Notification: In-app notification history and preferences.
SavedPlace: User's saved frequently visited locations (HOME, WORK, OTHER).
RecurringBooking: Weekly scheduled ride bookings.
SOS: Emergency alert records.
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
    from app.models.trip import Trip


# ============================================================================
# GUARDIAN MODEL
# ============================================================================

class GuardianStatus(str, enum.Enum):
    """Status of guardian registration."""
    PENDING = "PENDING"         # SMS sent, awaiting confirmation
    ACTIVE = "ACTIVE"           # Confirmed and will receive alerts
    DECLINED = "DECLINED"       # Guardian declined


class Guardian(Base):
    """
    Emergency contact that receives trip alerts and SOS notifications.
    
    Attributes:
        id: UUID primary key.
        user_id: FK to User (passenger this guardian protects).
        name: Guardian's full name.
        phone: Guardian's Nigerian phone number.
        relation: Relationship to user (Mother, Brother, Friend, etc.).
        status: PENDING, ACTIVE, or DECLINED.
        token: Unique confirmation token sent via SMS.
        created_at: When guardian was added.
    """

    __tablename__ = "guardians"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(sa.String(100), nullable=False)
    phone: Mapped[str] = mapped_column(sa.String(20), nullable=False)
    relation: Mapped[str] = mapped_column(sa.String(50), nullable=False)
    status: Mapped[GuardianStatus] = mapped_column(
        Enum(GuardianStatus), default=GuardianStatus.PENDING, nullable=False
    )
    token: Mapped[Optional[str]] = mapped_column(sa.String(100), unique=True, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="guardians")


# ============================================================================
# NOTIFICATION MODEL
# ============================================================================

class NotificationType(str, enum.Enum):
    """Types of notifications delivered to users."""
    DRIVER_ASSIGNED = "DRIVER_ASSIGNED"
    DRIVER_EN_ROUTE = "DRIVER_EN_ROUTE"
    DRIVER_ARRIVED = "DRIVER_ARRIVED"
    TRIP_STARTED = "TRIP_STARTED"
    TRIP_COMPLETED = "TRIP_COMPLETED"
    TRIP_CANCELLED = "TRIP_CANCELLED"
    WALLET_TOPUP = "WALLET_TOPUP"
    TRANSFER_RECEIVED = "TRANSFER_RECEIVED"
    REFERRAL_REWARD = "REFERRAL_REWARD"
    GUARDIAN_ALERT = "GUARDIAN_ALERT"
    GREEN_POINTS = "GREEN_POINTS"
    SUBSCRIPTION_REMINDER = "SUBSCRIPTION_REMINDER"
    PROMOTIONAL = "PROMOTIONAL"


class Notification(Base):
    """
    In-app notification history. Tracks all notifications sent to users.
    
    Attributes:
        id: UUID primary key.
        user_id: FK to User recipient.
        type: Notification type.
        title: Short title.
        body: Notification body text.
        data: JSONB for type-specific data (tripId, driverId, etc.).
        is_read: Whether user has read this notification.
        read_at: When notification was marked as read.
        created_at: When notification was sent.
    """

    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, index=True
    )
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType), nullable=False)
    title: Mapped[str] = mapped_column(sa.String(150), nullable=False)
    body: Mapped[str] = mapped_column(sa.Text, nullable=False)
    data: Mapped[Optional[dict]] = mapped_column(sa.JSON, nullable=True)
    
    is_read: Mapped[bool] = mapped_column(default=False, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="notifications")


# ============================================================================
# SAVED PLACE MODEL
# ============================================================================

class SavedPlaceLabel(str, enum.Enum):
    """Types of saved places."""
    HOME = "HOME"
    WORK = "WORK"
    OTHER = "OTHER"


class SavedPlace(Base):
    """
    User's saved frequently-visited locations.
    
    Attributes:
        id: UUID primary key.
        user_id: FK to User.
        label: HOME, WORK, or OTHER.
        name: Custom name (required if label is OTHER).
        address: Formatted address.
        lat, lng: Precise coordinates.
        created_at: When place was saved.
    """

    __tablename__ = "saved_places"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[SavedPlaceLabel] = mapped_column(Enum(SavedPlaceLabel), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(sa.String(100), nullable=True)
    address: Mapped[str] = mapped_column(sa.Text, nullable=False)
    lat: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 8), nullable=False)
    lng: Mapped[Decimal] = mapped_column(sa.DECIMAL(11, 8), nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="saved_places")


# ============================================================================
# RECURRING BOOKING MODEL
# ============================================================================

class RecurringBookingStatus(str, enum.Enum):
    """Status of recurring booking schedule."""
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"


class RecurringBooking(Base):
    """
    Weekly scheduled/recurring ride bookings.
    System auto-creates Trip 15 minutes before each scheduled time.
    
    Attributes:
        id: UUID primary key.
        user_id: FK to User.
        pickup_lat, pickup_lng, pickup_address: Pickup location.
        dest_lat, dest_lng, dest_address: Destination location.
        days_of_week: INTEGER array [0=Sun, 1=Mon, ..., 6=Sat].
        time: HH:mm format (24-hour).
        payment_method: WALLET or CASH.
        status: ACTIVE or PAUSED.
        label: User-defined label.
        created_at: When schedule was created.
    """

    __tablename__ = "recurring_bookings"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    
    # Locations
    pickup_lat: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 8), nullable=False)
    pickup_lng: Mapped[Decimal] = mapped_column(sa.DECIMAL(11, 8), nullable=False)
    pickup_address: Mapped[str] = mapped_column(sa.Text, nullable=False)
    
    dest_lat: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 8), nullable=False)
    dest_lng: Mapped[Decimal] = mapped_column(sa.DECIMAL(11, 8), nullable=False)
    dest_address: Mapped[str] = mapped_column(sa.Text, nullable=False)
    
    # Schedule
    days_of_week: Mapped[list] = mapped_column(sa.JSON, nullable=False)  # [0-6]
    time: Mapped[str] = mapped_column(sa.String(5), nullable=False)  # HH:mm
    
    # Booking details
    payment_method: Mapped[str] = mapped_column(sa.String(10), nullable=False)
    status: Mapped[RecurringBookingStatus] = mapped_column(
        Enum(RecurringBookingStatus), default=RecurringBookingStatus.ACTIVE, nullable=False
    )
    label: Mapped[Optional[str]] = mapped_column(sa.String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="recurring_bookings")


# ============================================================================
# SOS MODEL
# ============================================================================

class SOSStatus(str, enum.Enum):
    """Status of SOS alert."""
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"


class SOS(Base):
    """
    Emergency SOS alert triggered by passenger.
    
    Attributes:
        id: UUID primary key.
        user_id: FK to User (who triggered SOS).
        trip_id: FK to Trip (nullable - can fire outside trip).
        lat, lng: Location where SOS was triggered.
        status: ACTIVE or RESOLVED.
        resolution: How SOS was resolved (FALSE_ALARM, RESOLVED, ASSISTANCE_PROVIDED).
        notes: Additional notes about incident.
        resolved_at: When SOS was resolved.
        created_at: When SOS was triggered.
    """

    __tablename__ = "sos"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    trip_id: Mapped[Optional[str]] = mapped_column(
        sa.String(36), sa.ForeignKey("trips.id", ondelete="SET NULL"), nullable=True
    )
    
    lat: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 8), nullable=False)
    lng: Mapped[Decimal] = mapped_column(sa.DECIMAL(11, 8), nullable=False)
    
    status: Mapped[SOSStatus] = mapped_column(
        Enum(SOSStatus), default=SOSStatus.ACTIVE, nullable=False
    )
    resolution: Mapped[Optional[str]] = mapped_column(sa.String(50), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    
    resolved_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="sos_records")
    trip: Mapped[Optional["Trip"]] = relationship("Trip", foreign_keys=[trip_id])
