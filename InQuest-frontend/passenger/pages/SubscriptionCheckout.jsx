import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, CreditCard, Wallet, AlertCircle, 
  CheckCircle2, Info, Loader2, RefreshCcw, ArrowRight
} from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';
import { useStore } from '../store';

export default function SubscriptionCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tierId: urlTierId } = useParams();
  const { tierId: stateTierId } = location.state || {};
  const selectedTierId = urlTierId || stateTierId;
  
  const { 
    tiers, subscription, purchaseSubscription, isLoading 
  } = useSubscriptionStore();
  const { walletBalance, paymentMethods, updateWalletBalance } = useStore();

  const [tier, setTier] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('WALLET');
  const [autoRenew, setAutoRenew] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no tierId in state, redirect back to plans
    if (!selectedTierId && !subscription) {
      navigate('/subscription');
      return;
    }
    
    // Use selectedTierId from state, or current subscription tier if renewing
    const tid = selectedTierId || subscription?.tierId;
    const foundTier = tiers.find(t => t.id === tid);
    setTier(foundTier);
  }, [selectedTierId, tiers, subscription]);

  if (!tier) return null;

  const isUpgrade = subscription && subscription.status !== 'EXPIRED' && subscription.tierId !== tier.id;
  
  // Calculate upgrade proration
  let upgradeCredit = 0;
  let chargeAmount = tier.price;

  if (isUpgrade) {
    upgradeCredit = Math.round(subscription.remainingKm * subscription.ratePerKm);
    chargeAmount = Math.max(0, tier.price - upgradeCredit);
  }

  const handlePurchase = async () => {
    if (paymentMethod === 'WALLET' && walletBalance < chargeAmount) {
      setError('Insufficient wallet balance');
      return;
    }

    try {
      setError(null);
      await purchaseSubscription(tier.id, paymentMethod, autoRenew);
      
      // Deduct from local wallet mock if wallet was used
      if (paymentMethod === 'WALLET') {
        updateWalletBalance(-chargeAmount);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/subscription');
      }, 2500);
    } catch (e) {
      setError(e.message || 'Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A2421] pb-10">
      {/* HEADER */}
      <header className="pt-12 px-5 mb-8 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-white/50">
          <ChevronLeft size={28} />
        </button>
        <h1 className="font-display text-2xl font-bold text-white">Confirm subscription</h1>
      </header>

      <div className="px-5 space-y-6">
        {/* TIER SUMMARY CARD */}
        <div className="bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-display text-2xl font-bold text-white mb-1">{tier.name}</div>
              <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block tracking-wider">
                {tier.km} KM • 30 DAYS
              </div>
            </div>
            <button 
              onClick={() => navigate('/subscription')}
              className="text-[var(--color-primary)] text-xs font-bold hover:underline"
            >
              Change plan
            </button>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-white/40 text-xs mb-1">Price</div>
              <div className="text-white font-bold text-xl">NGN {tier.price.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs mb-1">Rate</div>
              <div className="text-white/60 text-sm font-medium">NGN {tier.ratePerKm}/km</div>
            </div>
          </div>
        </div>

        {/* UPGRADE SUMMARY */}
        {isUpgrade && (
          <div className="bg-[#1D2A26] border border-[var(--color-primary)]/30 rounded-[28px] p-6 space-y-4">
            <h4 className="text-white font-bold flex items-center gap-2">
              <RefreshCcw size={16} className="text-[var(--color-primary)]" />
              Upgrade Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Current: {subscription.tierName}</span>
                <span className="text-white/60">{subscription.remainingKm.toFixed(1)}km left</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Credit value</span>
                <span className="text-[var(--color-primary)] font-bold">NGN {upgradeCredit.toLocaleString()}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between items-center pt-1">
                <span className="text-white font-bold">Today's charge</span>
                <span className="text-white font-display text-2xl font-bold">NGN {chargeAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-white/40 italic">
                Current km balance forfeited on upgrade. New 30-day cycle starts today.
              </p>
            </div>
          </div>
        )}

        {/* COVERAGE SECTION */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
            <h5 className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckCircle2 size={12} /> Covered
            </h5>
            <ul className="space-y-2 text-[11px] text-white/70 font-medium leading-tight">
              <li>Per-km fare at NGN {tier.ratePerKm}/km</li>
              <li>Priority driver matching</li>
              <li>Locked fare — no surge</li>
              <li>30 days of seamless travel</li>
            </ul>
          </div>
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
            <h5 className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertCircle size={12} /> Not covered
            </h5>
            <ul className="space-y-2 text-[11px] text-white/50 italic leading-tight">
              <li>NGN 100 flag fall per trip</li>
              <li>Waiting fees (NGN 30/min)</li>
              <li>Extra stop fees (NGN 100)</li>
              <li>Additional seats</li>
            </ul>
          </div>
        </div>

        {/* EXPIRY NOTICE */}
        <div className="bg-amber-500/5 border-l-4 border-amber-500/50 rounded-r-2xl p-4 flex gap-4">
          <Info size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-[11px] text-white/60 leading-relaxed font-medium">
            Unused km expire after 30 days. Unused km are not refunded or rolled over.
          </p>
        </div>

        {/* PAYMENT METHOD */}
        <div className="space-y-3 pt-2">
          <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] pl-1">Payment method</h3>
          
          {/* WALLET */}
          <button 
            onClick={() => setPaymentMethod('WALLET')}
            className={`w-full bg-[var(--color-surface-1)] p-5 rounded-2xl border flex items-center justify-between transition-all ${
              paymentMethod === 'WALLET' ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : 'border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${walletBalance < chargeAmount ? 'text-red-400 bg-red-400/10' : 'text-white/30 bg-white/5'}`}>
                <Wallet size={20} />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-sm">Wallet Balance</div>
                <div className={`text-xs ${walletBalance < chargeAmount ? 'text-red-400 font-bold' : 'text-white/40'}`}>
                  NGN {walletBalance.toLocaleString()}
                </div>
              </div>
            </div>
            {walletBalance < chargeAmount && (
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/wallet/topup'); }}
                className="text-[var(--color-primary)] text-xs font-black uppercase tracking-widest border border-[var(--color-primary)]/30 px-3 py-1.5 rounded-lg"
              >
                Top up
              </button>
            )}
            {paymentMethod === 'WALLET' && walletBalance >= chargeAmount && <CheckCircle2 size={20} className="text-[var(--color-primary)]" />}
          </button>

          {/* CARD (if exists) */}
          {paymentMethods.length > 0 && (
            <button 
              onClick={() => setPaymentMethod('CARD')}
              className={`w-full bg-[var(--color-surface-1)] p-5 rounded-2xl border flex items-center justify-between transition-all ${
                paymentMethod === 'CARD' ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
                  <CreditCard size={20} />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-sm">•••• {paymentMethods[0].last4}</div>
                  <div className="text-white/40 text-xs">{paymentMethods[0].brand}</div>
                </div>
              </div>
              {paymentMethod === 'CARD' && <CheckCircle2 size={20} className="text-[var(--color-primary)]" />}
            </button>
          )}
        </div>

        {/* AUTO RENEWAL */}
        <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-[28px] p-5 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-white font-bold text-sm">Auto-renew after 30 days</div>
            <p className="text-white/40 text-[10px] leading-relaxed pr-8 mt-1">
              We will charge NGN {tier.price.toLocaleString()} from your wallet automatically. You'll receive a reminder 24h before.
            </p>
          </div>
          <button 
            onClick={() => setAutoRenew(!autoRenew)}
            className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${autoRenew ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
          >
            <motion.div 
              animate={{ x: autoRenew ? 26 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
            />
          </button>
        </div>

        {/* ERROR MESSAGE */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA BUTTON */}
        <div className="pt-4">
          <button 
            disabled={isLoading || (paymentMethod === 'WALLET' && walletBalance < chargeAmount)}
            onClick={handlePurchase}
            className={`w-full h-14 rounded-2xl font-bold text-lg shadow-[var(--shadow-glow)] flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
              isLoading || (paymentMethod === 'WALLET' && walletBalance < chargeAmount)
                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed shadow-none'
                : 'bg-[var(--color-primary)] text-black'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Processing...
              </>
            ) : (
              `Start ${tier.name} — NGN ${chargeAmount.toLocaleString()}`
            )}
          </button>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-[var(--color-bg)] flex flex-col items-center justify-center p-10 text-center"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-24 h-24 bg-[var(--color-primary)] rounded-[32px] flex items-center justify-center mb-8 shadow-[var(--shadow-glow)]"
            >
              <Check size={48} className="text-black" />
            </motion.div>
            
            <h2 className="font-display text-3xl font-bold text-white mb-2">You are on!</h2>
            <p className="text-white/50 text-lg">
              Your <span className="text-[var(--color-primary)] font-bold">{tier.name}</span> is active. 
              Travel freely for 30 days.
            </p>

            {/* Confetti simulation (simplified) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth, 
                    y: -20,
                    rotate: 0 
                  }}
                  animate={{ 
                    y: window.innerHeight + 20,
                    rotate: 360,
                    x: (Math.random() - 0.5) * 100 + (Math.random() * window.innerWidth)
                  }}
                  transition={{ 
                    duration: 1.5 + Math.random() * 2, 
                    repeat: Infinity,
                    delay: Math.random() * 0.5 
                  }}
                  className="absolute w-2 h-2 bg-[var(--color-primary)] rounded-full opacity-50"
                  style={{ backgroundColor: i % 2 === 0 ? '#7FFF00' : '#ffffff' }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
