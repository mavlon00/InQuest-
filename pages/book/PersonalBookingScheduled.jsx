import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { format } from 'date-fns';

export default function PersonalBookingScheduled() {
  const navigate = useNavigate();
  const {
    bookingId, scheduledTime, pickup, destination,
    fareEstimate, insurance, paymentMethod, resetBooking,
  } = useBookingStore();

  const [showCancel, setShowCancel] = useState(false);

  const scheduledDate = scheduledTime ? new Date(scheduledTime) : new Date();
  const totalFare =
    (fareEstimate?.baseFare || 0) +
    (fareEstimate?.deadMileageFee || 0) +
    (fareEstimate?.stopFees || 0) +
    (insurance ? 100 : 0);

  const handleCancelBooking = async () => {
    // Mock DELETE /api/v1/bookings/:bookingId
    await new Promise((r) => setTimeout(r, 500));
    resetBooking();
    navigate('/home', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        {/* Calendar icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(127,255,0,0.12)', border: '2px solid var(--color-primary)' }}
        >
          <Calendar size={48} style={{ color: 'var(--color-primary)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-center"
        >
          <h1 className="font-display text-3xl font-semibold mb-2">Ride Scheduled!</h1>
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            Your driver will be matched 15 minutes before your scheduled time. We will notify you.
          </p>

          {/* Scheduled time display */}
          <div className="my-4">
            <p className="text-3xl font-display font-semibold" style={{ color: 'var(--color-primary)' }}>
              {format(scheduledDate, 'EEEE, d MMMM yyyy')}
            </p>
            <p className="text-4xl font-display font-semibold mt-1" style={{ color: 'var(--color-primary)' }}>
              {format(scheduledDate, 'hh:mm a')}
            </p>
          </div>
        </motion.div>

        {/* Booking details card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full bg-[var(--color-surface-1)] rounded-2xl p-5 border border-[var(--color-border-subtle)] space-y-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <p className="text-sm font-semibold truncate">{pickup?.address}</p>
            </div>
            <div className="w-px h-3 bg-white/10 ml-1" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-error)]" />
              <p className="text-sm font-semibold truncate">{destination?.address}</p>
            </div>
          </div>
          <div className="border-t border-[var(--color-border-subtle)] pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Payment</span>
              <span className="font-semibold">{paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Fare estimate</span>
              <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
                NGN {totalFare.toLocaleString()}
              </span>
            </div>
            {bookingId && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Booking ref</span>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">{bookingId}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-3"
        >
          <button
            onClick={() => navigate('/trips')}
            className="w-full flex items-center justify-between px-5 py-4 bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] font-semibold text-sm"
          >
            View my scheduled rides
            <ChevronRight size={18} className="text-[var(--color-primary)]" />
          </button>
          <button
            onClick={() => navigate('/home', { replace: true })}
            className="w-full py-4 rounded-2xl font-semibold text-base bg-[var(--color-primary)] text-black"
          >
            Back to Home
          </button>
          <button
            onClick={() => setShowCancel(true)}
            className="w-full text-sm font-semibold text-center py-2"
            style={{ color: 'var(--color-error)', opacity: 0.7 }}
          >
            Cancel this booking
          </button>
        </motion.div>
      </div>

      {/* Cancel confirmation sheet */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full bg-[var(--color-surface-1)] rounded-t-[28px] p-6 pb-10"
          >
            <h3 className="font-display text-lg font-semibold mb-2">Cancel scheduled ride?</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              This booking will be permanently cancelled. You will not be charged.
            </p>
            <button
              onClick={handleCancelBooking}
              className="w-full py-4 rounded-2xl font-semibold mb-3"
              style={{ background: 'var(--color-error)', color: 'white' }}
            >
              Yes, cancel ride
            </button>
            <button
              onClick={() => setShowCancel(false)}
              className="w-full py-3 text-sm text-[var(--color-text-muted)] font-semibold"
            >
              Keep it
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
