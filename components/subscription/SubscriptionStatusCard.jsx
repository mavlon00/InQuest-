import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Wallet, BadgeAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function SubscriptionStatusCard() {
  const navigate = useNavigate();
  const { activeSubscription, isLoading } = useSubscriptionStore();

  if (isLoading) {
    return (
      <div className="w-full h-32 bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] animate-pulse border border-[var(--color-surface-3)]"></div>
    );
  }

  // State A: No Subscription
  if (!activeSubscription) {
    return (
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/subscription')}
        className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-5 border border-[var(--color-surface-3)] flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
            <Wallet size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white mb-0.5">Ride Plans</h3>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Save up to 33% on per-km rates</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
           <ArrowRight size={16} className="text-white" />
        </div>
      </motion.div>
    );
  }

  const isExpired = activeSubscription.status === 'expired';
  const percentRemaining = (activeSubscription.kmRemaining / activeSubscription.kmTotal) * 100;
  
  let kmColor = 'text-[var(--color-km-full)]';
  let barColor = 'bg-[var(--color-km-full)]';
  if (percentRemaining <= 30) {
    kmColor = 'text-[var(--color-km-low)]';
    barColor = 'bg-[var(--color-km-low)]';
  }
  if (percentRemaining <= 10) {
    kmColor = 'text-[var(--color-km-empty)]';
    barColor = 'bg-[var(--color-km-empty)]';
  }

  if (isExpired) {
    kmColor = 'text-[var(--color-sub-expired)]';
    barColor = 'bg-[var(--color-sub-expired)]';
  }

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/subscription')}
      className={`w-full bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-5 border cursor-pointer relative overflow-hidden transition-colors ${isExpired ? 'border-[var(--color-error)]/30' : 'border-[var(--color-surface-3)] hover:border-[var(--color-primary)]/50'}`}
    >
      {/* Subtle glow effect if active */}
      {!isExpired && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-5 blur-[50px] pointer-events-none rounded-full" />
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            {activeSubscription.plan} Plan
          </h3>
          <div className="flex items-center gap-2">
            <h2 className={`text-3xl font-display font-bold leading-none tracking-tight ${kmColor}`}>
              {isExpired ? '0 km' : `${activeSubscription.kmRemaining.toFixed(1)} km`}
            </h2>
            {isExpired && <BadgeAlert size={20} className="text-[var(--color-error)]" />}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
           <ArrowRight size={16} className="text-white" />
        </div>
      </div>

      <div className="w-full h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden mb-3">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${isExpired ? 100 : 100 - percentRemaining}%` }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${barColor}`} 
        />
      </div>

      <div className="flex justify-between items-center text-xs font-semibold">
        {isExpired ? (
          <span className="text-[var(--color-error)]">Subscription expired</span>
        ) : (
          <span className={activeSubscription.daysRemaining <= 3 ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-secondary)]'}>
            Expires in {activeSubscription.daysRemaining} days
          </span>
        )}
        <span className="text-[var(--color-primary)] font-bold">₦{activeSubscription.ratePerKm}/km</span>
      </div>
    </motion.div>
  );
}
