import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, XCircle, Wallet, AlertCircle, RefreshCcw, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function SubscriptionCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlanId = searchParams.get('plan');
  const context = searchParams.get('context'); // 'renew' | 'change'
  
  const { plans, fetchPlans, subscribe, isLoading, activeSubscription } = useSubscriptionStore();
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId || 'commuter');
  const [autoRenew, setAutoRenew] = useState(activeSubscription?.autoRenew || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock wallet balance for demonstration
  const walletBalance = 50000; // Increased for testing

  useEffect(() => {
    if (plans.length === 0) fetchPlans();
  }, [plans, fetchPlans]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const [processingStep, setProcessingStep] = useState(0);
  const steps = ["Verifying Wallet", "Updating Plan", "Provisioning KM"];

  const handleSubscribe = async () => {
    if (walletBalance < (selectedPlan?.price || 0)) {
      alert(`Insufficient wallet balance. Top up at least ₦${(selectedPlan.price - walletBalance).toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);
    setProcessingStep(0);
    
    try {
      // Simulate real-feeling processing steps
      for (let i = 0; i < steps.length; i++) {
        setProcessingStep(i);
        await new Promise(r => setTimeout(r, 1200));
      }

      await subscribe(selectedPlanId);
      setShowConfetti(true);
      setTimeout(() => {
        navigate('/subscription', { replace: true });
      }, 2500);
    } catch (e) {
      alert("Failed to subscribe: " + e.message);
      setIsSubmitting(false);
    }
  };

  if (!selectedPlan && isLoading) {
    return <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/10 border-t-[#7FFF00] rounded-full animate-spin"></div>
    </div>;
  }

  if (!selectedPlan) return <div className="min-h-screen bg-[var(--color-bg)] pt-20 px-4 text-center text-white font-bold">Plan not found</div>;

  const isLowBalance = walletBalance < 500;
  const savingsAmount = (selectedPlan.standardRate * selectedPlan.kmTotal) - selectedPlan.price;

  const getHeaderTitle = () => {
    if (context === 'renew') return 'Renew Plan';
    if (context === 'change') return 'Switch Plan';
    return 'Subscribe';
  };

  const getSubmitLabel = () => {
    if (isSubmitting) return 'Processing...';
    if (context === 'renew') return `Confirm Renewal — ₦${selectedPlan.price.toLocaleString()}`;
    if (context === 'change') return `Confirm Switch — ₦${selectedPlan.price.toLocaleString()}`;
    return `Pay ₦${selectedPlan.price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body pb-32 relative overflow-x-hidden">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-white/5 px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold ml-2">{getHeaderTitle()}</h1>
      </div>

      <div className="px-4 pt-6 space-y-6 animate-fade-in relative">
        
        {/* Confetti & Processing Overlay */}
        <AnimatePresence>
          {isSubmitting && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              {!showConfetti ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 relative mb-8">
                     <div className="absolute inset-0 border-4 border-[var(--color-primary)]/10 rounded-full" />
                     <motion.div 
                        initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-t-[var(--color-primary)] rounded-full"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-display font-bold text-white mb-2">Processing</h3>
                    <div className="flex flex-col gap-2 items-center">
                       {steps.map((s, idx) => (
                         <motion.div 
                           key={s}
                           initial={{ opacity: 0.3, y: 10 }}
                           animate={{ 
                             opacity: idx === processingStep ? 1 : idx < processingStep ? 0.6 : 0.3,
                             y: 0,
                             scale: idx === processingStep ? 1.05 : 1
                           }}
                           className="flex items-center gap-2"
                         >
                            {idx < processingStep ? (
                               <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
                            ) : idx === processingStep ? (
                               <div className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
                            ) : (
                               <div className="w-4 h-4 rounded-full border-2 border-white/10" />
                            )}
                            <span className={`text-sm font-bold ${idx === processingStep ? 'text-white' : 'text-white/40'}`}>
                               {s}
                            </span>
                         </motion.div>
                       ))}
                    </div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(127,255,0,0.4)]">
                    <CheckCircle2 size={48} className="text-black" />
                  </div>
                  <h2 className="text-4xl font-display font-bold text-white mb-2">Success!</h2>
                  <p className="text-[var(--color-text-secondary)] font-bold mb-8">Your plan is now active.</p>
                  
                  <div className="w-64 h-64 bg-[#7FFF00] rounded-full blur-[100px] absolute opacity-20 -z-10" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {context === 'renew' && !isSubmitting && (
          <div className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 p-4 rounded-2xl flex items-start gap-3">
             <RefreshCcw size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
             <p className="text-sm text-[var(--color-primary)] font-medium leading-tight">
                Renewing will add <span className="font-bold">{selectedPlan.kmTotal} km</span> to your current balance immediately.
             </p>
          </div>
        )}

        {/* Plan Summary Card */}
        <motion.div 
          layoutId="plan-card"
          className="bg-[var(--color-surface-1)] p-6 rounded-[var(--radius-xl)] border border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)] opacity-5 blur-[40px] rounded-full -mr-16 -mt-16" />
          
          <h2 className="text-2xl font-display font-bold text-white mb-2">{selectedPlan.name} Plan</h2>
          <div className="text-[32px] font-display font-bold text-[var(--color-primary)] mb-4">
            ₦{(selectedPlan.price).toLocaleString()}
          </div>
          
          <div className="space-y-2 mb-4 font-semibold text-sm">
            <p className="text-white">{selectedPlan.kmTotal} km credit <span className="text-[var(--color-text-muted)] mx-1">|</span> 30 days validity</p>
            <p className="text-[var(--color-text-secondary)]">You pay ₦{selectedPlan.ratePerKm}/km — standard rate is ₦{selectedPlan.standardRate}/km</p>
          </div>
          
          {savingsAmount > 0 && (
            <div className="inline-block bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-[var(--radius-sm)]">
              <p className="text-sm font-bold text-[var(--color-primary)]">
                Save ₦{savingsAmount.toLocaleString()} vs standard rate
              </p>
            </div>
          )}
        </motion.div>

        {/* Plan Selector Row (Only if context ISN'T renew) */}
        {context !== 'renew' && !isSubmitting && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white/30 uppercase tracking-widest px-1">SELECT TIER</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x">
              {plans.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`snap-start shrink-0 px-5 py-4 rounded-[20px] border-2 transition-all min-w-[140px] ${
                    selectedPlanId === p.id 
                      ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]' 
                      : 'bg-[var(--color-surface-1)] border-white/5 text-[var(--color-text-secondary)]'
                  }`}
                >
                  <div className={`font-bold whitespace-nowrap mb-1 ${selectedPlanId === p.id ? 'text-white' : 'text-white/40'}`}>
                    {p.name}
                  </div>
                  <div className={`text-sm font-black ${selectedPlanId === p.id ? 'text-[var(--color-primary)]' : 'text-white/20'}`}>
                    ₦{p.price.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wallet Balance Row */}
        {!isSubmitting && (
          <div className="bg-[var(--color-surface-1)] p-5 rounded-[24px] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <Wallet size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-0.5">Wallet Balance</p>
                <p className="text-lg font-display font-bold text-white leading-none">₦{walletBalance.toLocaleString()}</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-2 rounded-full active:scale-95 transition-transform">
              Top Up
            </button>
          </div>
        )}
        
        {isLowBalance && !isSubmitting && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-500/90 leading-tight">
                Low wallet balance. Top up to cover flag fall fees for your trips.
              </p>
            </div>
          </div>
        )}

        {/* Auto-renewal Toggle */}
        {!isSubmitting && (
          <div className="bg-[var(--color-surface-1)] p-5 rounded-[24px] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                 <h3 className="text-sm font-bold text-white mb-0.5">Auto-renewal</h3>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ENABLED ON EXHAUSTION</p>
              </div>
              <button 
                onClick={() => setAutoRenew(!autoRenew)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${autoRenew ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: autoRenew ? 24 : 0 }}
                  className="w-4 h-4 rounded-full bg-white shadow-sm" 
                />
              </button>
            </div>
            {autoRenew && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-[var(--color-text-secondary)] mt-2 italic leading-relaxed">
                * Charged automatically once your km balance hits zero.
              </motion.p>
            )}
          </div>
        )}

      </div>

      {/* ── Fixed Bottom CTA ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pt-12 pb-8">
        <button
          onClick={handleSubscribe}
          disabled={isSubmitting}
          className="w-full h-16 bg-[var(--color-primary)] text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 shadow-[var(--shadow-glow)]"
        >
          {isSubmitting ? (
             <span className="flex items-center gap-2">
               <Loader2 className="animate-spin" size={20} /> Processing...
             </span>
          ) : (
            <>
               {getSubmitLabel()} <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
