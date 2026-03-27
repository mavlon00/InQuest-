"""
Feature service for managing secondary features: SOS, Guardians, Saved Places, and Notifications.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy import select, update, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.features import (
    SOS, SOSStatus, Guardian, GuardianStatus, 
    SavedPlace, SavedPlaceLabel, Notification, NotificationType
)
from app.utils.exceptions import ResourceNotFoundException
from decimal import Decimal
import uuid
from datetime import datetime

class FeatureService:
    # --- SOS ---
    @staticmethod
    async def trigger_sos(
        db: AsyncSession, 
        user_id: str, 
        lat: float, 
        lng: float, 
        trip_id: Optional[str] = None
    ) -> SOS:
        """Create an active SOS alert."""
        sos = SOS(
            user_id=user_id,
            trip_id=trip_id,
            lat=Decimal(str(lat)),
            lng=Decimal(str(lng)),
            status=SOSStatus.ACTIVE
        )
        db.add(sos)
        # In production: Trigger real-time alerts to guardians and admin
        await db.commit()
        await db.refresh(sos)
        return sos

    @staticmethod
    async def resolve_sos(
        db: AsyncSession, 
        sos_id: str, 
        resolution: str, 
        notes: Optional[str] = None
    ) -> SOS:
        """Mark an SOS alert as resolved."""
        stmt = select(SOS).where(SOS.id == sos_id)
        result = await db.execute(stmt)
        sos = result.scalar_one_or_none()
        
        if not sos:
            raise ResourceNotFoundException("SOS record not found")
            
        sos.status = SOSStatus.RESOLVED
        sos.resolution = resolution
        sos.notes = notes
        sos.resolved_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(sos)
        return sos

    # --- Guardians ---
    @staticmethod
    async def add_guardian(
        db: AsyncSession, 
        user_id: str, 
        name: str, 
        phone: str, 
        relation: str
    ) -> Guardian:
        """Add a new guardian."""
        token = uuid.uuid4().hex[:12].upper()
        guardian = Guardian(
            user_id=user_id,
            name=name,
            phone=phone,
            relation=relation,
            status=GuardianStatus.PENDING,
            token=token
        )
        db.add(guardian)
        # In production: Send SMS with confirmation link
        await db.commit()
        await db.refresh(guardian)
        return guardian

    @staticmethod
    async def get_guardians(db: AsyncSession, user_id: str) -> List[Guardian]:
        """List all guardians for a user."""
        stmt = select(Guardian).where(Guardian.user_id == user_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    # --- Saved Places ---
    @staticmethod
    async def add_place(
        db: AsyncSession, 
        user_id: str, 
        label: str, 
        address: str, 
        lat: float, 
        lng: float, 
        name: Optional[str] = None
    ) -> SavedPlace:
        """Save a new place."""
        place = SavedPlace(
            user_id=user_id,
            label=SavedPlaceLabel(label),
            name=name,
            address=address,
            lat=Decimal(str(lat)),
            lng=Decimal(str(lng))
        )
        db.add(place)
        await db.commit()
        await db.refresh(place)
        return place

    @staticmethod
    async def get_places(db: AsyncSession, user_id: str) -> List[SavedPlace]:
        """List all saved places for a user."""
        stmt = select(SavedPlace).where(SavedPlace.user_id == user_id)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    # --- Notifications ---
    @staticmethod
    async def get_notifications(
        db: AsyncSession, 
        user_id: str, 
        limit: int = 20, 
        offset: int = 0
    ) -> List[Notification]:
        """Get user notification history."""
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(desc(Notification.created_at))
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: str,
        type: NotificationType,
        title: str,
        body: str,
        data: Optional[dict] = None
    ) -> Notification:
        """Create a new notification entry."""
        notif = Notification(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            data=data
        )
        db.add(notif)
        await db.commit()
        return notif
