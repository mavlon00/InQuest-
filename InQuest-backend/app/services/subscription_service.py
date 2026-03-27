"""
Subscription service for managing recurring ride bookings and schedules.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.features import RecurringBooking, RecurringBookingStatus
from app.utils.exceptions import ResourceNotFoundException
from decimal import Decimal
import uuid
from datetime import datetime

class SubscriptionService:
    @staticmethod
    async def create_recurring_booking(
        db: AsyncSession,
        user_id: str,
        pickup_lat: float,
        pickup_lng: float,
        pickup_address: str,
        dest_lat: float,
        dest_lng: float,
        dest_address: str,
        days_of_week: List[int],
        time: str,
        payment_method: str = "WALLET",
        label: Optional[str] = None
    ) -> RecurringBooking:
        """Create a new recurring booking schedule."""
        booking = RecurringBooking(
            user_id=user_id,
            pickup_lat=Decimal(str(pickup_lat)),
            pickup_lng=Decimal(str(pickup_lng)),
            pickup_address=pickup_address,
            dest_lat=Decimal(str(dest_lat)),
            dest_lng=Decimal(str(dest_lng)),
            dest_address=dest_address,
            days_of_week=days_of_week,
            time=time,
            payment_method=payment_method,
            label=label,
            status=RecurringBookingStatus.ACTIVE
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)
        return booking

    @staticmethod
    async def get_user_subscriptions(db: AsyncSession, user_id: str) -> List[RecurringBooking]:
        """List all recurring bookings for a user."""
        stmt = select(RecurringBooking).where(RecurringBooking.user_id == user_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update_subscription_status(
        db: AsyncSession, 
        subscription_id: str, 
        status: str
    ) -> RecurringBooking:
        """Pause or resume a recurring booking."""
        stmt = select(RecurringBooking).where(RecurringBooking.id == subscription_id)
        result = await db.execute(stmt)
        booking = result.scalar_one_or_none()
        
        if not booking:
            raise ResourceNotFoundException("Subscription not found")
            
        booking.status = RecurringBookingStatus(status)
        await db.commit()
        await db.refresh(booking)
        return booking

    @staticmethod
    async def delete_subscription(db: AsyncSession, subscription_id: str) -> None:
        """Delete a recurring booking schedule."""
        stmt = delete(RecurringBooking).where(RecurringBooking.id == subscription_id)
        await db.execute(stmt)
        await db.commit()
