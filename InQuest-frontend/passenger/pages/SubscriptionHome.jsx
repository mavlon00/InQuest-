import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ArrowRight, CheckCircle2, QrCode, 
  History, TrendingUp, ShieldCheck, Zap,
  AlertTriangle, RefreshCcw, CreditCard, PiggyBank,
  Check
} from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';
import { useStore } from '../store';

// ─── TIER CARD COMPONENT ─────────────────────────────────────────────────────
function TierCard({ tier, onSelect, recommended }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative bg-[var(--color-surface-1)] rounded-[32px] p-6 border transition-all ${
        recommended 
          ? 'border-[var(--color-primary)] shadow-[0_0_40px_rgba(127,255,0,0.15)] scale-[1.02]' 
          : 'border-white/5'
      }`}
    >
      {tier.popular && (
        <div className="absolute top-6 right-6 bg-[var(--color-primary)] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
          Most Popular
        </div>
      )}

      <div className="font-display text-xl font-semibold text-white/50 mb-1">{tier.name}</div>
      <div className="flex items-baseline gap-2 mb-6">
        <div className="font-display text-5xl font-bold text-[var(--color-primary)]">{tier.km}</div>
        <div className="text-white/40 font-medium">kilometres</div>
      </div>

      <div className="space-y-1 mb-6">
        <div className="font-display text-2xl font-bold text-white">NGN {tier.price.toLocaleString()} <span className="text-sm font-normal text-white/40">/ 30 days</span></div>
        <div className="text-sm text-white/30 font-medium">NGN {tier.ratePerKm} per km</div>
      </div>

      <div className="h-px bg-white/5 w-full mb-6" />

      <div className="space-y-4 mb-8">
        {[
          'Automatic payment every trip',
          'Priority driver matching',
          'Locked fare — no surge',
          'Valid for 30 days from purchase'
        ].map((benefit, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-[var(--color-primary)]" />
            <span className="text-white/80 text-sm font-medium">{benefit}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-1 hover:underline"
      >
        What is not included {expanded ? '↑' : '↓'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 text-[11px] text-white/40 italic leading-relaxed"
          >
            NGN 100 flag fall per trip charged to wallet. Waiting fees, extra stops, and insurance charged to wallet. Covers your seat only.
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => onSelect(tier.id)}
        className={`w-full h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
          recommended 
            ? 'bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)]' 
            : 'bg-[var(--color-surface-3)] text-white border border-white/5'
        }`}
      >
        Choose {tier.name} <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function SubscriptionHome() {
  const navigate = useNavigate();
  const { 
    subscription, tiers, fetchActiveSubscription, fetchTiers,
    isLoading, toggleAutoRenewal, fetchSavings, savingsThisCycle,
    fetchHistory, subscriptionTrips
  } = useSubscriptionStore();
  const { walletBalance } = useStore();

  const [monthlyKm, setMonthlyKm] = useState(80);

  useEffect(() => {
    fetchActiveSubscription();
    fetchTiers();
    fetchSavings();
    fetchHistory('current');
  }, []);

  const getRecommendedTierId = (km) => {
    if (km <= 50) return 'starter';
    if (km <= 100) return 'commuter';
    if (km <= 200) return 'premium';
    return 'unlimited';
  };

  const recommendedTierId = getRecommendedTierId(monthlyKm);
  const recommendedTier = tiers.find(t => t.id === recommendedTierId);

  // ─── STATE A: NO ACTIVE SUBSCRIPTION ───────────────────────────────────────
  if (!subscription) {
    return (
      <div className="min-h-screen bg-[#1A2421] pb-10">
        <header className="pt-12 px-5 mb-8">
          <button onClick={() => navigate(-1)} className="mb-6 text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">Travel Freely</h1>
        </header>

        {/* HERO CARD */}
        <section className="px-5 mb-10">
          <div className="bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] rounded-[32px] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity">
              <QrCode size={200} className="text-[var(--color-primary)]" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={28} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">Board. Travel. Walk Away.</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                With a subscription, payment happens automatically. No cash. No wallet checks. No payment screens. You just travel.
              </p>
            </div>
          </div>
        </section>

        {/* SAVINGS CALCULATOR */}
        <section className="px-5 mb-12">
          <h3 className="text-white/40 text-xs font-black uppercase tracking-widest mb-6">How far do you travel monthly?</h3>
          
          <div className="space-y-8">
            <div className="relative h-12 flex items-center">
              <input 
                type="range"
                min="20"
                max="300"
                step="5"
                value={monthlyKm}
                onChange={(e) => setMonthlyKm(parseInt(e.target.value))}
                className="w-full h-2 bg-[var(--color-surface-3)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
              />
              <div className="absolute -bottom-6 left-0 text-[10px] text-white/30 font-bold uppercase">20km</div>
              <div className="absolute -bottom-6 right-0 text-[10px] text-white/30 font-bold uppercase">300km</div>
            </div>

            <div className="bg-[var(--color-surface-2)] rounded-[28px] p-6 border border-white/5 shadow-xl">
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <div className="text-white/30 text-[10px] font-black uppercase mb-1">Standard Cost</div>
                  <div className="text-white/60 font-semibold line-through">NGN {(monthlyKm * 120).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--color-primary)] text-[10px] font-black uppercase mb-1">With {recommendedTier?.name}</div>
                  <div className="text-white font-bold text-lg">NGN {((monthlyKm * (recommendedTier?.ratePerKm || 120))).toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-[var(--color-primary)]/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--color-primary)] text-black rounded-full flex items-center justify-center shadow-[var(--shadow-glow)] flex-shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div className="text-[var(--color-primary)] text-xs font-black uppercase tracking-widest">You save NGN {(monthlyKm * (120 - (recommendedTier?.ratePerKm || 120))).toLocaleString()}</div>
                  <div className="text-white/50 text-[10px] italic">Plus: auto-pay, priority matching, no surge.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TIER CARDS */}
        <section className="px-5 space-y-6">
          <h3 className="text-white/40 text-xs font-black uppercase tracking-widest pl-1">Choose a pass</h3>
          <div className="space-y-6 pb-20">
            {tiers.map(tier => (
              <TierCard 
                key={tier.id} 
                tier={tier} 
                recommended={tier.id === recommendedTierId}
                onSelect={(id) => navigate(`/subscription/checkout/${id}`)}
              />
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="px-5 mt-4 space-y-8 bg-black/20 py-12 rounded-[40px]">
          <h3 className="text-white font-bold text-center text-xl">How it works</h3>
          <div className="space-y-10">
            {[
              { title: 'Buy a km bundle upfront', desc: 'Choose how many km you need. Pay once. Valid for 30 days.' },
              { title: 'Scan, tap, travel', desc: 'Scan the QR code inside any Inquest keke. Tap Start. Get to your destination.' },
              { title: 'Walk away', desc: 'Payment settles automatically. Your km balance updates in the background.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 bg-[var(--color-surface-3)] rounded-2xl flex items-center justify-center text-white font-display text-xl font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-bold">{step.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ─── STATE B: ACTIVE SUBSCRIPTION ──────────────────────────────────────────
  const percentLeft = (subscription.remainingKm / subscription.totalKm) * 100;
  const isLow = subscription.status === 'LOW' || subscription.status === 'CRITICAL';
  
  const ringColor = subscription.status === 'CRITICAL' ? '#F87171' : isLow ? '#FBBF24' : '#7FFF00';

  return (
    <div className="min-h-screen bg-[#1A2421] pb-24">
      <header className="pt-12 px-5 mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="mb-4 text-white/50">
            <ChevronLeft size={28} />
          </button>
          <h1 className="font-display text-3xl font-bold text-white">{subscription.tierName}</h1>
          <p className="text-[var(--color-primary)] text-xs font-black uppercase tracking-[0.2em]">Active subscription</p>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-white/30">
          <ShieldCheck size={24} />
        </div>
      </header>

      {/* KM BALANCE HERO */}
      <section className="px-5 mb-10">
        <div className="flex flex-col items-center">
          <div className="relative w-[280px] h-[280px] flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="140" cy="140" r="120" 
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" 
              />
              <motion.circle 
                cx="140" cy="140" r="120" 
                fill="none" stroke={ringColor} strokeWidth="16" 
                strokeDasharray={2 * Math.PI * 120}
                initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - percentLeft / 100) }}
                strokeLinecap="round"
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            
            <div className="text-center z-10 flex flex-col items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`font-display text-7xl font-bold text-white mb-2 ${subscription.status === 'CRITICAL' ? 'animate-pulse text-red-400' : ''}`}
              >
                {subscription.remainingKm.toFixed(1)}
              </motion.div>
              <div className="font-display text-2xl text-white/40 font-semibold mb-1">km</div>
              <div className="text-white/30 text-xs font-black uppercase tracking-[0.2em]">remaining</div>
            </div>

            {subscription.status === 'CRITICAL' && (
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-4 border-red-500/20" 
              />
            )}
          </div>

          <div className="mt-8 flex items-center gap-6 text-white/50 text-sm font-medium">
            <span>{subscription.usedKm.toFixed(1)} km used</span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{subscription.totalKm} km total</span>
          </div>
        </div>
      </section>

      {/* DETAILS CHIPS */}
      <section className="px-5 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 size={14} className="text-[var(--color-primary)]" />
            <span className="text-white/80 text-xs font-bold whitespace-nowrap">{subscription.tierName}</span>
          </div>
          <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2 flex-shrink-0">
            <span className="text-white/80 text-xs font-bold whitespace-nowrap">NGN {subscription.ratePerKm}/km</span>
          </div>
          <div className={`border px-4 py-3 rounded-2xl flex items-center gap-2 flex-shrink-0 ${subscription.daysRemaining <= 5 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-white/5 border-white/10 text-white/80'}`}>
            <AlertTriangle size={14} className={subscription.daysRemaining <= 5 ? 'opacity-100' : 'opacity-30'} />
            <span className="text-xs font-bold whitespace-nowrap">{subscription.daysRemaining} days left</span>
          </div>
        </div>
      </section>

      {/* SEAMLESS TRAVEL CARD */}
      <section className="px-5 mb-8">
        <button 
          onClick={() => navigate('/ride/tap')}
          className="w-full bg-[var(--color-surface-1)] border border-[var(--color-primary)]/40 rounded-[28px] p-6 text-left flex items-center gap-5 relative overflow-hidden group active:scale-[0.98] transition-transform shadow-xl"
        >
          <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform flex-shrink-0">
            <QrCode size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-bold">Ready to ride</h4>
              <motion.div 
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ArrowRight size={14} className="text-[var(--color-primary)]" />
              </motion.div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed">Scan the QR inside any Inquest keke to start your trip instantly.</p>
          </div>
        </button>
      </section>

      {/* SAVINGS THIS CYCLE */}
      <section className="px-5 mb-8">
        <div className="bg-[#1D2A26] border border-[#22C55E]/30 rounded-[28px] p-6 flex items-center gap-5">
          <div className="w-12 h-12 bg-[#22C55E]/10 rounded-full flex items-center justify-center text-[#22C55E] flex-shrink-0 border border-[#22C55E]/10">
            <PiggyBank size={24} />
          </div>
          <div>
            <div className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-1">You have saved</div>
            <div className="font-display text-3xl font-bold text-[#22C55E]">NGN {savingsThisCycle.toLocaleString()}</div>
            <div className="text-white/30 text-[10px] italic">this cycle vs standard rate</div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="px-5 mb-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Renew', icon: <RefreshCcw size={18} />, path: `/subscription/checkout/${subscription.tierId}` },
            { label: 'Upgrade', icon: <Zap size={18} />, path: '/subscription' }, // Reuse home for selection
            { label: 'History', icon: <History size={18} />, path: '/subscription/history' }
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => navigate(action.path)}
              className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 active:bg-white/5 transition-colors"
            >
              <div className="text-white/40 group-hover:text-white transition-colors">{action.icon}</div>
              <span className="text-white text-xs font-bold">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* AUTO RENEWAL */}
      <section className="px-5 mb-10">
        <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-[28px] p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/30">
              <RefreshCcw size={20} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">
                {subscription.autoRenew ? `Auto-renews on ${new Date(subscription.expiresAt).toLocaleDateString()}` : 'Auto-renewal is off'}
              </div>
              <p className="text-white/40 text-[10px]">
                {subscription.autoRenew ? `Charges NGN ${subscription.price?.toLocaleString() || '10,000'} to your wallet` : 'You will need to renew manually'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => toggleAutoRenewal(!subscription.autoRenew)}
            className={`w-12 h-6 rounded-full relative transition-colors ${subscription.autoRenew ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
          >
            <motion.div 
              animate={{ x: subscription.autoRenew ? 26 : 2 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
            />
          </button>
        </div>
      </section>

      {/* RECENT TRIPS */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-white font-bold">Recent subscription trips</h3>
          <Link to="/subscription/history" className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest hover:underline">Full history</Link>
        </div>

        <div className="space-y-3">
          {subscriptionTrips.slice(0, 5).map((trip, i) => (
            <div key={i} className={`bg-[var(--color-surface-1)] border-l-3 rounded-2xl p-4 flex items-center justify-between ${trip.isOverflow ? 'border-amber-500 bg-amber-500/5' : 'border-white/5'}`}>
              <div className="flex flex-col gap-1 overflow-hidden">
                <div className="text-white/30 text-[10px] uppercase font-bold">{new Date(trip.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {new Date(trip.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-white font-bold text-sm truncate pr-4">{trip.route}</div>
                {trip.isOverflow && <div className="text-amber-500 text-[10px] font-bold">Split billing occurred</div>}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[var(--color-primary)] font-bold text-sm">-{trip.kmDeducted}km</div>
                <div className="text-[#22C55E] text-[10px] font-bold">saved NGN {trip.subscriptionSaved}</div>
              </div>
            </div>
          ))}
          
          {subscriptionTrips.length === 0 && (
            <div className="py-10 text-center text-white/20 text-sm italic bg-white/5 rounded-[32px] border border-dashed border-white/10">
              No trips recorded yet this cycle.
            </div>
          )}
        </div>
      </section>

      {/* CANCEL LINK */}
      {subscription.autoRenew && (
        <div className="px-5 mt-12 text-center">
          <button 
            onClick={() => {
              if (window.confirm('Turn off auto-renewal? Your subscription continues until expire date but won\'t renew.')) {
                toggleAutoRenewal(false);
              }
            }}
            className="text-white/30 text-xs hover:text-red-400 transition-colors uppercase font-black tracking-widest border-b border-white/10 pb-1"
          >
            Turn off auto-renewal
          </button>
        </div>
      )}
    </div>
  );
}
