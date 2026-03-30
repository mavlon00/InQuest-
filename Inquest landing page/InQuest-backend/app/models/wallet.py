"""
Wallet and Transaction models for payment management.

Handles wallet balance, transactions, and payment history.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
import enum
import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
from app.database import Base


class TransactionType(str, enum.Enum):
    """Type of wallet transaction."""
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"


class TransactionStatus(str, enum.Enum):
    """Status of a transaction."""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class TransactionCategory(str, enum.Enum):
    """Category/reason for transaction."""
    TOPUP = "TOPUP"                    # Wallet top-up
    TRIP_FARE = "TRIP_FARE"            # Trip payment
    TRANSFER = "TRANSFER"              # Transfer to another user
    CANCELLATION_FEE = "CANCELLATION_FEE"
    REFERRAL_REWARD = "REFERRAL_REWARD"
    GREEN_REDEMPTION = "GREEN_REDEMPTION"  # Green points redeemed


class Wallet(Base):
    """
    User wallet for storing balance and managing transactions.
    One wallet per user.
    
    Attributes:
        id: UUID primary key.
        user_id: FK to User (unique - one wallet per user).
        balance: Current wallet balance (never below 0).
        currency: Always NGN.
        green_points: Green points balance.
        created_at: Wallet creation time.
        updated_at: Last balance change time.
    """

    __tablename__ = "wallets"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, unique=True
    )
    balance: Mapped[Decimal] = mapped_column(sa.DECIMAL(12, 2), default=Decimal("0.00"), nullable=False)
    currency: Mapped[str] = mapped_column(sa.String(3), default="NGN", nullable=False)
    green_points: Mapped[int] = mapped_column(default=0, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="wallet", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Wallet(user_id={self.user_id}, balance={self.balance})>"


class Transaction(Base):
    """
    Payment transaction record. Audit trail for all wallet movements.
    
    Attributes:
        id: UUID primary key.
        wallet_id: FK to Wallet.
        type: CREDIT or DEBIT.
        amount: Transaction amount (always positive value).
        reference: Unique reference (payment gateway ref or internal ID).
        description: Human-readable description of transaction.
        status: PENDING, SUCCESS, or FAILED.
        category: Classification of transaction.
        trip_id: FK to Trip if transaction is trip-related.
        created_at: Transaction timestamp (indexed for history queries).
    """

    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(sa.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id: Mapped[str] = mapped_column(
        sa.String(36), sa.ForeignKey("wallets.id", ondelete="CASCADE"), 
        nullable=False, index=True
    )
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False)
    amount: Mapped[Decimal] = mapped_column(sa.DECIMAL(10, 2), nullable=False)
    reference: Mapped[str] = mapped_column(sa.String(100), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(sa.Text, nullable=False)
    status: Mapped[TransactionStatus] = mapped_column(
        Enum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False
    )
    category: Mapped[TransactionCategory] = mapped_column(Enum(TransactionCategory), nullable=False)
    
    trip_id: Mapped[Optional[str]] = mapped_column(
        sa.String(36), sa.ForeignKey("trips.id", ondelete="SET NULL"), nullable=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    
    # Relationships
    wallet: Mapped[Wallet] = relationship("Wallet", foreign_keys=[wallet_id], back_populates="transactions")
    
    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, type={self.type}, status={self.status})>"
