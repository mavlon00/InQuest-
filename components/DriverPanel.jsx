import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Star, ShieldCheck, MapPin, X } from 'lucide-react';
import { useStore } from '../store';

export default function DriverPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { booking, updateBooking, setCallOverlayOpen, setChatOverlayOpen, setCancelModalOpen } = useStore();

  const handleDragEnd = (event, info) => {
    if (info.offset.y < -50) {
      setIsExpanded(true);
    } else if (info.offset.y > 50) {
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setCancelModalOpen(true);
  };

  if (!booking.driver) return null;

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ height: isExpanded ? 'auto' : '80px' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      id="driver-panel"
      className="fixed bottom-0 inset-x-0 z-[var(--z-sheet)] bg-[var(--color-surface-1)] rounded-t-3xl border-t border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] pb-safe overflow-hidden"
    >
      <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-2 cursor-grab active:cursor-grabbing" />

      <div className="px-6 pb-6">
        {/* Compressed Mode */}
        <div
          className="flex items-center justify-between h-12 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
              {booking.driver.photo ? (
                <img src={booking.driver.photo} alt="Driver" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-[var(--color-text-muted)]">{booking.driver.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{booking.driver.name}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{booking.driver.plate}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">ETA</p>
              <p className="font-display font-semibold text-[var(--color-primary)] text-sm">{booking.eta} min</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setCallOverlayOpen(true); }}
                className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors"
              >
                <Phone size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setChatOverlayOpen(true); }}
                className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors"
              >
                <MessageCircle size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 space-y-6"
            >
              <h2 className="text-xl font-display font-semibold">Your driver is on the way</h2>

              <div className="flex items-center gap-4 bg-[var(--color-surface-2)] p-4 rounded-2xl border border-[var(--color-border-subtle)]">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                    {booking.driver.photo ? (
                      <img src={booking.driver.photo} alt="Driver" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[var(--color-text-muted)]">{booking.driver.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface-2)] flex items-center justify-center shadow-sm">
                    <ShieldCheck size={10} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{booking.driver.name}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={12} className="fill-current" />
                      <span className="font-bold text-[var(--color-text-primary)]">{booking.driver.rating}</span>
                    </div>
                    <span className="text-[var(--color-text-muted)]">• {booking.driver.trips} trips</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium text-sm">{booking.driver.plate}</p>
                  <p className="text-[10px] text-[var(--color-text-secondary)]">{booking.driver.vehicle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Destination</p>
                  <p className="font-medium text-sm">{booking.destinationName || 'Not set'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-subtle)]">
                <button
                  onClick={handleCancel}
                  className="text-sm font-medium text-[var(--color-error)] hover:underline"
                >
                  Cancel Trip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

