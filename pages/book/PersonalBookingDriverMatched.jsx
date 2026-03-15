import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

export default function PersonalBookingDriverMatched() {
  const navigate = useNavigate();
  const { bookingId, activeDriver } = useBookingStore();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // If no driver found, fallback (shouldn't happen in normal flow)
    if (!activeDriver) {
      navigate('/home', { replace: true });
      return;
    }

    // Auto-navigate after 3 seconds, or show button if they want to tap
    const timer1 = setTimeout(() => setShowButton(true), 1500);
    const timer2 = setTimeout(() => {
      navigate(`/book/personal/tracking/${bookingId}`, { replace: true });
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeDriver, bookingId, navigate]);

  if (!activeDriver) return null;

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center p-8 z-50">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(127,255,0,0.15) 0%, rgba(26,36,33,1) 70%)',
        }}
      />

      {/* Checkmark Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-[0_0_40px_rgba(127,255,0,0.5)] mb-8 relative z-10"
      >
        <Check size={48} className="text-black" strokeWidth={3} />
        
        {/* Sparkle effects */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <motion.div
            key={deg}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((deg * Math.PI) / 180) * 80,
              y: Math.sin((deg * Math.PI) / 180) * 80,
              opacity: 0,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]"
          />
        ))}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-4xl font-bold text-center mb-10 relative z-10 text-white"
      >
        Driver Found!
      </motion.h1>

      {/* Driver Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="w-full max-w-sm bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-[var(--color-border-subtle)] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full border-4 border-[var(--color-bg)] shadow-lg overflow-hidden bg-gray-800">
              {activeDriver.photoUrl ? (
                <img src={activeDriver.photoUrl} alt={activeDriver.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">👨🏽‍✈️</div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold">{activeDriver.rating}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1">{activeDriver.name}</h2>
          
          <div className="inline-flex flex-col items-center justify-center bg-[var(--color-surface-2)] rounded-xl px-4 py-2 mb-5 border border-white/5">
            <p className="text-sm font-semibold text-[var(--color-primary)] tracking-wider">
              {activeDriver.vehiclePlate}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 uppercase tracking-wider">
              {activeDriver.vehicleColor} {activeDriver.vehicleModel}
            </p>
          </div>

          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Arriving in {activeDriver.etaMins} minutes
          </p>
        </div>
      </motion.div>

      {/* Track button (shown if wait exceeds auto-nav) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showButton ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-10 inset-x-8 z-10"
      >
        <button
          onClick={() => navigate(`/book/personal/tracking/${bookingId}`, { replace: true })}
          className="w-full py-4 rounded-2xl font-semibold bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)]"
        >
          Track your ride →
        </button>
      </motion.div>
    </div>
  );
}
