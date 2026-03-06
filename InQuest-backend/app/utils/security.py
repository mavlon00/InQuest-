"""
JWT and security utilities.

This module handles JWT token creation, verification, and other security operations.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from config import settings
from app.utils.exceptions import AuthenticationException

# Password hashing context using Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in the token (usually user ID, phone number, etc.).
        expires_delta: Token expiration time. If None, uses JWT_EXPIRATION_HOURS from config.
        
    Returns:
        Encoded JWT token as string.
        
    Example:
        >>> token = create_access_token({"sub": "234XXXXXXXXXX"})
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})

    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token and extract its payload.
    
    Args:
        token: The JWT token to verify.
        
    Returns:
        Decoded token payload.
        
    Raises:
        AuthenticationException: If token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise AuthenticationException(
            "Invalid or expired token",
            code="AUTH_TOKEN_INVALID",
            details={"error": str(e)},
        )


def hash_password(password: str) -> str:
    """
    Hash a password using Bcrypt.
    
    Args:
        password: Plain text password to hash.
        
    Returns:
        Hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hash.
    
    Args:
        plain_password: Plain text password.
        hashed_password: Hashed password from database.
        
    Returns:
        True if passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def extract_user_id_from_token(token: str) -> str:
    """
    Extract the user ID from a JWT token.
    
    Args:
        token: The JWT token.
        
    Returns:
        The user ID (typically phone number).
        
    Raises:
        AuthenticationException: If token is invalid.
    """
    payload = verify_token(token)
    user_id = payload.get("sub")

    if not user_id:
        raise AuthenticationException(
            "Token missing subject (user ID)",
            code="AUTH_TOKEN_INVALID",
        )

    return user_id
