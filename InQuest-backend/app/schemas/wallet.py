"""
Wallet and Payment request/response schemas.

Pydantic models for all wallet and payment endpoints per specification.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime


# ============================================================================
# WALLET BALANCE & TRANSACTIONS
# ============================================================================

class WalletBalanceResponse(BaseModel):
    """
    Response for GET /api/v1/wallet/balance
    
    Spec: Section 8.1 - Get Wallet Balance
    """
    success: bool = True
    data: dict


class TransactionDetail(BaseModel):
    """Individual transaction in history."""
    id: str
    type: str  # CREDIT or DEBIT
    amount: float
    reference: str
    description: str
    status: str  # PENDING, SUCCESS, FAILED
    category: str
    created_at: str


class TransactionHistoryResponse(BaseModel):
    """Response for GET /api/v1/wallet/transactions"""
    success: bool = True
    data: dict


# ============================================================================
# WALLET TOP-UP
# ============================================================================

class InitiateTopupRequest(BaseModel):
    """
    Request body for POST /api/v1/wallet/topup/initiate
    
    Spec: Section 8.3 - Initiate Wallet Top-Up
    """
    amount: float = Field(..., ge=100, le=500000, description="Amount in NGN")
    provider: str = Field(..., description="PAYSTACK or FLUTTERWAVE")


class InitiateTopupResponse(BaseModel):
    """Response for initiating top-up."""
    success: bool = True
    data: dict


# ============================================================================
# TRANSFER
# ============================================================================

class TransferRequest(BaseModel):
    """
    Request body for POST /api/v1/wallet/transfer
    
    Spec: Section 8.6 - Transfer to Another User
    """
    recipient_phone: str = Field(
        ..., 
        description="Recipient's phone number (must be registered user)"
    )
    amount: float = Field(..., ge=50, description="NGN amount (min 50)")
    pin: str = Field(..., pattern=r"^\d{4}$", description="4-digit transaction PIN")
    note: Optional[str] = Field(None, description="Optional message")


# ============================================================================
# TRANSACTION PIN
# ============================================================================

class CreatePINRequest(BaseModel):
    """
    Request body for POST /api/v1/wallet/pin
    
    Spec: Section 8.7 - Create Transaction PIN
    """
    pin: str = Field(..., pattern=r"^\d{4}$", description="4-digit numeric PIN")
    confirm_pin: str = Field(..., pattern=r"^\d{4}$", description="Must match pin")
    
    @field_validator("confirm_pin")
    @classmethod
    def pins_match(cls, v, info):
        """Verify PIN and confirm_PIN match."""
        if 'pin' in info.data and v != info.data['pin']:
            raise ValueError("PINs do not match")
        return v


# ============================================================================
# GREEN POINTS
# ============================================================================

class GreenPointsResponse(BaseModel):
    """Response for GET /api/v1/wallet/green-points"""
    success: bool = True
    data: dict


class RedeemGreenPointsRequest(BaseModel):
    """
    Request body for POST /api/v1/wallet/green-points/redeem
    
    Spec: Section 8.9 - Redeem Green Points
    """
    points: int = Field(
        ..., 
        ge=100, 
        description="Min 100 points, must be multiple of 100"
    )
    
    @field_validator("points")
    @classmethod
    def multiple_of_100(cls, v):
        """Points must be multiple of 100."""
        if v % 100 != 0:
            raise ValueError("Points must be a multiple of 100")
        return v


# ============================================================================
# PAYSTACK WEBHOOK
# ============================================================================

class PaystackWebhookData(BaseModel):
    """Data structure from Paystack webhook."""
    event: str
    data: dict


# ============================================================================
# FLUTTERWAVE WEBHOOK
# ============================================================================

class FlutterwaveWebhookData(BaseModel):
    """Data structure from Flutterwave webhook."""
    event: str
    data: dict
