import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MapPin, Wallet, Banknote, CreditCard,
  Shield, Clock, User, Loader2, AlertCircle, X,
} from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { useStore } from '../../store';
import { format } from 'date-fns';

// Mini static map showing route
function MiniMap({ pickup, destination }) {
  if (!pickup || !destination) return null;
  return (
    <div className="w-full h-28 rounded-xl overflow-hidden bg-[var(--color-surface-3)] flex items-center justify-center relative">
      <div className="absolute inset-0 opacity-30"
        style={{ background: 'linear-gradient(135deg, #1F2D29 0%, #2A3D38 100%)' }} />
      <div className="relative flex items-center justify-between w-full px-8">
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[var(--color-primary)] border-2 border-white" />
          <p className="text-[10px] text-[var(--color-text-muted)] text-center max-w-[80px] truncate">
            {pickup?.address?.split(',')[0]}
          </p>
        </div>
        <div className="flex-1 h-px border-t-2 border-dashed border-[var(--color-primary)]/40 mx-2" />
        <div className="flex flex-col items-center gap-1">
          <MapPin size={14} className="text-[var(--color-error)]" />
          <p className="text-[10px] text-[var(--color-text-muted)] text-center max-w-[80px] truncate">
            {destination?.address?.split(',')[0]}
          </p>
        </div>
      </div>
    </div>
  );
}

// Error sheet
function ErrorSheet({ error, onClose, onRetry, onTopUp }) {
  if (!error) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="w-full bg-[var(--color-surface-1)] rounded-t-[28px] p-6 pb-10"
      >
        <div className="flex items-start gap-3 mb-5">
          <AlertCircle size={28} className="text-[var(--color-error)] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-lg font-semibold mb-1">{error.title}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">{error.message}</p>
          </div>
        </div>
        <div className="space-y-3">
          {error.primaryAction && (
            <button
              onClick={error.primaryAction.action}
              className="w-full py-4 rounded-2xl font-semibold bg-[var(--color-primary)] text-black"
            >
              {error.primaryAction.label}
            </button>
          )}
          <button onClick={onClose} className="w-full py-3 text-sm text-[var(--color-text-muted)] font-semibold">
            Dismiss
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PersonalBookingConfirm() {
  const navigate = useNavigate();
  const {
    pickup, destination, stops, guest,
    fareEstimate, insurance, isScheduled, scheduledTime,
    paymentMethod, promoDiscount, driverNotes,
    setBooking, resetBooking,
  } = useBookingStore();

  const { walletBalance, updateWalletBalance } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseFare = fareEstimate?.baseFare || 0;
  const deadMileage = fareEstimate?.deadMileageFee || 0;
  const stopFees = fareEstimate?.stopFees || 0;
  const insuranceFee = insurance ? 100 : 0;
  const totalFare = baseFare + deadMileage + stopFees + insuranceFee - (promoDiscount || 0);

  const paymentIcon = { WALLET: Wallet, CASH: Banknote, CARD: CreditCard }[paymentMethod] || Banknote;

  useEffect(() => {
    if (!pickup || !destination || !fareEstimate || !paymentMethod) {
      navigate('/book/personal', { replace: true });
    }
  }, []);

  const handleBookNow = async () => {
    setLoading(true);
    try {
      const { createBooking } = useBookingStore.getState();
      const response = await createBooking();

      // Deduct from wallet if applicable (though backend should handle this, frontend update for UI)
      if (paymentMethod === 'WALLET') {
        updateWalletBalance(-totalFare);
      }

      if (isScheduled && scheduledTime) {
        navigate('/book/personal/scheduled', { replace: true });
      } else {
        navigate('/book/personal/searching', { replace: true });
      }
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      
      if (status === 400 && data?.code === 'INSUFFICIENT_BALANCE') {
        setError({
          title: 'Insufficient wallet balance',
          message: 'Your wallet balance is insufficient for this trip.',
          primaryAction: { label: 'Top up wallet', action: () => navigate('/wallet/topup') },
        });
      } else if (status === 404 && data?.code === 'NO_DRIVERS_AVAILABLE') {
        setError({
          title: 'No drivers available',
          message: 'No drivers in your area right now. Please try again in a few minutes.',
          primaryAction: { label: 'Try again', action: () => { setError(null); handleBookNow(); } },
        });
      } else {
        setError({
          title: 'Something went wrong',
          message: err?.response?.data?.message || 'We could not create your booking. Please try again.',
          primaryAction: { label: 'Retry', action: () => { setError(null); handleBookNow(); } },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const PaymentIcon = paymentIcon;

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0 bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-display text-xl font-semibold">Confirm booking</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-36">
        {/* Route mini-map */}
        <MiniMap pickup={pickup} destination={destination} />

        {/* Route card */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)] space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{pickup?.address}</p>
          </div>
          {stops.filter(Boolean).map((s, i) => (
            <div key={i} className="flex items-start gap-3 pl-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] mt-1.5 flex-shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)]">{s.address}</p>
            </div>
          ))}
          <div className="flex items-start gap-3">
            <MapPin size={10} className="text-[var(--color-error)] mt-1.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{destination?.address}</p>
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)] space-y-3">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Booking Details</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Trip type</span>
            <span className="text-sm font-semibold flex items-center gap-1.5">
              {isScheduled && scheduledTime ? (
                <>
                  <Clock size={14} className="text-[var(--color-primary)]" />
                  <span style={{ color: 'var(--color-primary)' }}>
                    {format(new Date(scheduledTime), 'EEE d MMM, HH:mm')}
                  </span>
                </>
              ) : (
                <><span className="text-yellow-400">⚡</span> Instant</>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Payment</span>
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <PaymentIcon size={14} className="text-[var(--color-primary)]" />
              {paymentMethod}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Insurance</span>
            <span className={`text-sm font-semibold ${insurance ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}>
              {insurance ? 'Yes — NGN 100' : 'No'}
            </span>
          </div>
        </div>

        {/* Guest info */}
        {guest && (
          <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Passenger</p>
              <button onClick={() => navigate(-1)} className="text-xs text-[var(--color-primary)] font-semibold">Edit</button>
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-[var(--color-primary)]" />
              <span className="text-sm font-semibold">{guest.name}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{guest.phone}</p>
          </div>
        )}

        {/* Fare breakdown */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)] space-y-2.5">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Fare Breakdown</p>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Base fare</span>
            <span className="font-semibold">NGN {baseFare.toLocaleString()}</span>
          </div>
          {deadMileage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Dead mileage</span>
              <span className="font-semibold">NGN {deadMileage.toLocaleString()}</span>
            </div>
          )}
          {stopFees > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Stop fees</span>
              <span className="font-semibold">NGN {stopFees.toLocaleString()}</span>
            </div>
          )}
          {insurance && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Insurance</span>
              <span className="font-semibold">NGN 100</span>
            </div>
          )}
          {(promoDiscount || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-success)' }}>Promo discount</span>
              <span className="font-semibold" style={{ color: 'var(--color-success)' }}>-NGN {promoDiscount?.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-[var(--color-border-subtle)] pt-2.5 flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-display font-semibold" style={{ color: 'var(--color-primary)' }}>
              NGN {totalFare.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Terms */}
        <p className="text-xs text-[var(--color-text-muted)] text-center px-4">
          By confirming you agree to our cancellation policy. Free cancellation within 3 minutes of driver acceptance.
        </p>
      </div>

      {/* CTA */}
      <div className="absolute bottom-0 inset-x-0 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] p-4">
        <button
          onClick={handleBookNow}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-semibold text-base bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : isScheduled ? (
            `Schedule Ride — NGN ${totalFare.toLocaleString()}`
          ) : (
            `Book Now — NGN ${totalFare.toLocaleString()}`
          )}
        </button>
      </div>

      <ErrorSheet error={error} onClose={() => setError(null)} />
    </div>
  );
}
