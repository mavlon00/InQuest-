import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';
import useOnSpotStore from '../store/onSpotStore';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function BalanceWarningSheet({ isOpen, onClose, onContinue }) {
  const navigate = useNavigate();
  const { balanceCheck, outstandingDebt, paymentMethod } = useOnSpotStore();
  const { walletBalance } = useStore();

  if (!isOpen || !balanceCheck) return null;

  const { level, walletNeeded, shortfall, subscriptionCoversKm, overflowKm } = balanceCheck;

  const renderContent = () => {
    if (paymentMethod === 'SUBSCRIPTION') {
      const canCoverOverflow = walletBalance >= (shortfall || 0);
      
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Info className="text-amber-500" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold">Subscription running low</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Your subscription covers part of this trip, but there is an overflow.
            </p>
          </div>

          <div className="bg-[var(--color-surface-2)] p-5 rounded-2xl space-y-3 font-jakarta text-sm">
            <div className="flex justify-between items-center">
              <span className="opacity-60 text-xs uppercase tracking-wider font-bold">Estimated trip</span>
              <span className="font-bold">~{overflowKm + subscriptionCoversKm} km</span>
            </div>
            <div className="flex justify-between items-center text-[var(--color-primary)]">
              <span className="opacity-60 text-xs uppercase tracking-wider font-bold">Covered by sub</span>
              <span className="font-bold">{subscriptionCoversKm} km</span>
            </div>
            <div className="flex justify-between items-center text-amber-500">
              <span className="opacity-60 text-xs uppercase tracking-wider font-bold">Overflow to wallet</span>
              <span className="font-bold">{overflowKm} km</span>
            </div>
            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="opacity-60 text-xs uppercase tracking-wider font-bold">Total wallet needed</span>
              <span className="font-bold text-lg">₦{walletNeeded}</span>
            </div>
          </div>

          {!canCoverOverflow ? (
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <p className="text-xs font-bold text-amber-500 leading-relaxed uppercase tracking-tight">
                ⚠️ Overflow may exceed wallet. Travel balance may apply.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[var(--color-success)]/10 rounded-xl border border-[var(--color-success)]/30">
              <p className="text-xs font-bold text-[var(--color-success)] leading-relaxed uppercase tracking-tight">
                ✓ Your wallet can cover the overflow. You are good to go.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {!canCoverOverflow && (
              <button 
                onClick={() => navigate('/wallet/topup')}
                className="w-full py-4 bg-[var(--color-primary)] text-black font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                Top Up Wallet <ArrowRight size={18} />
              </button>
            )}
            <button 
              onClick={onContinue}
              className={`w-full py-4 font-bold rounded-2xl ${
                canCoverOverflow 
                ? 'bg-[var(--color-primary)] text-black' 
                : 'bg-white/5 text-white border border-white/10'
              }`}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      );
    }

    if (level === 'LOW') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="text-amber-500" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold">Your wallet is a bit low</h2>
          </div>

          <div className="bg-[var(--color-surface-2)] p-5 rounded-2xl space-y-4 font-jakarta">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60 font-bold uppercase tracking-wider text-[10px]">Estimated trip cost</span>
              <span className="font-bold">₦{walletNeeded}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60 font-bold uppercase tracking-wider text-[10px]">Your wallet balance</span>
              <span className="font-bold">₦{walletBalance}</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Potential shortfall</span>
              <span className="text-amber-500 font-bold text-lg">₦{shortfall}</span>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed text-center px-4">
            If your actual trip costs more than your balance, the difference will be recorded as a travel balance. You can clear it anytime.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/wallet/topup')}
              className="w-full py-4 bg-[var(--color-primary)] text-black font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              Top Up Wallet <ArrowRight size={18} />
            </button>
            <button 
              onClick={onContinue}
              className="w-full py-4 bg-transparent text-white font-bold rounded-2xl"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      );
    }

    if (level === 'CRITICAL' || level === 'BLOCKED') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold">
              {level === 'BLOCKED' ? 'Insufficient Balance' : 'Wallet may not cover trip'}
            </h2>
          </div>

          <div className="bg-[var(--color-surface-2)] p-5 rounded-2xl space-y-4 font-jakarta">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60 font-bold uppercase tracking-wider text-[10px]">Estimated trip cost</span>
              <span className="font-bold">₦{walletNeeded}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60 font-bold uppercase tracking-wider text-[10px]">Your wallet balance</span>
              <span className="font-bold text-red-400">₦{walletBalance}</span>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-red-500 font-bold uppercase tracking-wider text-[10px]">Shortfall</span>
              <span className="text-red-500 font-bold text-xl">₦{shortfall}</span>
            </div>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed text-center px-4">
            {level === 'BLOCKED' 
              ? 'Top up your wallet to book this trip with wallet payment.'
              : 'We will charge whatever is in your wallet. The remaining amount will be a travel balance you need to clear before booking again after 7 days.'}
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/wallet/topup')}
              className="w-full py-4 bg-[var(--color-primary)] text-black font-bold rounded-2xl flex items-center justify-center gap-2"
            >
              {level === 'BLOCKED' ? 'Top Up Wallet' : 'Top Up Wallet — Recommended'} <ArrowRight size={18} />
            </button>
            
            {level === 'CRITICAL' && (
              <button 
                onClick={onContinue}
                className="w-full py-4 bg-transparent text-white font-bold rounded-2xl"
              >
                Continue Anyway
              </button>
            )}

            <button 
              onClick={() => {
                // In a real app, logic to switch to cash would go here
                onClose();
              }}
              className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest mt-2"
            >
              Or switch to cash payment
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center px-4 pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-sm bg-[var(--color-surface-1)] rounded-[32px] p-8 border border-white/10 shadow-2xl relative z-10"
          >
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-8" />

            {/* Debt Warning Addition */}
            {outstandingDebt && (
              <div className="mb-6 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex items-center gap-3">
                <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] font-bold text-amber-500 leading-tight uppercase tracking-tight">
                  ⚠️ You have an outstanding balance of ₦{outstandingDebt.amount} from a previous trip. New trips are still allowed.
                </p>
              </div>
            )}

            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
