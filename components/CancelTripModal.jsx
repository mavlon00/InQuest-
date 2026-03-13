import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function CancelTripModal() {
  const { 
    isCancelModalOpen, 
    setCancelModalOpen, 
    booking, 
    resetBooking,
    updateWalletBalance,
    addTransaction,
    addTripHistory,
    setToastMessage
  } = useStore();
  const navigate = useNavigate();

  if (!isCancelModalOpen) return null;

  const now = Date.now();
  const acceptedAt = booking.acceptedAt || now;
  const minutesSinceAcceptance = (now - acceptedAt) / (1000 * 60);
  
  let title = '';
  let fee = 0;

  if (booking.status === 'REQUESTED') {
    title = 'Cancel this booking? No charge will be applied.';
  } else if (minutesSinceAcceptance < 3) {
    title = 'Cancel within grace period? No cancellation fee applies.';
  } else {
    title = 'A ₦150 cancellation fee will be charged to compensate your driver. Cancel anyway?';
    fee = 150;
  }

  const handleCancel = () => {
    // Deduct fee if applicable
    if (fee > 0) {
      updateWalletBalance(-fee);
      addTransaction({
        id: Date.now().toString(),
        type: 'debit',
        title: 'Cancellation Fee',
        amount: fee,
        date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
      });
    }

    // Add to trip history
    addTripHistory({
      id: booking.tripId || `TRP-${Math.floor(Math.random() * 1000)}`,
      status: 'Cancelled',
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
      pickup: booking.pickupName || 'Unknown Location',
      dropoff: booking.destinationName || 'Unknown Destination',
      fare: fee > 0 ? `₦${fee}` : '₦0',
      reason: 'Passenger cancelled',
    });

    // Clear state
    resetBooking();
    localStorage.removeItem('active_trip');
    setCancelModalOpen(false);

    // Show toast
    setToastMessage('Trip cancelled successfully');
    
    // Navigate home
    navigate('/home');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCancelModalOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-sm bg-[var(--color-surface-1)] rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mb-6" />
          
          <h2 className="text-xl font-display font-semibold text-center mb-8 leading-tight">
            {title}
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleCancel}
              className="w-full bg-[var(--color-error)] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-error)]/90 transition-colors active:scale-[0.98]"
            >
              {fee > 0 ? `Yes, Cancel (₦${fee})` : 'Yes, Cancel'}
            </button>
            <button
              onClick={() => setCancelModalOpen(false)}
              className="w-full bg-transparent text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-2)] transition-colors active:scale-[0.98]"
            >
              Keep Booking
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

