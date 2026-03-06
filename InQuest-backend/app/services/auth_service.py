"""
Authentication service containing business logic for authentication flows.

This module handles user registration, login, OTP verification, and profile management.
All operations are asynchronous and integrated with the database.
"""

from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, OTP, UserRole
from app.utils.security import create_access_token, extract_user_id_from_token, hash_password, verify_password
from app.utils.validators import validate_phone_number
from app.utils.otp import send_otp, generate_otp, is_otp_expired
from app.utils.exceptions import (
    AuthenticationException,
    OTPException,
    OTPExpiredException,
    DuplicateResourceException,
    ResourceNotFoundException,
)
from app.utils.logging_config import get_logger
from config import settings

logger = get_logger(__name__)


class AuthService:
    """
    Authentication service providing core auth operations.
    
    All methods are async and work with database sessions.
    """

    @staticmethod
    async def register_or_login(db: AsyncSession, phone_number: str) -> dict:
        """
        Register a new user or initiate login for existing user.
        
        Generates and sends OTP to the provided phone number.
        If user doesn't exist, one will be created during OTP verification.
        
        Args:
            db: Database session.
            phone_number: User's phone number in international format.
            
        Returns:
            Dictionary with OTP status information.
            
        Raises:
            ExternalAPIException: If SMS sending fails.
        """
        # Validate and normalize phone number
        phone_number = validate_phone_number(phone_number)

        # Generate OTP
        otp_code = generate_otp()

        # Calculate expiration
        otp_expiration = datetime.utcnow() + timedelta(
            minutes=settings.OTP_EXPIRATION_MINUTES
        )

        # Remove any active OTPs for this number
        await db.execute(
            select(OTP).where(OTP.phone_number == phone_number).delete()
        )

        # Create new OTP record
        otp_record = OTP(
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=otp_expiration,
        )
        db.add(otp_record)
        await db.commit()

        # Send OTP via SMS
        try:
            await send_otp(phone_number, otp_code)
            logger.info("OTP sent successfully", phone=phone_number)
        except Exception as e:
            await db.rollback()
            logger.error("Failed to send OTP", phone=phone_number, error=str(e))
            raise

        return {
            "status": "OTP_SENT",
            "phone_number": phone_number,
            "message": "OTP sent to your phone. Valid for 10 minutes.",
        }

    @staticmethod
    async def verify_otp_and_login(db: AsyncSession, phone_number: str, otp: str) -> dict:
        """
        Verify OTP and create/login user, returning JWT token.
        
        This is the final step in the authentication flow. After verification,
        a new user is created if they don't exist, and a JWT token is issued.
        
        Args:
            db: Database session.
            phone_number: User's phone number.
            otp: 6-digit OTP code to verify.
            
        Returns:
            Dictionary containing user info and JWT token.
            
        Raises:
            OTPException: If OTP is invalid.
            OTPExpiredException: If OTP has expired.
        """
        # Validate inputs
        phone_number = validate_phone_number(phone_number)

        # Fetch OTP record
        result = await db.execute(
            select(OTP)
            .where(OTP.phone_number == phone_number)
            .order_by(OTP.created_at.desc())
        )
        otp_record = result.scalars().first()

        if not otp_record:
            logger.warning("OTP not found", phone=phone_number)
            raise OTPException(
                "No OTP found for this phone number. Please request a new one.",
                code="OTP_NOT_FOUND",
            )

        # Check if OTP has expired
        if is_otp_expired(otp_record.created_at):
            logger.warning("OTP expired", phone=phone_number)
            raise OTPExpiredException(
                "OTP has expired. Please request a new one.",
            )

        # Check if OTP is used
        if otp_record.is_used:
            logger.warning("OTP already used", phone=phone_number)
            raise OTPException(
                "This OTP has already been used.",
                code="OTP_ALREADY_USED",
            )

        # Verify OTP code
        otp_record.attempts += 1
        if otp_record.otp_code != otp:
            logger.warning(
                "Invalid OTP attempt",
                phone=phone_number,
                attempts=otp_record.attempts,
            )
            await db.commit()

            if otp_record.attempts >= 3:
                raise OTPException(
                    "Too many incorrect attempts. Please request a new OTP.",
                    code="OTP_TOO_MANY_ATTEMPTS",
                )
            raise OTPException(
                f"Invalid OTP. {3 - otp_record.attempts} attempts remaining.",
                code="OTP_INVALID",
            )

        # Mark OTP as used
        otp_record.is_used = True
        await db.commit()

        # Get or create user
        result = await db.execute(
            select(User).where(User.phone_number == phone_number)
        )
        user = result.scalars().first()

        if not user:
            # Create new user
            user = User(
                phone_number=phone_number,
                first_name="",
                last_name="",
                role=UserRole.PASSENGER,
                is_verified=True,
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            logger.info("New user created", phone=phone_number, user_id=user.id)
        else:
            # Update last login
            user.last_login_at = datetime.utcnow()
            user.is_verified = True
            await db.commit()
            logger.info("User login", phone=phone_number, user_id=user.id)

        # Generate JWT token
        token_data = {"sub": user.phone_number, "user_id": user.id}
        access_token = create_access_token(token_data)

        return {
            "user": {
                "id": user.id,
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role.value,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "created_at": user.created_at,
                "last_login_at": user.last_login_at,
            },
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_EXPIRATION_HOURS * 3600,
        }

    @staticmethod
    async def resend_otp(db: AsyncSession, phone_number: str) -> dict:
        """
        Resend OTP to phone number.
        
        Invalidates any existing OTPs and generates a new one.
        
        Args:
            db: Database session.
            phone_number: User's phone number.
            
        Returns:
            Dictionary with OTP status.
        """
        phone_number = validate_phone_number(phone_number)

        # Generate new OTP
        otp_code = generate_otp()
        otp_expiration = datetime.utcnow() + timedelta(
            minutes=settings.OTP_EXPIRATION_MINUTES
        )

        # Remove previous OTPs
        await db.execute(
            select(OTP).where(OTP.phone_number == phone_number).delete()
        )

        # Create new OTP
        otp_record = OTP(
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=otp_expiration,
        )
        db.add(otp_record)
        await db.commit()

        # Send OTP
        await send_otp(phone_number, otp_code)
        logger.info("OTP resent", phone=phone_number)

        return {
            "status": "OTP_SENT",
            "message": "New OTP sent to your phone.",
        }

    @staticmethod
    async def get_user_by_phone(db: AsyncSession, phone_number: str) -> User:
        """
        Fetch user by phone number.
        
        Args:
            db: Database session.
            phone_number: Phone number to search for.
            
        Returns:
            User object.
            
        Raises:
            ResourceNotFoundException: If user not found.
        """
        result = await db.execute(
            select(User).where(User.phone_number == phone_number)
        )
        user = result.scalars().first()

        if not user:
            raise ResourceNotFoundException(
                "User not found",
                code="USER_NOT_FOUND",
            )

        return user

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> User:
        """
        Fetch user by ID.
        
        Args:
            db: Database session.
            user_id: User ID to search for.
            
        Returns:
            User object.
            
        Raises:
            ResourceNotFoundException: If user not found.
        """
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()

        if not user:
            raise ResourceNotFoundException(
                "User not found",
                code="USER_NOT_FOUND",
            )

        return user

    @staticmethod
    async def update_profile(
        db: AsyncSession,
        user_id: int,
        first_name: str = None,
        last_name: str = None,
        photo_url: str = None,
        emergency_contact: str = None,
    ) -> User:
        """
        Update user profile information.
        
        Args:
            db: Database session.
            user_id: User to update.
            first_name: New first name (optional).
            last_name: New last name (optional).
            photo_url: New photo URL (optional).
            emergency_contact: New emergency contact (optional).
            
        Returns:
            Updated User object.
        """
        user = await AuthService.get_user_by_id(db, user_id)

        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if photo_url is not None:
            user.photo_url = photo_url
        if emergency_contact is not None:
            user.emergency_contact = emergency_contact

        user.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)

        logger.info("Profile updated", user_id=user_id)

        return user
