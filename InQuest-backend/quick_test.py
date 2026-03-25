"""Simple validation test"""
import sys

try:
    # Test 1: Models
    print("Testing models...", end="")
    from app.models.user import User
    from app.models.trip import Trip, TripStatus
    from app.models.wallet import Wallet
    print(" ✅")
    
    # Test 2: Schemas
    print("Testing schemas...", end="")
    from app.schemas.auth import RegisterRequest, VerifyOTPRequest
    from app.schemas.booking import CreateBookingRequest
    from app.schemas.wallet import CreatePINRequest
    print(" ✅")
    
    # Test 3: Exceptions
    print("Testing exceptions...", end="")
    from app.utils.exceptions import InvalidPhoneFormatError
    print(" ✅")
    
    # Test 4: Config
    print("Testing config...", end="")
    from config import settings
    print(" ✅")
    
    # Test 5: App
    print("Testing FastAPI app...", end="")
    from main import app
    print(" ✅")
    
    # Test 6: Schema validation
    print("Testing phone validation...", end="")
    try:
        RegisterRequest(phone="+2348012345678")
        print(" ✅")
    except:
        print(" ❌")
        sys.exit(1)
    
    # Test 7: Invalid phone rejection
    print("Testing invalid phone rejection...", end="")
    try:
        RegisterRequest(phone="08012345678")
        print(" ❌")
        sys.exit(1)
    except:
        print(" ✅")
    
    print("\n✅ All tests passed!")
    sys.exit(0)
    
except Exception as e:
    print(f" ❌\nError: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
