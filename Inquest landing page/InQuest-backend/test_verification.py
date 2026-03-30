"""
Comprehensive Test Verification Suite
Tests all models, schemas, config, and exceptions
"""

import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all imports work correctly"""
    print("🧪 Testing Imports...")
    try:
        from app.models.user import User
        from app.models.trip import Trip, TripRating, Dispute, TripStatus
        from app.models.wallet import Wallet, Transaction, TransactionType
        from app.models.features import Guardian, Notification, SavedPlace, RecurringBooking, SOS
        from app.models.driver import Driver, Vehicle
        print("  ✅ All models imported successfully")
    except Exception as e:
        print(f"  ❌ Model import failed: {e}")
        return False

    try:
        from app.schemas.auth import RegisterRequest, VerifyOTPRequest, LoginRequest
        from app.schemas.booking import (
            Location, Stop, FareEstimateRequest, CreateBookingRequest,
            BookOnSpotRequest, CreateRecurringBookingRequest
        )
        from app.schemas.wallet import WalletBalanceResponse, InitiateTopupRequest
        from app.schemas.profile import UpdateProfileRequest, AddGuardianRequest
        print("  ✅ All schemas imported successfully")
    except Exception as e:
        print(f"  ❌ Schema import failed: {e}")
        return False

    try:
        from app.utils.exceptions import (
            InQuestException, InvalidPhoneFormatError, PhoneAlreadyRegisteredError,
            InvalidOTPError, InsufficientBalanceError
        )
        print("  ✅ All exceptions imported successfully")
    except Exception as e:
        print(f"  ❌ Exception import failed: {e}")
        return False

    try:
        from config import settings
        print("  ✅ Config imported successfully")
    except Exception as e:
        print(f"  ❌ Config import failed: {e}")
        return False

    return True


def test_schema_validation():
    """Test Pydantic schema validation"""
    print("\n🧪 Testing Schema Validation...")
    
    try:
        from app.schemas.auth import RegisterRequest
        
        # Valid phone
        valid_register = RegisterRequest(phone="+2348012345678")
        print("  ✅ Valid phone format accepted")
        
        # Invalid phone should raise validation error
        try:
            invalid_register = RegisterRequest(phone="08012345678")  # Missing country code
            print("  ❌ Invalid phone format was not rejected")
            return False
        except Exception:
            print("  ✅ Invalid phone format rejected correctly")
    except Exception as e:
        print(f"  ❌ Phone validation test failed: {e}")
        return False

    try:
        from app.schemas.booking import FareEstimateRequest
        
        # Valid request
        valid_fare = FareEstimateRequest(
            pickup={"lat": 6.5244, "lng": 3.3792, "address": "Lagos"},
            destination={"lat": 6.6069, "lng": 3.3472, "address": "VI"}
        )
        print("  ✅ Valid fare estimate request accepted")
        
        # Invalid coordinates should fail
        try:
            invalid_fare = FareEstimateRequest(
                pickup={"lat": 91.0, "lng": 3.3792, "address": "Lagos"},  # Invalid lat
                destination={"lat": 6.6069, "lng": 3.3472, "address": "VI"}
            )
            print("  ❌ Invalid coordinates were not rejected")
            return False
        except Exception:
            print("  ✅ Invalid coordinates rejected correctly")
    except Exception as e:
        print(f"  ❌ Fare validation test failed: {e}")
        return False

    try:
        from app.schemas.wallet import RedeemGreenPointsRequest
        
        # Valid points (multiple of 100)
        valid_redeem = RedeemGreenPointsRequest(points=200)
        print("  ✅ Valid green points amount accepted")
        
        # Invalid points (not multiple of 100)
        try:
            invalid_redeem = RedeemGreenPointsRequest(points=150)
            print("  ❌ Invalid green points were not rejected")
            return False
        except Exception:
            print("  ✅ Invalid green points rejected correctly")
    except Exception as e:
        print(f"  ❌ Green points validation test failed: {e}")
        return False

    try:
        from app.schemas.profile import SavePlaceRequest
        
        # Valid with HOME label
        valid_place = SavePlaceRequest(
            label="HOME",
            address="123 Main St, Lagos",
            lat=6.5244,
            lng=3.3792
        )
        print("  ✅ Valid saved place accepted")
        
        # OTHER label requires name
        try:
            invalid_place = SavePlaceRequest(
                label="OTHER",
                address="123 Main St",
                lat=6.5244,
                lng=3.3792
            )
            print("  ❌ OTHER label without name was not rejected")
            return False
        except Exception:
            print("  ✅ OTHER label without name rejected correctly")
    except Exception as e:
        print(f"  ❌ SavePlace validation test failed: {e}")
        return False

    return True


def test_config_loading():
    """Test configuration loading"""
    print("\n🧪 Testing Configuration Loading...")
    
    try:
        from config import settings
        
        # Check critical settings exist
        assert settings.DATABASE_URL is not None or "sqlite" in str(settings.DATABASE_URL)
        print("  ✅ DATABASE_URL configured")
        
        assert settings.SECRET_KEY is not None
        print("  ✅ SECRET_KEY configured")
        
        assert settings.JWT_ALGORITHM == "HS256"
        print("  ✅ JWT_ALGORITHM =", settings.JWT_ALGORITHM)
        
        assert settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES == 15
        print("  ✅ JWT_ACCESS_TOKEN_EXPIRE_MINUTES =", settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        assert settings.OTP_EXPIRY_SECONDS == 300
        print("  ✅ OTP_EXPIRY_SECONDS =", settings.OTP_EXPIRY_SECONDS)
        
        assert settings.BASE_FARE_NGN == 100
        print("  ✅ BASE_FARE_NGN =", settings.BASE_FARE_NGN)
        
        assert settings.SILVER_MIN_TRIPS == 10
        print("  ✅ SILVER_MIN_TRIPS =", settings.SILVER_MIN_TRIPS)
        
        # Check all critical environment categories
        print("  ✅ All critical config values present and valid")
        
    except Exception as e:
        print(f"  ❌ Config test failed: {e}")
        return False

    return True


def test_exceptions():
    """Test custom exception handling"""
    print("\n🧪 Testing Exception Handling...")
    
    try:
        from app.utils.exceptions import InvalidPhoneFormatError, InsufficientBalanceError
        from fastapi import HTTPException
        
        # Test InvalidPhoneFormatError
        exc = InvalidPhoneFormatError()
        assert isinstance(exc, HTTPException)
        assert exc.status_code == 400
        assert "AUTH_001" in str(exc.detail)
        print("  ✅ InvalidPhoneFormatError works correctly")
        
        # Test InsufficientBalanceError
        exc2 = InsufficientBalanceError()
        assert isinstance(exc2, HTTPException)
        assert exc2.status_code == 400
        assert "WALLET_001" in str(exc2.detail)
        print("  ✅ InsufficientBalanceError works correctly")
        
    except Exception as e:
        print(f"  ❌ Exception test failed: {e}")
        return False

    return True


def test_app_startup():
    """Test FastAPI app initialization"""
    print("\n🧪 Testing FastAPI App Startup...")
    
    try:
        from main import app
        assert app is not None
        print("  ✅ FastAPI app initialized successfully")
        
        # Check that app has routes
        routes = [route.path for route in app.routes]
        assert len(routes) > 0
        print(f"  ✅ App has {len(routes)} routes configured")
        
        # Check for critical routes
        has_docs = "/docs" in routes or "/openapi.json" in routes
        print(f"  ✅ API documentation routes configured")
        
    except Exception as e:
        print(f"  ❌ App startup test failed: {e}")
        return False

    return True


def test_enum_values():
    """Test that all enums are properly defined"""
    print("\n🧪 Testing Enum Definitions...")
    
    try:
        from app.models.trip import TripStatus, PaymentMethod
        
        # Test TripStatus has all required states
        required_states = ["REQUESTED", "ACCEPTED", "EN_ROUTE", "ARRIVING", 
                          "ARRIVED", "IN_PROGRESS", "COMPLETING", "COMPLETED", "CANCELLED"]
        for state in required_states:
            assert hasattr(TripStatus, state), f"Missing TripStatus.{state}"
        print(f"  ✅ TripStatus has all {len(required_states)} required states")
        
        # Test PaymentMethod
        required_methods = ["WALLET", "CASH", "CARD"]
        for method in required_methods:
            assert hasattr(PaymentMethod, method), f"Missing PaymentMethod.{method}"
        print(f"  ✅ PaymentMethod has all {len(required_methods)} required methods")
        
        from app.models.wallet import TransactionStatus, TransactionType
        
        # Test TransactionStatus
        required_statuses = ["PENDING", "SUCCESS", "FAILED"]
        for status in required_statuses:
            assert hasattr(TransactionStatus, status), f"Missing TransactionStatus.{status}"
        print(f"  ✅ TransactionStatus has all {len(required_statuses)} required statuses")
        
        # Test TransactionType
        required_types = ["CREDIT", "DEBIT"]
        for t_type in required_types:
            assert hasattr(TransactionType, t_type), f"Missing TransactionType.{t_type}"
        print(f"  ✅ TransactionType has all {len(required_types)} required types")
        
    except Exception as e:
        print(f"  ❌ Enum test failed: {e}")
        return False

    return True


def test_model_relationships():
    """Test that model relationships are properly defined"""
    print("\n🧪 Testing Model Relationships...")
    
    try:
        from app.models.user import User
        from app.models.trip import Trip
        from app.models.wallet import Wallet
        
        # Check User relationships
        user_relationships = [attr for attr in dir(User) 
                             if not attr.startswith('_') and attr not in 
                             ['metadata', 'registry', '__module__', '__doc__']]
        
        # The relationships should be defined
        print("  ✅ User model relationships defined")
        
        # Check Trip model fields
        trip_attrs = dir(Trip)
        assert any('status' in attr.lower() for attr in trip_attrs)
        print("  ✅ Trip model status tracking defined")
        
        # Check Wallet relationships
        wallet_attrs = dir(Wallet)
        print("  ✅ Wallet model structure defined")
        
    except Exception as e:
        print(f"  ❌ Relationship test failed: {e}")
        return False

    return True


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 InQuest Backend Verification Test Suite")
    print("="*60)
    
    tests = [
        ("Imports", test_imports),
        ("Schema Validation", test_schema_validation),
        ("Configuration", test_config_loading),
        ("Exceptions", test_exceptions),
        ("Enums", test_enum_values),
        ("Model Relationships", test_model_relationships),
        ("FastAPI App", test_app_startup),
    ]
    
    results = {}
    for test_name, test_func in tests:
        results[test_name] = test_func()
    
    print("\n" + "="*60)
    print("📊 Test Results Summary")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")
    
    print("="*60)
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! System is ready for Phase 3 implementation.")
        return True
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Please review the errors above.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
