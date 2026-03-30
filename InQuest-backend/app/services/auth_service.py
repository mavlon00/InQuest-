"""
Authentication service containing business logic for authentication flows.

This module handles user registration, login, OTP verification, and profile management.
All operations are asynchronous and integrated with the database.
"""

from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.user import User, UserRole
from app.models.wallet import Wallet
from app.utils.security import create_access_token, extract_user_id_from_token, hash_password, verify_password
from app.utils.validators import validate_phone_number
from app.utils.exceptions import (
    AuthenticationException,
    DuplicateResourceException,
    ResourceNotFoundException,
    InQuestException,
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

    # ── Helpers ────────────────────────────────────────────────────────────────

    @staticmethod
    def _build_auth_response(user: User, wallet: Wallet | None, is_new_user: bool) -> dict:
        """Build the standard auth response dict."""
        token_data = {"sub": user.email or user.phone_number or str(user.id), "user_id": user.id, "role": user.role.value}
        access_token = create_access_token(token_data)
        return {
            "user": {
                "id": str(user.id),
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "photo_url": user.photo_url,
                "role": user.role.value,
                "membership_tier": user.membership_tier.value,
                "wallet_balance": float(wallet.balance) if wallet else 0.0,
                "green_points": wallet.green_points if wallet else 0,
                "referral_code": user.referral_code,
                "is_new_user": is_new_user,
            },
            "access_token": access_token,
            "refresh_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_EXPIRATION_HOURS * 3600,
        }

    @staticmethod
    async def _ensure_wallet(db: AsyncSession, user: User) -> Wallet:
        """Create a wallet for the user if one doesn't already exist."""
        result = await db.execute(select(Wallet).where(Wallet.user_id == user.id))
        wallet = result.scalars().first()
        if not wallet:
            wallet = Wallet(user_id=user.id, balance=Decimal("0.00"), green_points=0)
            db.add(wallet)
            await db.commit()
            await db.refresh(wallet)
        return wallet

    # ── Email / Password Auth ─────────────────────────────────────────────────

    @staticmethod
    async def email_register(
        db: AsyncSession,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        role: str = "Passenger",
        referral_code: str | None = None,
    ) -> dict:
        """
        Register a new user with email and password.
        
        Raises DuplicateResourceException if email already exists.
        """
        email = email.lower().strip()

        # Check existing email
        result = await db.execute(select(User).where(User.email == email))
        if result.scalars().first():
            raise DuplicateResourceException("An account with this email already exists.", code="EMAIL_EXISTS")

        # Resolve referral
        referred_by_id = None
        if referral_code and role == "Passenger":
            ref_result = await db.execute(select(User).where(User.referral_code == referral_code.upper()))
            referred_user = ref_result.scalars().first()
            if referred_user:
                referred_by_id = referred_user.id

        user_role = UserRole.DRIVER if role == "Driver" else UserRole.PASSENGER
        user = User(
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=user_role,
            is_verified=True,
            referred_by_id=referred_by_id,
        )
        db.add(user)
        await db.flush()

        wallet = Wallet(user_id=user.id, balance=Decimal("0.00"), green_points=0)
        db.add(wallet)
        await db.commit()
        await db.refresh(user)
        await db.refresh(wallet)

        logger.info("New user registered via email", email=email, role=role)
        return AuthService._build_auth_response(user, wallet, is_new_user=True)

    @staticmethod
    async def email_login(db: AsyncSession, email: str, password: str) -> dict:
        """
        Login with email and password.
        
        Raises AuthenticationException for bad credentials.
        """
        email = email.lower().strip()

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if not user or not user.password_hash:
            raise AuthenticationException("Invalid email or password.", code="INVALID_CREDENTIALS")

        if not verify_password(password, user.password_hash):
            raise AuthenticationException("Invalid email or password.", code="INVALID_CREDENTIALS")

        user.last_login_at = datetime.utcnow()
        await db.commit()
        await db.refresh(user)

        wallet = await AuthService._ensure_wallet(db, user)

        logger.info("User login via email", email=email)
        return AuthService._build_auth_response(user, wallet, is_new_user=False)

    # ── Google OAuth ──────────────────────────────────────────────────────────

    @staticmethod
    async def google_auth(
        db: AsyncSession,
        id_token: str,
        role: str = "Passenger",
        referral_code: str | None = None,
    ) -> dict:
        """
        Authenticate via Google OAuth ID token.
        
        Verifies the token with Google, then creates or logs in the user.
        """
        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            idinfo = google_id_token.verify_oauth2_token(
                id_token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except Exception as e:
            raise AuthenticationException(f"Invalid Google token: {e}", code="GOOGLE_TOKEN_INVALID")

        google_id = idinfo["sub"]
        email = idinfo.get("email", "").lower()
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        photo_url = idinfo.get("picture")

        # Check if user exists by google_id or email
        result = await db.execute(select(User).where(User.google_id == google_id))
        user = result.scalars().first()
        is_new_user = False

        if not user and email:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()

        if not user:
            is_new_user = True
            # Resolve referral
            referred_by_id = None
            if referral_code and role == "Passenger":
                ref_result = await db.execute(select(User).where(User.referral_code == referral_code.upper()))
                referred_user = ref_result.scalars().first()
                if referred_user:
                    referred_by_id = referred_user.id

            user_role = UserRole.DRIVER if role == "Driver" else UserRole.PASSENGER
            user = User(
                email=email or None,
                google_id=google_id,
                first_name=first_name,
                last_name=last_name,
                photo_url=photo_url,
                role=user_role,
                is_verified=True,
                referred_by_id=referred_by_id,
            )
            db.add(user)
            await db.flush()
            wallet = Wallet(user_id=user.id, balance=Decimal("0.00"), green_points=0)
            db.add(wallet)
        else:
            # Link google_id if not already linked
            if not user.google_id:
                user.google_id = google_id
            if photo_url and not user.photo_url:
                user.photo_url = photo_url
            user.last_login_at = datetime.utcnow()

        await db.commit()
        await db.refresh(user)
        wallet = await AuthService._ensure_wallet(db, user)

        logger.info("User authenticated via Google", email=email, is_new=is_new_user)
        return AuthService._build_auth_response(user, wallet, is_new_user=is_new_user)
