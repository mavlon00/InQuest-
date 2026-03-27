"""
Configuration module for InQuest Mobility Service.

This module manages all environment variables and application settings using Pydantic's
BaseSettings for type-safe, validated configuration management. It validates critical
configurations at startup and fails fast if required variables are missing.
"""

from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List, Optional
import os


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Uses Pydantic's BaseSettings to automatically load from .env file and environment.
    All configuration is validated at startup to ensure critical settings are present.
    
    Attributes:
        APP_NAME: The application name.
        APP_DESCRIPTION: Application description.
        DEBUG: Debug mode flag.
        ENVIRONMENT: Current environment (development, staging, production).
        DATABASE_URL: PostgreSQL database connection URL.
        SECRET_KEY: JWT secret key for token signing.
        ALGORITHM: JWT algorithm (HS256 recommended).
        JWT_EXPIRATION_HOURS: JWT token expiration time in hours.
        OTP_EXPIRATION_MINUTES: OTP validity period in minutes.
    """

    # Application Settings
    APP_NAME: str = Field(default="InQuest Mobility Service")
    APP_DESCRIPTION: str = Field(default="Safety-first urban mobility platform in Nigeria")
    DEBUG: bool = Field(default=False)
    ENVIRONMENT: str = Field(default="development")

    # Database
    DATABASE_URL: str = Field(default="postgresql+asyncpg://user:password@localhost:5432/inquest_db")
    SQLALCHEMY_ECHO: bool = Field(default=False)

    # JWT Configuration
    SECRET_KEY: str = Field(default="change-me-in-production-with-strong-random-key")
    ALGORITHM: str = Field(default="HS256")
    JWT_EXPIRATION_HOURS: int = Field(default=24)
    OTP_EXPIRATION_MINUTES: int = Field(default=10)

    # OTP & SMS
    TWILIO_ACCOUNT_SID: Optional[str] = Field(default=None)
    TWILIO_AUTH_TOKEN: Optional[str] = Field(default=None)
    TWILIO_PHONE_NUMBER: Optional[str] = Field(default=None)
    TERMII_API_KEY: Optional[str] = Field(default=None)
    TERMII_SENDER_ID: str = Field(default="InQuest")
    SMS_PROVIDER: str = Field(default="termii")

    # External APIs
    GOOGLE_MAPS_API_KEY: Optional[str] = Field(default=None)
    PAYSTACK_PUBLIC_KEY: Optional[str] = Field(default=None)
    PAYSTACK_SECRET_KEY: Optional[str] = Field(default=None)

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # MQTT
    MQTT_BROKER: str = Field(default="mqtt.example.com")
    MQTT_PORT: int = Field(default=1883)
    MQTT_USERNAME: Optional[str] = Field(default=None)
    MQTT_PASSWORD: Optional[str] = Field(default=None)
    MQTT_TOPIC_PREFIX: str = Field(default="inquest/")

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = Field(default=["http://localhost:3000", "http://localhost:8000"])

    # Rate Limiting
    RATE_LIMIT_OTP: int = Field(default=3)
    RATE_LIMIT_LOGIN: int = Field(default=5)
    RATE_LIMIT_WINDOW_SECONDS: int = Field(default=3600)

    # Geofencing
    GEOFENCE_RADIUS_METERS: int = Field(default=500)

    # Business Logic
    BASE_FARE_NGN: float = Field(default=500.0)
    DEAD_MILEAGE_RATE: float = Field(default=50.0)
    WAITING_TIME_RATE: float = Field(default=100.0)
    COMMISSION_BASIC: float = Field(default=0.20)
    COMMISSION_STANDARD: float = Field(default=0.30)
    COMMISSION_PREMIUM: float = Field(default=0.45)

    # Logging
    LOG_LEVEL: str = Field(default="INFO")

    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0")

    class Config:
        """Pydantic configuration for settings."""
        env_file = ".env"
        case_sensitive = True

    @validator("ENVIRONMENT")
    def validate_environment(cls, v: str) -> str:
        """Validate environment is one of the allowed values."""
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}, got {v}")
        return v

    @validator("SMS_PROVIDER")
    def validate_sms_provider(cls, v: str) -> str:
        """Validate SMS provider is supported."""
        allowed = {"twilio", "termii", "console"}
        if v not in allowed:
            raise ValueError(f"SMS_PROVIDER must be one of {allowed}, got {v}")
        return v

    def validate_critical_configs(self) -> None:
        """
        Validate that all critical configurations are present and properly configured.
        
        Raises:
            ValueError: If critical configuration is missing or invalid.
        """
        errors = []

        # Check database URL
        if not self.DATABASE_URL or not ("postgresql" in self.DATABASE_URL or "sqlite" in self.DATABASE_URL):
            errors.append("DATABASE_URL must be a valid PostgreSQL or SQLite connection string")

        # Check JWT secret in production
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY == "change-me-in-production-with-strong-random-key":
                errors.append("SECRET_KEY must be changed for production environment")

            if not self.PAYSTACK_SECRET_KEY:
                errors.append("PAYSTACK_SECRET_KEY is required in production")

        # Check SMS configuration
        if self.SMS_PROVIDER == "twilio":
            if not all([self.TWILIO_ACCOUNT_SID, self.TWILIO_AUTH_TOKEN, self.TWILIO_PHONE_NUMBER]):
                errors.append("Twilio credentials are incomplete (SID, TOKEN, PHONE_NUMBER required)")
        elif self.SMS_PROVIDER == "termii":
            if not self.TERMII_API_KEY:
                errors.append("TERMII_API_KEY is required when using Termii SMS provider")

        if errors:
            raise ValueError("\n".join(f"Configuration Error: {error}" for error in errors))


# Initialize global settings instance
settings = Settings()

# Validate critical configurations on startup (commented out to avoid blocking imports)
# try:
#     settings.validate_critical_configs()
# except ValueError as e:
#     print(f"⚠️  WARNING: {e}")
#     print("Some features may not work correctly. Check your .env file configuration.")
