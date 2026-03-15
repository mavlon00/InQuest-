import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap, Sparkles, Shield, Clock } from 'lucide-react';

const PLAN_ICONS = {
  starter: <Clock className="text-blue-400" />,
  commuter: <Zap className="text-[var(--color-primary)]" />,
  premium: <Sparkles className="text-amber-400" />,
  unlimited: <Shield className="text-purple-400" />,
};

export default function PlanChangeGallery({ plans, currentPlanId, onSelect, onCancel }) {
  return (
    <div className="flex flex-col h-full bg-[var(--color-bg)]">
      <div className="p-6 space-y-2">
        <h2 className="text-2xl font-display font-bold text-white">Choose a Plan</h2>
        <p className="text-[var(--color-text-secondary)] text-sm">Select the best fit for your commute</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-32">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          
          return (
            <motion.div
              key={plan.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(plan.id)}
              className={`p-5 rounded-[var(--radius-xl)] border-2 transition-all cursor-pointer relative overflow-hidden ${
                isCurrent 
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                  : 'border-white/5 bg-[var(--color-surface-1)] hover:border-white/20'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-[var(--color-primary)] text-black px-3 py-1 text-[10px] font-bold rounded-bl-xl uppercase tracking-tighter">
                  Current
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCurrent ? 'bg-[var(--color-primary)]/20' : 'bg-white/5'}`}>
                  {PLAN_ICONS[plan.id] || <Zap />}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white leading-tight">{plan.name}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">{plan.kmTotal} KM MONTHLY</p>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                    <Check size={14} className="text-[var(--color-primary)]" />
                    <span>₦{plan.ratePerKm}/km (Save {Math.round((1 - plan.ratePerKm/plan.standardRate)*100)}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                    <Check size={14} className="text-[var(--color-primary)]" />
                    <span>Free on-spot bookings</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-display font-bold text-white">₦{plan.price.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pt-8">
        <button 
          onClick={onCancel}
          className="w-full h-14 rounded-[var(--radius-lg)] bg-white/5 text-white/60 font-bold text-base active:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
