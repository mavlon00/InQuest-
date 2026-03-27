"""
Profile service for managing user profile details, membership tiers, and referrals.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, MembershipTier
from app.models.trip import Trip, TripStatus
from app.utils.exceptions import ResourceNotFoundException
from datetime import datetime

class ProfileService:
    @staticmethod
    async def get_membership_tier(db: AsyncSession, user_id: str) -> Dict[str, Any]:
        """Calculate and get user's membership tier and progress."""
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise ResourceNotFoundException("User not found")
            
        # Get trip counts
        trip_stmt = select(func.count(Trip.id)).where(
            Trip.passenger_id == user_id, 
            Trip.status == TripStatus.COMPLETED
        )
        trip_result = await db.execute(trip_stmt)
        completed_trips = trip_result.scalar() or 0
        
        # Logic for tiers (mock values based on spec)
        # Standard: 0-10, Silver: 11-50, Gold: 51-150, Platinum: 151+
        current_tier = user.membership_tier.value
        next_tier = "Silver"
        trips_to_next = 10 - completed_trips
        
        if completed_trips > 150:
            next_tier = None
            trips_to_next = 0
        elif completed_trips > 50:
            next_tier = "Platinum"
            trips_to_next = 150 - completed_trips
        elif completed_trips > 10:
            next_tier = "Gold"
            trips_to_next = 50 - completed_trips
            
        return {
            "current_tier": current_tier,
            "next_tier": next_tier,
            "completed_trips": completed_trips,
            "trips_to_next": max(0, trips_to_next),
            "benefits": [
                "Priority matching",
                "Reduced cancellation fees" if completed_trips > 10 else "Standard support"
            ]
        }

    @staticmethod
    async def get_referral_stats(db: AsyncSession, user_id: str) -> Dict[str, Any]:
        """Get referral information and statistics for a user."""
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise ResourceNotFoundException("User not found")
            
        # Count referred users
        ref_stmt = select(User).where(User.referred_by_id == user_id)
        ref_result = await db.execute(ref_stmt)
        referred_users = ref_result.scalars().all()
        
        return {
            "referral_code": user.referral_code,
            "share_url": f"https://inquest.app/ref/{user.referral_code}",
            "total_referred": len(referred_users),
            "completed_referrals": len([u for u in referred_users if u.total_trips > 0]),
            "pending_referrals": len([u for u in referred_users if u.total_trips == 0]),
            "total_earned": float(len([u for u in referred_users if u.total_trips > 0]) * 500.0), # 500 NGN per ref
            "referrals": [
                {
                    "name": u.first_name or "New User",
                    "status": "COMPLETED" if u.total_trips > 0 else "PENDING",
                    "date": u.created_at.isoformat()
                } for u in referred_users[-5:] # Last 5
            ]
        }

    @staticmethod
    async def update_profile_photo(db: AsyncSession, user_id: str, photo_url: str) -> User:
        """Update user's profile photo URL."""
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise ResourceNotFoundException("User not found")
            
        user.photo_url = photo_url
        await db.commit()
        await db.refresh(user)
        return user
