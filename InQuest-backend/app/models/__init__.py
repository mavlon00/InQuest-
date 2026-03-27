"""
Database models for InQuest Mobility Service.

Exports all SQLAlchemy ORM models used throughout the application.
"""

# User and Authentication
from app.models.user import User, OTP, JWTBlacklist, UserRole, MembershipTier

# Trips and Booking
from app.models.trip import Trip, TripStatus, PaymentMethod, TripRating, Dispute
from app.models.ride import Ride, RideStatus, RideType, DriverProfile, Ride_Decline

# Wallet and Payments
from app.models.wallet import Wallet, Transaction, TransactionType, TransactionStatus, TransactionCategory
from app.models.payment import Payment, PaymentStatus

# Features (Guardian, Notification, SavedPlace, RecurringBooking, SOS)
from app.models.features import (
    Guardian, GuardianStatus,
    Notification, NotificationType,
    SavedPlace, SavedPlaceLabel,
    RecurringBooking, RecurringBookingStatus,
    SOS, SOSStatus,
)

# Subscription and IoT
from app.models.subscription import (
    RecurringSubscription, SubscriptionStatus,
    SubscriptionDriverMapping, IoTSensorReading,
    EmergencyAlert
)

# Driver and Vehicles
from app.models.driver import Driver, Vehicle

__all__ = [
    # Users
    "User",
    "OTP",
    "JWTBlacklist",
    "UserRole",
    "MembershipTier",
    
    # Trips
    "Trip",
    "TripStatus",
    "PaymentMethod",
    "TripRating",
    "Dispute",
    "Ride",
    "RideStatus",
    "RideType",
    "Ride_Decline",
    
    # Wallet
    "Wallet",
    "Transaction",
    "TransactionType",
    "TransactionStatus",
    "TransactionCategory",
    "Payment",
    "PaymentStatus",
    
    # Features
    "Guardian",
    "GuardianStatus",
    "Notification",
    "NotificationType",
    "SavedPlace",
    "SavedPlaceLabel",
    "RecurringBooking",
    "RecurringBookingStatus",
    "SOS",
    "SOSStatus",

    # Subscription
    "RecurringSubscription",
    "SubscriptionStatus",
    "SubscriptionDriverMapping",
    "IoTSensorReading",
    "EmergencyAlert",
    
    # Driver
    "Driver",
    "DriverProfile",
    "Vehicle",
]

