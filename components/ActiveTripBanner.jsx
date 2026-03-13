import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Navigation } from 'lucide-react';
import { useStore } from '../store';

export default function ActiveTripBanner() {
  const navigate = useNavigate();
  const booking = useStore((state) => state.booking);

  const handleClick = () => {
    navigate('/home');
  };

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      exit={{ y: -50 }}
      onClick={handleClick}
      className="h-11 bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 cursor-pointer relative z-50 shadow-sm"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] animate-pulse" />
      
      <div className="flex items-center gap-3 pl-2">
        <div className="w-6 h-6 rounded bg-[var(--color-surface-2)] flex items-center justify-center">
          <Navigation size={12} className="text-[var(--color-primary)]" />
        </div>
        <span className="text-xs font-medium text-[var(--color-text-primary)]">Trip in progress — tap to return</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--color-primary)]">{booking.eta} min</span>
        <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
      </div>
    </motion.div>
  );
}

