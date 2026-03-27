"""
Seed script to initialize the database with some sample data.
"""

import asyncio
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import init_db, _get_session_factory
from app.models.user import User, UserRole, MembershipTier
from app.models.wallet import Wallet
from app.models.ride import DriverProfile
import uuid

async def seed_data():
    print("Initializing database...")
    await init_db()
    
    session_factory = _get_session_factory()
    async with session_factory() as db:
        # Create a test admin
        admin = User(
            phone_number="+2348000000000",
            first_name="InQuest",
            last_name="Admin",
            role=UserRole.ADMIN,
            is_verified=True,
            referral_code="ADMIN001"
        )
        db.add(admin)
        await db.flush()
        
        # Create wallet for admin
        admin_wallet = Wallet(user_id=admin.id, balance=Decimal("1000000.00"), green_points=1000)
        db.add(admin_wallet)
        
        # Create a test driver
        driver = User(
            phone_number="+2348000000001",
            first_name="John",
            last_name="Driver",
            role=UserRole.DRIVER,
            is_verified=True,
            referral_code="DRV001"
        )
        db.add(driver)
        await db.flush()
        
        # Create driver profile
        driver_profile = DriverProfile(
            user_id=driver.id,
            vehicle_plate="Keke-001",
            vehicle_model="Bajaj RE",
            is_available=True,
            is_verified=True,
            rating=Decimal("4.8"),
            total_trips=150
        )
        db.add(driver_profile)
        
        # Create wallet for driver
        driver_wallet = Wallet(user_id=driver.id, balance=Decimal("5000.00"), green_points=50)
        db.add(driver_wallet)
        
        # Create a test passenger
        passenger = User(
            phone_number="+2348000000002",
            first_name="Jane",
            last_name="Passenger",
            role=UserRole.PASSENGER,
            is_verified=True,
            referral_code="PSG001",
            membership_tier=MembershipTier.SILVER
        )
        db.add(passenger)
        await db.flush()
        
        # Create wallet for passenger
        passenger_wallet = Wallet(user_id=passenger.id, balance=Decimal("12450.00"), green_points=120)
        db.add(passenger_wallet)
        
        await db.commit()
        print("Seed data created successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
