import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function KmStatusBar() {
  const navigate = useNavigate();
  const { activeSubscription, isLoading } = useSubscriptionStore();

  // If loading, don't show the bar to prevent jumping
  if (isLoading) return null;

  // Don't render the bar if there's no active subscription
  if (!activeSubscription) return null;

  const isExpired = activeSubscription.status === 'expired';
  const remaining = activeSubscription.kmRemaining || 0;
  const total = activeSubscription.kmTotal || 1;
  const percentRemaining = (remaining / total) * 100;

  // Color Mapping
  let barColor = 'bg-[var(--color-km-full)]';
  if (percentRemaining <= 30) barColor = 'bg-[var(--color-km-low)]';
  if (percentRemaining <= 10) barColor = 'bg-[var(--color-km-empty)]';
  if (isExpired) barColor = 'bg-[var(--color-sub-expired)]';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/subscription')}
      className="absolute top-20 left-4 right-4 z-40 bg-[var(--color-surface-1)]/95 backdrop-blur-md border border-[var(--color-surface-3)] rounded-full px-4 py-2 flex items-center justify-between shadow-[var(--shadow-card)] cursor-pointer active:scale-95 transition-transform"
    >
      <div className="flex items-center gap-3 w-full">
        {/* The Text */}
        <span className={`text-[11px] font-bold uppercase tracking-wider shrink-0 ${isExpired ? 'text-[var(--color-error)]' : 'text-white'}`}>
          {isExpired ? 'Sub expired' : `${remaining.toFixed(1)} km left`}
        </span>
        
        {/* The Bar Container */}
        <div className="flex-1 h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${isExpired ? 100 : percentRemaining}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${barColor}`} 
          />
        </div>
      </div>
    </motion.div>
  );
}
