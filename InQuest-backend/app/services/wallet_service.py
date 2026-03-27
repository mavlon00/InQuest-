"""
Wallet service for managing balances, transactions, and payments.
"""

from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.wallet import Wallet, Transaction, TransactionType, TransactionStatus, TransactionCategory
from app.models.user import User
from app.utils.exceptions import WalletException, AuthenticationException
import uuid
from datetime import datetime
from app.utils.security import hash_password, verify_password

class WalletService:
    @staticmethod
    async def get_or_create_wallet(db: AsyncSession, user_id: str) -> Wallet:
        """Get user's wallet or create it if it doesn't exist."""
        stmt = select(Wallet).where(Wallet.user_id == user_id)
        result = await db.execute(stmt)
        wallet = result.scalar_one_or_none()
        
        if not wallet:
            wallet = Wallet(user_id=user_id, balance=Decimal("0.00"), green_points=0)
            db.add(wallet)
            await db.commit()
            await db.refresh(wallet)
            
        return wallet

    @staticmethod
    async def get_balance(db: AsyncSession, user_id: str) -> dict:
        """Get wallet balance and green points."""
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        return {
            "balance": float(wallet.balance),
            "currency": wallet.currency,
            "green_points": wallet.green_points,
            "updated_at": wallet.updated_at
        }

    @staticmethod
    async def get_transactions(
        db: AsyncSession, 
        user_id: str, 
        limit: int = 20, 
        offset: int = 0
    ) -> List[Transaction]:
        """Get transaction history for a user."""
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        
        stmt = (
            select(Transaction)
            .where(Transaction.wallet_id == wallet.id)
            .order_by(desc(Transaction.created_at))
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def create_transaction(
        db: AsyncSession,
        wallet_id: str,
        amount: Decimal,
        type: TransactionType,
        category: TransactionCategory,
        description: str,
        reference: Optional[str] = None,
        status: TransactionStatus = TransactionStatus.SUCCESS,
        trip_id: Optional[str] = None
    ) -> Transaction:
        """Create a new transaction record."""
        if not reference:
            reference = f"TXN-{uuid.uuid4().hex[:12].upper()}"
            
        transaction = Transaction(
            wallet_id=wallet_id,
            amount=amount,
            type=type,
            category=category,
            description=description,
            reference=reference,
            status=status,
            trip_id=trip_id
        )
        db.add(transaction)
        return transaction

    @staticmethod
    async def topup_wallet(
        db: AsyncSession,
        user_id: str,
        amount: float,
        provider: str,
        reference: str
    ) -> Wallet:
        """
        Credit wallet after a successful payment.
        This is typically called by a webhook.
        """
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        decimal_amount = Decimal(str(amount))
        
        # Update balance
        wallet.balance += decimal_amount
        
        # Record transaction
        await WalletService.create_transaction(
            db,
            wallet.id,
            decimal_amount,
            TransactionType.CREDIT,
            TransactionCategory.TOPUP,
            f"Wallet top-up via {provider}",
            reference=reference
        )
        
        await db.commit()
        await db.refresh(wallet)
        return wallet

    @staticmethod
    async def transfer_funds(
        db: AsyncSession,
        sender_id: str,
        recipient_phone: str,
        amount: float,
        pin: str
    ) -> Transaction:
        """Transfer funds from one user to another."""
        # 1. Verify Sender
        stmt = select(User).where(User.id == sender_id)
        result = await db.execute(stmt)
        sender = result.scalar_one_or_none()
        
        if not sender or not sender.pin_hash:
            raise WalletException("Transaction PIN not set", code="WALLET_003")
            
        if not verify_password(pin, sender.pin_hash):
            raise WalletException("Invalid transaction PIN", code="WALLET_002")
            
        # 2. Verify Recipient
        stmt = select(User).where(User.phone_number == recipient_phone)
        result = await db.execute(stmt)
        recipient = result.scalar_one_or_none()
        
        if not recipient:
            raise WalletException("Recipient not found", code="WALLET_RECIPIENT_NOT_FOUND")
            
        if sender.id == recipient.id:
            raise WalletException("Cannot transfer to yourself", code="WALLET_INVALID_TRANSFER")
            
        # 3. Process Transfer
        decimal_amount = Decimal(str(amount))
        sender_wallet = await WalletService.get_or_create_wallet(db, sender.id)
        recipient_wallet = await WalletService.get_or_create_wallet(db, recipient.id)
        
        if sender_wallet.balance < decimal_amount:
            raise WalletException("Insufficient balance", code="WALLET_001")
            
        # Deduct from sender
        sender_wallet.balance -= decimal_amount
        tx_sender = await WalletService.create_transaction(
            db,
            sender_wallet.id,
            decimal_amount,
            TransactionType.DEBIT,
            TransactionCategory.TRANSFER,
            f"Transfer to {recipient.phone_number}",
            status=TransactionStatus.SUCCESS
        )
        
        # Add to recipient
        recipient_wallet.balance += decimal_amount
        await WalletService.create_transaction(
            db,
            recipient_wallet.id,
            decimal_amount,
            TransactionType.CREDIT,
            TransactionCategory.TRANSFER,
            f"Transfer from {sender.phone_number}",
            reference=f"REC-{tx_sender.reference}",
            status=TransactionStatus.SUCCESS
        )
        
        await db.commit()
        return tx_sender

    @staticmethod
    async def set_pin(db: AsyncSession, user_id: str, pin: str) -> None:
        """Set or update user's transaction PIN."""
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise AuthenticationException("User not found")
            
        user.pin_hash = hash_password(pin)
        await db.commit()

    @staticmethod
    async def redeem_green_points(db: AsyncSession, user_id: str, points: int) -> dict:
        """Redeem green points for wallet balance."""
        wallet = await WalletService.get_or_create_wallet(db, user_id)
        
        if wallet.green_points < points:
            raise WalletException("Insufficient green points", code="WALLET_INSUFFICIENT_POINTS")
            
        # Conversion rate: 100 points = 100 NGN (per spec)
        credit_amount = Decimal(str(points))
        
        wallet.green_points -= points
        wallet.balance += credit_amount
        
        await WalletService.create_transaction(
            db,
            wallet.id,
            credit_amount,
            TransactionType.CREDIT,
            TransactionCategory.GREEN_REDEMPTION,
            f"Redeemed {points} green points",
            status=TransactionStatus.SUCCESS
        )
        
        await db.commit()
        await db.refresh(wallet)
        
        return {
            "redeemed_points": points,
            "credited_amount": float(credit_amount),
            "new_balance": float(wallet.balance),
            "remaining_points": wallet.green_points
        }
