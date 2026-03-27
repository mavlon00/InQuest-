"""
Wallet API routes (/api/v1/wallet).
"""

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.wallet_service import WalletService
from app.schemas.wallet import (
    WalletBalanceResponse,
    TransactionHistoryResponse,
    InitiateTopupRequest,
    InitiateTopupResponse,
    TransferRequest,
    CreatePINRequest,
    RedeemGreenPointsRequest,
    GreenPointsResponse,
)
from app.utils.responses import StandardResponse, ErrorResponse
from app.utils.security import verify_token
from app.utils.logging_config import get_logger
from app.utils.exceptions import InQuestException, WalletException, AuthenticationException

logger = get_logger(__name__)

# Create wallet router
router = APIRouter(prefix="/api/v1/wallet", tags=["Wallet & Payments"])

async def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract user ID from JWT token."""
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise AuthenticationException(
                "Invalid authentication scheme",
                code="AUTH_INVALID_SCHEME",
            )
        payload = verify_token(token)
        return str(payload.get("user_id"))
    except ValueError:
        raise AuthenticationException(
            "Invalid authorization header format",
            code="AUTH_INVALID_HEADER",
        )
    except Exception as e:
        raise AuthenticationException(str(e), code="AUTH_ERROR")

@router.get(
    "/balance",
    response_model=StandardResponse,
    summary="Get wallet balance",
    description="Retrieve current user's wallet balance and green points.",
)
async def get_balance(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        balance_data = await WalletService.get_balance(db, user_id)
        return StandardResponse(
            message="Balance retrieved successfully",
            data=balance_data
        )
    except Exception as e:
        logger.error(f"Error getting balance: {e}")
        raise

@router.get(
    "/transactions",
    response_model=StandardResponse,
    summary="Get transaction history",
    description="Retrieve paginated transaction history for the current user.",
)
async def get_transactions(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        transactions = await WalletService.get_transactions(db, user_id, limit, offset)
        
        tx_list = []
        for tx in transactions:
            tx_list.append({
                "id": str(tx.id),
                "type": tx.type.value,
                "amount": float(tx.amount),
                "reference": tx.reference,
                "description": tx.description,
                "status": tx.status.value,
                "category": tx.category.value,
                "created_at": tx.created_at.isoformat()
            })
            
        return StandardResponse(
            message="Transaction history retrieved successfully",
            data={
                "transactions": tx_list,
                "limit": limit,
                "offset": offset,
                "count": len(tx_list)
            }
        )
    except Exception as e:
        logger.error(f"Error getting transactions: {e}")
        raise

@router.post(
    "/topup/initiate",
    response_model=StandardResponse,
    summary="Initiate wallet top-up",
    description="Start a wallet top-up session via Paystack or Flutterwave.",
)
async def initiate_topup(
    request: InitiateTopupRequest,
    authorization: str = Header(...),
) -> StandardResponse:
    """
    Mocking top-up initiation for now. In production, this would call 
    a payment gateway like Paystack and return an initialization URL.
    """
    try:
        user_id = await get_current_user_id(authorization)
        # Mocking top-up for integration tests
        reference = f"TUP-{user_id[:8].upper()}-{int(datetime.now().timestamp())}"
        
        return StandardResponse(
            message="Top-up initiated",
            data={
                "reference": reference,
                "amount": request.amount,
                "provider": request.provider,
                "checkout_url": f"https://checkout.{request.provider.lower()}.com/{reference}",
                "status": "PENDING"
            }
        )
    except Exception as e:
        logger.error(f"Error initiating topup: {e}")
        raise

@router.post(
    "/transfer",
    response_model=StandardResponse,
    summary="Transfer funds to another user",
    description="Transfer NGN from your wallet to another user's phone number.",
)
async def transfer_funds(
    request: TransferRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        tx = await WalletService.transfer_funds(
            db, user_id, request.recipient_phone, request.amount, request.pin
        )
        
        return StandardResponse(
            message="Transfer successful",
            data={
                "id": str(tx.id),
                "amount": float(tx.amount),
                "reference": tx.reference,
                "recipient_phone": request.recipient_phone,
                "created_at": tx.created_at.isoformat()
            }
        )
    except WalletException as e:
        raise
    except Exception as e:
        logger.error(f"Error in transfer: {e}")
        raise

@router.post(
    "/pin",
    response_model=StandardResponse,
    summary="Set transaction PIN",
    description="Set or update your 4-digit numeric transaction PIN.",
)
async def create_pin(
    request: CreatePINRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        await WalletService.set_pin(db, user_id, request.pin)
        return StandardResponse(message="Transaction PIN set successfully")
    except Exception as e:
        logger.error(f"Error setting PIN: {e}")
        raise

@router.post(
    "/green-points/redeem",
    response_model=StandardResponse,
    summary="Redeem green points",
    description="Convert green points to Naira in your wallet.",
)
async def redeem_points(
    request: RedeemGreenPointsRequest,
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        result = await WalletService.redeem_green_points(db, user_id, request.points)
        return StandardResponse(
            message="Points redeemed successfully",
            data=result
        )
    except WalletException as e:
        raise
    except Exception as e:
        logger.error(f"Error redeeming points: {e}")
        raise

@router.get(
    "/green-points",
    response_model=StandardResponse,
    summary="Get green rewards info",
)
async def get_green_rewards(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse:
    try:
        user_id = await get_current_user_id(authorization)
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        
        return StandardResponse(
            message="Green rewards retrieved successfully",
            data={
                "points": wallet.green_points,
                "monetary_value": float(wallet.green_points), # 1 point = 1 NGN
                "history": [], # To be implemented
                "referral_points": 0 # To be implemented
            }
        )
    except Exception as e:
        logger.error(f"Error getting green rewards: {e}")
        raise
