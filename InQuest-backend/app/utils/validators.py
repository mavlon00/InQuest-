"""
Input validation utilities.

This module provides reusable validators for common input types
such as phone numbers, dates, and coordinates.
"""

import re
from typing import Tuple
from app.utils.exceptions import ValidationException


def validate_phone_number(phone: str) -> str:
    """
    Validate and normalize Nigerian phone numbers.
    
    Accepts multiple formats:
    - +234XXXXXXXXXX
    - 234XXXXXXXXXX
    - 0XXXXXXXXXX
    - XXXXXXXXXX (10 digits)
    
    Args:
        phone: The phone number to validate.
        
    Returns:
        Normalized phone number in +234XXXXXXXXXX format.
        
    Raises:
        ValidationException: If phone number is invalid.
    """
    # Remove common formatting characters
    cleaned = re.sub(r"[\s\-\(\)\+]", "", phone)

    # If it starts with 0, replace with 234
    if cleaned.startswith("0"):
        cleaned = "234" + cleaned[1:]

    # If it doesn't start with 234, add it
    if not cleaned.startswith("234"):
        cleaned = "234" + cleaned

    # Must be exactly 13 digits (234 + 10 digit number)
    if not re.match(r"^234\d{10}$", cleaned):
        raise ValidationException(
            "Invalid phone number format. Use Nigerian format (e.g., +2341234567890)",
            code="VALIDATION_PHONE",
        )

    return "+" + cleaned


def validate_otp(otp: str) -> str:
    """
    Validate OTP format.
    
    OTP must be exactly 6 digits.
    
    Args:
        otp: The OTP to validate.
        
    Returns:
        The OTP if valid.
        
    Raises:
        ValidationException: If OTP format is invalid.
    """
    if not re.match(r"^\d{6}$", otp):
        raise ValidationException(
            "OTP must be exactly 6 digits",
            code="VALIDATION_OTP",
        )
    return otp


def validate_email(email: str) -> str:
    """
    Validate email address format.
    
    Args:
        email: The email to validate.
        
    Returns:
        The email if valid.
        
    Raises:
        ValidationException: If email format is invalid.
    """
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email):
        raise ValidationException(
            "Invalid email format",
            code="VALIDATION_EMAIL",
        )
    return email.lower()


def validate_coordinates(latitude: float, longitude: float) -> Tuple[float, float]:
    """
    Validate geographic coordinates.
    
    Latitude must be between -90 and 90.
    Longitude must be between -180 and 180.
    
    Args:
        latitude: Latitude coordinate.
        longitude: Longitude coordinate.
        
    Returns:
        Tuple of validated (latitude, longitude).
        
    Raises:
        ValidationException: If coordinates are invalid.
    """
    if not (-90 <= latitude <= 90):
        raise ValidationException(
            "Latitude must be between -90 and 90",
            code="VALIDATION_LAT",
        )

    if not (-180 <= longitude <= 180):
        raise ValidationException(
            "Longitude must be between -180 and 180",
            code="VALIDATION_LON",
        )

    return latitude, longitude


def validate_name(name: str, min_length: int = 2, max_length: int = 100) -> str:
    """
    Validate user name.
    
    Args:
        name: The name to validate.
        min_length: Minimum name length.
        max_length: Maximum name length.
        
    Returns:
        The validated name.
        
    Raises:
        ValidationException: If name is invalid.
    """
    name = name.strip()

    if len(name) < min_length:
        raise ValidationException(
            f"Name must be at least {min_length} characters",
            code="VALIDATION_NAME_SHORT",
        )

    if len(name) > max_length:
        raise ValidationException(
            f"Name must not exceed {max_length} characters",
            code="VALIDATION_NAME_LONG",
        )

    # Allow letters, spaces, and common punctuation
    if not re.match(r"^[a-zA-Z\s\-'\.]+$", name):
        raise ValidationException(
            "Name contains invalid characters",
            code="VALIDATION_NAME_CHARS",
        )

    return name


def validate_url(url: str) -> str:
    """
    Validate URL format.
    
    Args:
        url: The URL to validate.
        
    Returns:
        The URL if valid.
        
    Raises:
        ValidationException: If URL is invalid.
    """
    pattern = r"^https?://[^\s/$.?#].[^\s]*$"
    if not re.match(pattern, url, re.IGNORECASE):
        raise ValidationException(
            "Invalid URL format",
            code="VALIDATION_URL",
        )
    return url


def validate_amount(amount: float, min_amount: float = 0.01) -> float:
    """
    Validate monetary amount.
    
    Args:
        amount: The amount to validate.
        min_amount: Minimum allowed amount.
        
    Returns:
        The validated amount.
        
    Raises:
        ValidationException: If amount is invalid.
    """
    if amount < min_amount:
        raise ValidationException(
            f"Amount must be at least {min_amount}",
            code="VALIDATION_AMOUNT_MIN",
        )

    # Validate to 2 decimal places
    if round(amount, 2) != amount:
        raise ValidationException(
            "Amount must have at most 2 decimal places",
            code="VALIDATION_AMOUNT_DECIMALS",
        )

    return amount


def validate_pagination_params(page: int = 1, size: int = 10) -> tuple:
    """
    Validate pagination parameters.
    
    Args:
        page: Page number (must be >= 1).
        size: Items per page (must be 1-100).
        
    Returns:
        Tuple of (page, size).
        
    Raises:
        ValidationException: If parameters are invalid.
    """
    if page < 1:
        raise ValidationException(
            "Page must be greater than 0",
            code="VALIDATION_PAGE",
        )

    if not (1 <= size <= 100):
        raise ValidationException(
            "Size must be between 1 and 100",
            code="VALIDATION_SIZE",
        )

    return page, size
