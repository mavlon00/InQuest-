import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useStore } from '../../store';

export default function DestinationAlarm() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { updateBooking } = useStore();

  useEffect(() => {
    // Mark alarm  in global state
    updateBooking({ alarmFired: true });
  }, [updateBooking]);

  const handleDismiss = () => {
    navigate(`/tracking/${rideId}`, { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Pulsing Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-32 h-32 rounded-full border-4 border-[var(--color-primary)]"
        />
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
          className="absolute w-32 h-32 rounded-full border-4 border-[var(--color-primary)]"
        />
        <motion.div
          animate={{ scale: [1, 2, 3], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
          className="absolute w-32 h-32 rounded-full border-4 border-[var(--color-primary)]"
        />
      </div>

      {/* Screen Edge Glow */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,135,81,0.2)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-[var(--shadow-glow)] mb-8">
          <MapPin size={48} className="text-[var(--color-primary-text)]" />
        </div>
        
        <h1 className="text-4xl font-display font-semibold mb-4 tracking-tight">
          Approaching Your Stop
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] mb-16 max-w-xs">
          Prepare to alight — your destination is 300m ahead
        </p>

        <button
          onClick={handleDismiss}
          className="w-full max-w-xs bg-[var(--color-surface-2)] text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-3)] transition-colors active:scale-[0.98]"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

