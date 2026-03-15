#!/usr/bin/env python
"""Debug script to identify import errors."""

import sys
import traceback

print("Step 1: Importing config...")
try:
    from config import settings
    print("✓ config imported")
except Exception as e:
    print(f"✗ Error: {e}")
    traceback.print_exc()
    sys.exit(1)

print("\nStep 2: Importing app.database...")
try:
    from app.database import init_db, close_db
    print("✓ app.database imported")
except Exception as e:
    print(f"✗ Error: {e}")
    traceback.print_exc()
    sys.exit(1)

print("\nStep 3: Importing logging config...")
try:
    from app.utils.logging_config import setup_logging, get_logger
    print("✓ logging_config imported")
except Exception as e:
    print(f"✗ Error: {e}")
    traceback.print_exc()
    sys.exit(1)

print("\nStep 4: Importing routes.auth...")
try:
    from app.routes import auth
    print("✓ routes.auth imported")
except Exception as e:
    print(f"✗ Error: {e}")
    traceback.print_exc()
    sys.exit(1)

print("\nStep 5: Importing main...")
try:
    from main import app
    print(f"✓ main imported, app={app}")
    print(f"✓ App title: {app.title}")
except Exception as e:
    print(f"✗ Error: {e}")
    traceback.print_exc()
    sys.exit(1)

print("\n✓ All imports successful!")
