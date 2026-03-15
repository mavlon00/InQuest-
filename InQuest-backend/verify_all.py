#!/usr/bin/env python3
"""Quick verification of all components"""

print("="*60)
print("🚀 Testing InQuest Backend Components")
print("="*60)

# Test 1: Models
print("\n1️⃣ Testing Models...")
try:
    from app.models.user import User
    from app.models.trip import Trip, TripStatus, PaymentMethod
    from app.models.wallet import Wallet, Transaction
    from app.models.features import Guardian, Notification, SavedPlace, RecurringBooking, SOS
    from app.models.driver import Driver, Vehicle
    print("   ✅ All models imported successfully")
    trip_states = [s.value for s in TripStatus]
    print(f"   ✅ TripStatus has {len(trip_states)} states")
except Exception as e:
    print(f"   ❌ Model import failed: {e}")
    import traceback
    traceback.print_exc()

# Test 2: Schemas
print("\n2️⃣ Testing Schemas...")
try:
    from app.schemas.auth import RegisterRequest, VerifyOTPRequest
    from app.schemas.booking import FareEstimateRequest, CreateBookingRequest
    from app.schemas.wallet import InitiateTopupRequest
    from app.schemas.profile import UpdateProfileRequest
    print("   ✅ All schemas imported successfully")
except Exception as e:
    print(f"   ❌ Schema import failed: {e}")
    import traceback
    traceback.print_exc()

# Test 3: Exceptions
print("\n3️⃣ Testing Exceptions...")
try:
    from app.utils.exceptions import (
        InvalidPhoneFormatError, InsufficientBalanceError,
        InvalidOTPError
    )
    print("   ✅ All exceptions imported successfully")
    exc = InvalidPhoneFormatError()
    print(f"   ✅ InvalidPhoneFormatError created")
except Exception as e:
    print(f"   ❌ Exception import failed: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Config
print("\n4️⃣ Testing Configuration...")
try:
    from config import settings
    print(f"   ✅ Config loaded")
    print(f"   ✅ BASE_FARE_NGN: {settings.BASE_FARE_NGN}")
    print(f"   ✅ JWT_ALGORITHM: {settings.JWT_ALGORITHM}")
    print(f"   ✅ OTP_EXPIRY_SECONDS: {settings.OTP_EXPIRY_SECONDS}s")
except Exception as e:
    print(f"   ❌ Config test failed: {e}")
    import traceback
    traceback.print_exc()

# Test 5: FastAPI App
print("\n5️⃣ Testing FastAPI App...")
try:
    from main import app
    routes = [route.path for route in app.routes]
    print(f"   ✅ FastAPI app initialized")
    print(f"   ✅ Total routes: {len(routes)}")
except Exception as e:
    print(f"   ❌ App test failed: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
print("✅ All component tests completed!")
print("="*60)
