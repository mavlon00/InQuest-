"""
Production-ready configuration for InQuest Mobility Service.

This module manages all environment variables and application settings using Pydantic's
BaseSettings for type-safe, validated configuration management. It validates critical
configurations at startup and fails fast if required variables are missing.

Configuration hierarchy:
1. .env file (local development)
2. Environment variables (container deployment)
3. Default values (fallback)
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os


class Settings(BaseSettings):
    """
    Production-ready application settings.
    
    Uses Pydantic's BaseSettings to automatically load from .env file and environment.
    All configuration is validated at startup to ensure critical settings are present.
    """

    # ========================================================================
    # APPLICATION SETTINGS
    # ========================================================================
    APP_NAME: str = Field(default="InQuest Mobility Service")
    APP_DESCRIPTION: str = Field(default="Safety-first urban mobility platform in Nigeria")
    VERSION: str = Field(default="1.0.0")
    DEBUG: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="development")  # development, staging, production
    
    # ========================================================================
    # DATABASE CONFIGURATION
    # ========================================================================
    DATABASE_URL: str = Field(default="postgresql+asyncpg://user:password@localhost:5432/inquest_db")
    SQLALCHEMY_ECHO: bool = Field(default=False)  # Log all SQL queries
    DB_POOL_SIZE: int = Field(default=20)
    DB_POOL_MAX_OVERFLOW: int = Field(default=10)
    
    # ========================================================================
    # JWT & AUTHENTICATION
    # ========================================================================
    SECRET_KEY: str = Field(default="change-me-in-production-with-strong-random-key-min-32-chars")
    ALGORITHM: str = Field(default="HS256")
    
    # Token expiration times (in seconds)
    JWT_ACCESS_TOKEN_EXPIRE_SECONDS: int = Field(default=900)      # 15 minutes
    JWT_REFRESH_TOKEN_EXPIRE_SECONDS: int = Field(default=2592000)  # 30 days
    OTP_EXPIRE_SECONDS: int = Field(default=300)                    # 5 minutes
    
    # ========================================================================
    # OTP & SMS CONFIGURATION
    # ========================================================================
    OTP_LENGTH: int = Field(default=6)
    OTP_MAX_RESEND_ATTEMPTS: int = Field(default=3)
    OTP_RESEND_COOLDOWN_SECONDS: int = Field(default=60)
    OTP_MAX_VERIFY_ATTEMPTS: int = Field(default=5)
    OTP_LOCK_DURATION_SECONDS: int = Field(default=1800)  # 30 minutes
    
    # SMS Provider configuration
    SMS_PROVIDER: str = Field(default="termii")  # termii or twilio
    
    # Termii SMS
    TERMII_API_KEY: Optional[str] = Field(default=None)
    TERMII_SENDER_ID: str = Field(default="InQuest")
    
    # Twilio SMS (alternative provider)
    TWILIO_ACCOUNT_SID: Optional[str] = Field(default=None)
    TWILIO_AUTH_TOKEN: Optional[str] = Field(default=None)
    TWILIO_PHONE_NUMBER: Optional[str] = Field(default=None)
    
    # ========================================================================
    # EXTERNAL PAYMENT GATEWAYS
    # ========================================================================
    # Paystack
    PAYSTACK_PUBLIC_KEY: Optional[str] = Field(default=None)
    PAYSTACK_SECRET_KEY: Optional[str] = Field(default=None)
    PAYSTACK_WEBHOOK_SECRET: Optional[str] = Field(default=None)
    
    # Flutterwave (alternative payment gateway)
    FLUTTERWAVE_PUBLIC_KEY: Optional[str] = Field(default=None)
    FLUTTERWAVE_SECRET_KEY: Optional[str] = Field(default=None)
    FLUTTERWAVE_WEBHOOK_SECRET: Optional[str] = Field(default=None)
    
    # ========================================================================
    # EXTERNAL SERVICES
    # ========================================================================
    # Google Maps API
    GOOGLE_MAPS_API_KEY: Optional[str] = Field(default=None)
    
    # Firebase Cloud Messaging (FCM) for push notifications
    FIREBASE_PROJECT_ID: Optional[str] = Field(default=None)
    FIREBASE_PRIVATE_KEY: Optional[str] = Field(default=None)
    FIREBASE_CLIENT_EMAIL: Optional[str] = Field(default=None)
    
    # ========================================================================
    # REDIS CONFIGURATION
    # ========================================================================
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    REDIS_DB: int = Field(default=0)
    REDIS_PASSWORD: Optional[str] = Field(default=None)
    
    # ========================================================================
    # MQTT/IoT CONFIGURATION
    # ========================================================================
    MQTT_BROKER: str = Field(default="mqtt.example.com")
    MQTT_PORT: int = Field(default=1883)
    MQTT_USERNAME: Optional[str] = Field(default=None)
    MQTT_PASSWORD: Optional[str] = Field(default=None)
    MQTT_TOPIC_PREFIX: str = Field(default="inquest/")
    
    # ========================================================================
    # WEBSOCKET CONFIGURATION
    # ========================================================================
    WEBSOCKET_HEARTBEAT_INTERVAL: int = Field(default=30)  # seconds
    WEBSOCKET_HEARTBEAT_TIMEOUT: int = Field(default=10)   # seconds
    
    # ========================================================================
    # CORS & SECURITY
    # ========================================================================
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000", "https://inquest.ng"]
    )
    
    # ========================================================================
    # RATE LIMITING
    # ========================================================================
    RATE_LIMIT_OTP_RESEND: int = Field(default=3)          # max resends per hour
    RATE_LIMIT_OTP_VERIFY: int = Field(default=5)          # max verify attempts
    RATE_LIMIT_LOGIN: int = Field(default=10)              # max login attempts
    RATE_LIMIT_WINDOW_SECONDS: int = Field(default=3600)   # 1 hour
    
    # ========================================================================
    # GEOLOCATION & PROXIMITY
    # ========================================================================
    ON_SPOT_BOOKING_RADIUS_METERS: int = Field(default=500)
    DRIVER_SEARCH_RADIUS_KM: int = Field(default=5)
    ARRIVING_THRESHOLD_METERS: int = Field(default=100)
    COMPLETING_THRESHOLD_METERS: int = Field(default=300)
    
    # ========================================================================
    # BOOKING & FARE CONFIGURATION
    # ========================================================================
    BASE_FARE_NGN: float = Field(default=100.0)
    PER_KM_RATE_NGN: float = Field(default=120.0)
    DEAD_MILEAGE_RATE_NGN: float = Field(default=125.0)
    STOP_FEE_NGN: float = Field(default=100.0)
    INSURANCE_FEE_NGN: float = Field(default=100.0)
    WAITING_FEE_PER_MINUTE_NGN: float = Field(default=30.0)
    WAITING_GRACE_MINUTES: int = Field(default=5)
    CANCELLATION_FEE_NGN: float = Field(default=150.0)
    CANCELLATION_GRACE_MINUTES: int = Field(default=3)
    
    # ========================================================================
    # MEMBERSHIP TIER THRESHOLDS
    # ========================================================================
    SILVER_MIN_TRIPS: int = Field(default=10)
    SILVER_MIN_POINTS: int = Field(default=500)
    SILVER_DISCOUNT: float = Field(default=0.02)
    
    GOLD_MIN_TRIPS: int = Field(default=30)
    GOLD_MIN_POINTS: int = Field(default=1500)
    GOLD_DISCOUNT: float = Field(default=0.05)
    
    PLATINUM_MIN_TRIPS: int = Field(default=50)
    PLATINUM_MIN_POINTS: int = Field(default=3000)
    PLATINUM_DISCOUNT: float = Field(default=0.10)
    PLATINUM_FREE_INSURANCE: bool = Field(default=True)
    
    # ========================================================================
    # GREEN POINTS CONFIGURATION
    # ========================================================================
    GREEN_POINTS_PER_100_NGN: int = Field(default=1)
    GREEN_POINTS_REFERRAL_BONUS: int = Field(default=5)
    GREEN_POINTS_EXPIRY_DAYS: int = Field(default=365)
    GREEN_POINTS_REDEMPTION_RATE: float = Field(default=0.1)  # 100 points = NGN 10
    GREEN_POINTS_MIN_REDEMPTION: int = Field(default=100)     # Minimum points to redeem
    
    # ========================================================================
    # REFERRAL SYSTEM
    # ========================================================================
    REFERRAL_CODE_LENGTH: int = Field(default=6)
    REFERRAL_REWARD_REFERRER_NGN: float = Field(default=500.0)
    REFERRAL_REWARD_REFERRED_DISCOUNT_NGN: float = Field(default=200.0)
    
    # ========================================================================
    # LOGGING & MONITORING
    # ========================================================================
    LOG_LEVEL: str = Field(default="INFO")
    LOG_FORMAT: str = Field(default="json")  # json or text
    SENTRY_DSN: Optional[str] = Field(default=None)  # Error tracking
    
    # ========================================================================
    # CELERY BACKGROUND JOBS
    # ========================================================================
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0")
    CELERY_TIMEZONE: str = Field(default="Africa/Lagos")
    
    # ========================================================================
    # FILE STORAGE (CDN)
    # ========================================================================
    STORAGE_PROVIDER: str = Field(default="s3")  # s3, gcs, local
    S3_BUCKET_NAME: Optional[str] = Field(default=None)
    S3_REGION: Optional[str] = Field(default=None)
    S3_ACCESS_KEY: Optional[str] = Field(default=None)
    S3_SECRET_KEY: Optional[str] = Field(default=None)
    CDN_BASE_URL: Optional[str] = Field(default="https://cdn.inquest.ng")
    
    class Config:
        """Pydantic configuration for settings."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Load settings
settings = Settings()

# Validate critical production settings
if settings.ENVIRONMENT == "production":
    required_settings = [
        "SECRET_KEY",
        "DATABASE_URL",
        "PAYSTACK_SECRET_KEY",
        "GOOGLE_MAPS_API_KEY",
    ]
    for setting in required_settings:
        if not getattr(settings, setting):
            raise ValueError(f"Critical setting {setting} is required in production environment")
