#!/usr/bin/env python
"""
Quick setup verification script for InQuest backend.

This script checks that all required dependencies are installed and
can be imported correctly.

Usage:
    python verify_setup.py
"""

import sys
import importlib
from datetime import datetime

# Required packages
REQUIRED_PACKAGES = {
    "fastapi": "FastAPI web framework",
    "uvicorn": "ASGI server",
    "sqlalchemy": "ORM and database toolkit",
    "asyncpg": "PostgreSQL async driver",
    "pydantic": "Data validation",
    "pydantic_settings": "Environment settings",
    "psycopg2": "PostgreSQL adapter",
    "jose": "JWT token handling",
    "passlib": "Password hashing",
    "structlog": "Structured logging",
    "loguru": "Advanced logging",
    "redis": "Redis client",
    "httpx": "HTTP client",
    "alembic": "Database migrations",
}

# Print header
print("=" * 60)
print("InQuest Backend - Setup Verification")
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 60)
print()

# Check Python version
python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
print(f"✓ Python version: {python_version}")
if sys.version_info < (3, 11):
    print("⚠️  WARNING: Python 3.11+ is recommended")
print()

# Check packages
print("Checking required packages...")
print("-" * 60)

failed_packages = []
for package, description in REQUIRED_PACKAGES.items():
    try:
        module = importlib.import_module(package)
        version = getattr(module, "__version__", "unknown")
        print(f"✓ {package:20} ({version:15}) - {description}")
    except ImportError as e:
        print(f"✗ {package:20} MISSING              - {description}")
        failed_packages.append(package)

print()
print("=" * 60)

if failed_packages:
    print(f"❌ Missing {len(failed_packages)} package(s)")
    print("\nInstall missing packages with:")
    print(f"    pip install {' '.join(failed_packages)}")
    sys.exit(1)
else:
    print("✅ All required packages are installed!")
    print()
    print("Try running the application:")
    print("    uvicorn main:app --reload")
    print()
    print("Then visit: http://localhost:8000/docs")
    sys.exit(0)
