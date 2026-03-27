"""
OTP and SMS utilities.

This module handles OTP generation, validation, and SMS dispatch through
various SMS providers (Twilio, Termii, etc.).
"""

import random
import asyncio
from datetime import datetime, timedelta
from typing import Optional
from config import settings
from app.utils.exceptions import OTPException, ExternalAPIException
from app.utils.logging_config import get_logger
import httpx

logger = get_logger(__name__)


def generate_otp() -> str:
    """
    Generate a random 6-digit OTP.
    
    Returns:
        A 6-digit OTP as a string.
        
    Example:
        >>> otp = generate_otp()
        >>> print(otp)  # Output: "123456"
    """
    return f"{random.randint(100000, 999999)}"


def is_otp_expired(created_at: datetime, expiration_minutes: int = None) -> bool:
    """
    Check if an OTP has expired.
    
    Args:
        created_at: Datetime when OTP was created.
        expiration_minutes: Minutes until OTP expires. Defaults to OTP_EXPIRATION_MINUTES.
        
    Returns:
        True if OTP has expired, False otherwise.
    """
    if expiration_minutes is None:
        expiration_minutes = settings.OTP_EXPIRATION_MINUTES

    now = datetime.utcnow()
    expiration_time = created_at + timedelta(minutes=expiration_minutes)

    return now > expiration_time


async def send_otp_via_termii(phone_number: str, otp: str) -> bool:
    """
    Send OTP via Termii SMS provider.
    
    Args:
        phone_number: Recipient phone number (in international format).
        otp: The OTP code to send.
        
    Returns:
        True if message was sent successfully, False otherwise.
        
    Raises:
        ExternalAPIException: If Termii API fails.
    """
    try:
        message = f"Your InQuest OTP is: {otp}. Valid for {settings.OTP_EXPIRATION_MINUTES} minutes."

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.ng.termii.com/api/sms/send",
                json={
                    "to": phone_number,
                    "from": settings.TERMII_SENDER_ID,
                    "sms": message,
                    "api_key": settings.TERMII_API_KEY,
                    "type": "plain",
                },
            )

            if response.status_code == 200:
                result = response.json()
                if result.get("code") == "ok":
                    logger.info("OTP sent via Termii", phone=phone_number)
                    return True
                else:
                    logger.warning(
                        "Termii API error",
                        phone=phone_number,
                        response=result,
                    )
                    return False
            else:
                logger.error(
                    "Termii API failed",
                    status_code=response.status_code,
                    response=response.text,
                )
                raise ExternalAPIException(
                    "Failed to send OTP. Please try again.",
                    code="SMS_PROVIDER_ERROR",
                )

    except httpx.TimeoutException:
        logger.error("Termii API timeout", phone=phone_number)
        raise ExternalAPIException(
            "SMS service timeout. Please try again.",
            code="SMS_TIMEOUT",
        )
    except Exception as e:
        logger.error("Termii SMS error", error=str(e), phone=phone_number)
        raise ExternalAPIException(
            "Failed to send OTP. Please try again.",
            code="SMS_ERROR",
        )


async def send_otp_via_twilio(phone_number: str, otp: str) -> bool:
    """
    Send OTP via Twilio SMS provider.
    
    Args:
        phone_number: Recipient phone number.
        otp: The OTP code to send.
        
    Returns:
        True if message was sent successfully.
        
    Raises:
        ExternalAPIException: If Twilio API fails.
    """
    try:
        from twilio.rest import Client

        client = Client(
            settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN
        )

        message = f"Your InQuest OTP is: {otp}. Valid for {settings.OTP_EXPIRATION_MINUTES} minutes."

        # Run in executor since Twilio is synchronous
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone_number,
            ),
        )

        logger.info("OTP sent via Twilio", phone=phone_number)
        return True

    except Exception as e:
        logger.error("Twilio SMS error", error=str(e), phone=phone_number)
        raise ExternalAPIException(
            "Failed to send OTP. Please try again.",
            code="SMS_ERROR",
        )


async def send_otp(phone_number: str, otp: str) -> bool:
    """
    Send OTP using the configured SMS provider.
    
    Routes to the appropriate provider based on SMS_PROVIDER setting.
    
    Args:
        phone_number: Recipient phone number.
        otp: The OTP code to send.
        
    Returns:
        True if sent successfully.
        
    Raises:
        ExternalAPIException: If SMS sending fails.
    """
    provider = settings.SMS_PROVIDER

    if provider == "termii":
        return await send_otp_via_termii(phone_number, otp)
    elif provider == "twilio":
        return await send_otp_via_twilio(phone_number, otp)
    elif provider == "console":
        logger.info(f"--- [DEVELOPMENT OTP] --- To: {phone_number} | Code: {otp}")
        print(f"\n\n\n>>> OTP FOR {phone_number}: {otp} <<<\n\n\n")
        return True
    else:
        raise ExternalAPIException(
            f"Unknown SMS provider: {provider}",
            code="SMS_PROVIDER_UNKNOWN",
        )


def validate_otp_format(otp: str) -> str:
    """
    Validate OTP format (must be 6 digits).
    
    Args:
        otp: The OTP to validate.
        
    Returns:
        The OTP if valid.
        
    Raises:
        OTPException: If format is invalid.
    """
    if not otp or not otp.isdigit() or len(otp) != 6:
        raise OTPException(
            "Invalid OTP format. OTP must be 6 digits.",
            code="OTP_INVALID",
        )
    return otp
