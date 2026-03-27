import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, ArrowRight, AlertTriangle, ShieldCheck, Wallet, RefreshCcw, Zap, Sparkles, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSubscriptionStore from '../../store/subscriptionStore';
import PlanChangeGallery from '../../components/subscription/PlanChangeGallery';

export default function SubscriptionHome() {
  const navigate = useNavigate();
  const { activeSubscription, plans, history, fetchActiveSubscription, fetchPlans, fetchHistory, isLoading } = useSubscriptionStore();
  const [showRenewSheet, setShowRenewSheet] = useState(false);
  const [showChangeGallery, setShowChangeGallery] = useState(false);

  useEffect(() => {
    fetchActiveSubscription();
    fetchPlans();
    fetchHistory();
  }, [fetchActiveSubscription, fetchPlans, fetchHistory]);

  const hasSubscription = activeSubscription !== null;
  const isExpired = activeSubscription?.status === 'expired';
  
  if (isLoading && !activeSubscription && plans.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#7FFF00] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showChangeGallery) {
    return (
      <PlanChangeGallery 
        plans={plans} 
        currentPlanId={activeSubscription?.plan}
        onSelect={(planId) => {
          setShowChangeGallery(false);
          navigate(`/subscription/checkout?plan=${planId}&context=change`);
        }}
        onCancel={() => setShowChangeGallery(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body pb-24 relative overflow-x-hidden">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-3)] px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold ml-2">
          {hasSubscription ? 'My Subscription' : 'Ride Plans'}
        </h1>
      </div>

      {hasSubscription ? (
        <SubscriptionDashboard 
          sub={activeSubscription} 
          history={history} 
          navigate={navigate} 
          isExpired={isExpired}
          onRenew={() => setShowRenewSheet(true)}
          onChange={() => setShowChangeGallery(true)}
        />
      ) : (
        <PlanSelection plans={plans} navigate={navigate} />
      )}

      {/* Renew Plan Sheet */}
      <AnimatePresence>
        {showRenewSheet && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRenewSheet(false)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 bg-[var(--color-surface-1)] rounded-t-[32px] z-[101] p-6 pb-12 border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCcw size={32} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Renew Plan</h3>
                <p className="text-[var(--color-text-secondary)] text-sm px-6">
                   You are about to renew your <span className="text-white font-bold capitalize">{activeSubscription?.plan}</span> plan. 
                   New km will be added to your balance.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl mb-8 flex justify-between items-center">
                 <div>
                    <p className="text-[10px] text-white/30 font-black uppercase mb-1">Total to pay</p>
                    <p className="text-2xl font-display font-bold text-white">
                       ₦{plans.find(p => p.id === activeSubscription?.plan)?.price.toLocaleString() || '0'}
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] text-white/30 font-black uppercase mb-1">Payment Method</p>
                    <div className="flex items-center gap-1.5 justify-end">
                       <Wallet size={14} className="text-[var(--color-primary)]" />
                       <span className="text-sm font-bold text-white">Wallet</span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowRenewSheet(false)}
                   className="flex-1 h-16 rounded-2xl bg-white/5 text-white font-bold active:bg-white/10 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => {
                     setShowRenewSheet(false);
                     navigate(`/subscription/checkout?plan=${activeSubscription?.plan}&context=renew`);
                   }}
                   className="flex-[2] h-16 rounded-2xl bg-[var(--color-primary)] text-black font-bold shadow-[var(--shadow-glow)] active:scale-95 transition-transform flex items-center justify-center gap-2"
                 >
                   Confirm Renewal <ArrowRight size={20} />
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── STATE A: NO SUBSCRIPTION ──────────────────────────────────────────────
function PlanSelection({ plans, navigate }) {
  return (
    <div className="px-4 pt-6 space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Ride Plans</h2>
        <p className="text-[var(--color-text-secondary)]">Save more. Ride smarter.</p>
      </div>

      {/* Plan Cards */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/subscription/checkout?plan=${plan.id}`)}
            className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-5 relative border-b border-[var(--color-surface-3)] cursor-pointer"
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-5 -translate-y-1/2 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-[var(--shadow-glow)]">
                Most Popular
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-display font-bold text-white leading-tight">{plan.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{plan.kmTotal} km for 30 days</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-display font-bold text-[var(--color-primary)]">
                  ₦{(plan.price).toLocaleString()}
                </p>
                <div className="inline-flex items-center gap-1 bg-[var(--color-surface-2)] px-2 py-0.5 rounded text-xs text-[var(--color-text-secondary)] font-semibold mt-1">
                  ₦{plan.ratePerKm}/km
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Benefits Strip */}
      <div className="grid grid-cols-3 gap-2 py-6 border-t border-[var(--color-surface-3)]">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
            <Wallet size={20} className="text-[var(--color-primary)]" />
          </div>
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Save up to 33%</span>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
            <ShieldCheck size={20} className="text-[var(--color-primary)]" />
          </div>
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Pay per trip</span>
        </div>
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center">
            <RefreshCcw size={20} className="text-[var(--color-primary)]" />
          </div>
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">No lock-in</span>
        </div>
      </div>

      <div className="text-center pt-4">
        <button onClick={() => navigate('/subscription/history')} className="text-sm font-semibold text-[var(--color-text-secondary)] underline underline-offset-4 active:text-white">
          Already have a subscription?
        </button>
      </div>
    </div>
  );
}

// ─── STATE B & C: DASHBOARD (Active or Expired) ────────────────────────
function SubscriptionDashboard({ sub, history, navigate, isExpired, onRenew, onChange }) {
  const percentUsed = (sub.kmUsed / sub.kmTotal) * 100;
  const percentRemaining = (sub.kmRemaining / sub.kmTotal) * 100;
  
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

  // Override colors for expired
  if (isExpired) {
    kmColor = 'text-[var(--color-sub-expired)]';
    barColor = 'bg-[var(--color-sub-expired)]';
  }

  const isLowDays = !isExpired && sub.daysRemaining <= 3;

  return (
    <div className="px-4 pt-4 space-y-6 animate-fade-in relative">
      
      {/* Expired Warning Banner */}
      {isExpired && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-sm)] p-3 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-500/90 leading-tight font-medium">
            Your subscription expired. You're now paying the standard rate (₦120/km).
          </p>
        </div>
      )}

      {/* Hero Card */}
      <div className={`p-6 rounded-[var(--radius-xl)] bg-[var(--color-surface-0)] border ${isExpired ? 'border-[var(--color-error)]/40' : 'border-[var(--color-primary)]/40 shadow-[var(--shadow-glow)]'}`}>
        
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-display font-bold text-white capitalize">{sub.plan} Plan</h2>
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${isExpired ? 'bg-[var(--color-error)]/20 text-[var(--color-error)]' : 'bg-[var(--color-success)]/20 text-[var(--color-success)]'}`}>
            {isExpired ? 'Expired' : 'Active'}
          </div>
        </div>

        {/* KM display */}
        <div className="mb-8">
          <h1 className={`text-[40px] leading-none font-display font-bold tracking-tight mb-4 ${kmColor}`}>
            {isExpired ? '0 km — Expired' : `${sub.kmRemaining.toFixed(1)} km left`}
          </h1>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[var(--color-surface-3)] rounded-full overflow-hidden mb-2 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${isExpired ? 100 : percentUsed}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full ${barColor}`}
            />
            {!isExpired && (
              <motion.div 
                initial={{ left: 0 }}
                animate={{ left: `${percentUsed}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md"
              />
            )}
          </div>
          <div className="flex justify-between text-xs font-semibold text-[var(--color-text-muted)]">
            <span>0 km</span>
            <span>{sub.kmTotal} km total</span>
          </div>
        </div>

        {/* Details Row */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            {isExpired ? (
              <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Expired {Math.abs(sub.daysRemaining)} days ago</span>
            ) : (
              <span className={`text-sm font-semibold ${isLowDays ? 'text-[var(--color-warning)] flex items-center gap-1' : 'text-[var(--color-text-secondary)]'}`}>
                {isLowDays && <AlertTriangle size={14} />}
                Expires in {sub.daysRemaining} days
              </span>
            )}
          </div>
          <div className="text-sm font-semibold text-[var(--color-text-secondary)]">
            You pay ₦{sub.ratePerKm}/km
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isExpired ? (
            <button 
              onClick={onRenew}
              className="flex-1 h-14 rounded-[var(--radius-lg)] bg-[var(--color-primary)] text-black font-bold text-base flex justify-center items-center active:scale-95 transition-transform"
            >
              Renew Plan
            </button>
          ) : (
            <>
              <button 
                onClick={onRenew}
                className="flex-1 h-12 rounded-[var(--radius-md)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold text-sm bg-transparent active:bg-[var(--color-primary)]/10"
              >
                Renew Plan
              </button>
              <button 
                onClick={onChange}
                className="flex-[0.5] h-12 rounded-[var(--radius-md)] bg-white/5 text-[var(--color-text-secondary)] font-bold text-sm active:bg-white/10"
              >
                Change
              </button>
            </>
          )}
        </div>
      </div>

      {/* Usage Stats Section */}
      <div className="pt-2">
        <h3 className="text-base font-display font-bold text-[var(--color-text-secondary)] mb-4">This cycle</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Trips</span>
            <span className="text-2xl font-display font-bold text-[var(--color-primary)]">{sub.tripsThisCycle}</span>
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">km used</span>
            <span className="text-2xl font-display font-bold text-[var(--color-primary)]">{sub.kmUsed.toFixed(1)}</span>
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Saved</span>
            <span className="text-2xl font-display font-bold text-[var(--color-primary)]">₦{(sub.savedThisCycle).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-display font-bold text-white">Recent subscription trips</h3>
          <button onClick={() => navigate('/subscription/history')} className="text-xs font-bold text-[var(--color-primary)]">
            See all
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Mock recent trips data */}
          {(history?.trips || [
            { id: 1, route: "Lekki Phase 1 → VI", km: 4.2, saved: 84 },
            { id: 2, route: "Ikoyi → Lekki", km: 6.8, saved: 136 },
            { id: 3, route: "VI → Yaba", km: 12.4, saved: 248 }
          ]).slice(0, 3).map((trip, idx) => (
            <div key={idx} className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] flex justify-between items-center active:bg-[var(--color-surface-2)]">
              <div className="flex flex-col max-w-[60%]">
                <span className="text-sm font-semibold text-white truncate">{trip.route || "Recent Trip"}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">{trip.km} km (IoT actual)</span>
              </div>
              <div className="text-right flex flex-col">
                <span className="text-sm font-display font-bold text-[var(--color-primary)]">Saved ₦{trip.saved}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
