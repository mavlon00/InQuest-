"""
Payment and wallet-related database models.

This module handles payment records, wallet management, and transaction history.
"""

from datetime import datetime
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum
import enum
from decimal import Decimal
from app.database import Base


class PaymentStatus(str, enum.Enum):
    """Enum for payment status."""
    PENDING = "PENDING"  # Payment initiated
    COMPLETED = "COMPLETED"  # Successfully processed
    FAILED = "FAILED"  # Payment failed
    CANCELLED = "CANCELLED"  # Payment cancelled
    REFUNDED = "REFUNDED"  # Payment refunded


class PaymentMethod(str, enum.Enum):
    """Enum for payment methods."""
    CARD = "CARD"  # Debit/credit card
    BANK_TRANSFER = "BANK_TRANSFER"  # Bank transfer
    WALLET = "WALLET"  # InQuest wallet
    CASH = "CASH"  # Cash payment


class Payment(Base):
    """
    Payment record for ride transactions.
    
    Attributes:
        id: Unique payment identifier.
        ride_id: Associated ride.
        user_id: User who made the payment (typically passenger).
        amount: Payment amount in NGN.
        status: Current payment status.
        method: Payment method used.
        paystack_reference: Paystack transaction reference (for card payments).
        commission_amount: Commission deducted from driver.
        driver_payout: Amount paid to driver.
        created_at: Payment creation timestamp.
        completed_at: When payment was completed.
        relationships:
            ride: Associated Ride object.
            user: Payer User object.
    """

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ride_id: Mapped[int] = mapped_column(
        sa.ForeignKey("rides.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(sa.Numeric(12, 2), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True
    )
    method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod), nullable=False
    )

    # Payment processor references
    paystack_reference: Mapped[str | None] = mapped_column(
        sa.String(100), unique=True, nullable=True
    )

    # Commission split
    commission_amount: Mapped[Decimal] = mapped_column(
        sa.Numeric(12, 2), default=Decimal("0.00"), nullable=False
    )
    driver_payout: Mapped[Decimal] = mapped_column(
        sa.Numeric(12, 2), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, nullable=False, index=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    # Relationships
    ride: Mapped["Ride"] = relationship("Ride", back_populates="payments")
    user: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        """String representation of Payment."""
        return f"<Payment(id={self.id}, amount={self.amount}, status={self.status})>"


# Note: The following Wallet and WalletTransaction classes are commented out 
# to avoid conflicts with app/models/wallet.py which uses the same table names.

"""
class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    ...
"""

# Rest of the file...
