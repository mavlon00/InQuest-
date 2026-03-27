import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function SubscriptionHistory() {
  const navigate = useNavigate();
  const { history, fetchHistory, isLoading } = useSubscriptionStore();
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (isLoading && history.length === 0) {
    return <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/10 border-t-[#7FFF00] rounded-full animate-spin"></div>
    </div>;
  }

  // Calculate generic summary stats based on history array
  const totalSpent = history.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalKmPurchased = history.reduce((acc, curr) => acc + curr.kmTotal, 0);
  const totalKmUsed = history.reduce((acc, curr) => acc + curr.kmUsed, 0);
  const totalSaved = history.reduce((acc, curr) => acc + (curr.savedThisCycle || 0), 0);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body pb-12">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-3)] px-4 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-bold ml-2">Subscription History</h1>
      </div>

      <div className="px-4 pt-6 space-y-8 animate-fade-in">
        
        {/* Summary Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] border border-[var(--color-surface-3)]">
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Total Spent</span>
            <span className="text-xl font-display font-bold text-[var(--color-primary)]">₦{totalSpent.toLocaleString() || '32,500'}</span> {/* Fallbacks for mock */}
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] border border-[var(--color-surface-3)]">
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Total Km Purchased</span>
            <span className="text-xl font-display font-bold text-[var(--color-primary)]">{totalKmPurchased || 350} km</span>
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] border border-[var(--color-surface-3)]">
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Total Km Used</span>
            <span className="text-xl font-display font-bold text-[var(--color-primary)]">{totalKmUsed.toFixed(1) || '312.4'} km</span>
          </div>
          <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-md)] border border-[var(--color-surface-3)]">
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1 block">Total Saved</span>
            <span className="text-xl font-display font-bold text-[var(--color-primary)]">₦{totalSaved.toLocaleString() || '12,450'}</span>
          </div>
        </div>

        {/* Plan History List */}
        <div className="space-y-4">
          <h2 className="text-lg font-display font-bold text-white mb-2">Past Plans</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-secondary)]">
              <p>No past subscriptions found.</p>
            </div>
          ) : (
            history.map((plan) => (
              <div key={plan.id} className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] overflow-hidden">
                
                {/* Always visible header */}
                <div 
                  onClick={() => toggleExpand(plan.id)}
                  className="p-5 cursor-pointer active:bg-[var(--color-surface-2)] transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-display font-bold text-white mb-1 capitalize">{plan.plan} Plan</h3>
                      <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                        {formatDate(plan.purchasedAt)} - {formatDate(plan.expiresAt)}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${
                      plan.status === 'active' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' :
                      plan.status === 'expired' ? 'bg-[var(--color-surface-3)] text-white/50' : 
                      'bg-[var(--color-error)]/20 text-[var(--color-error)]'
                    }`}>
                      {plan.status}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                    {plan.kmTotal} km total <span className="mx-1">|</span> {plan.kmUsed.toFixed(1)} km used <span className="mx-1">|</span> <span className="text-[var(--color-text-muted)]">{plan.kmRemaining > 0 ? `${plan.kmRemaining.toFixed(1)} km forfeited` : '0 km forfeited'}</span>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                    <span className="text-sm font-display font-bold text-[var(--color-primary)]">
                      ₦ saved: {(plan.savedThisCycle || 0).toLocaleString()}
                    </span>
                    {expandedId === plan.id ? <ChevronUp size={20} className="text-white/50" /> : <ChevronDown size={20} className="text-[var(--color-primary)]" />}
                  </div>
                </div>

                {/* Expanded Trip Breakdown */}
                <AnimatePresence>
                  {expandedId === plan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-[var(--color-surface-0)]/50 border-t border-[var(--color-surface-3)]"
                    >
                      <div className="p-4 space-y-4">
                        <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Trip Breakdown</h4>
                        
                        {/* Mock Trips for breakdown */}
                        {[
                          { date: "12 Feb", route: "Lekki → VI", mapKm: 4.5, iotKm: 4.8, charged: 4.8, saved: 96 },
                          { date: "10 Feb", route: "VI → Ikoyi", mapKm: 2.1, iotKm: 2.1, charged: 2.1, saved: 42 },
                          { date: "09 Feb", route: "Ikoyi → Lekki", mapKm: 5.2, iotKm: 5.5, charged: 5.5, saved: 110 },
                        ].map((trip, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm pb-3 border-b border-white/5 last:border-0 last:pb-0">
                            <div>
                              <p className="font-semibold text-white mb-0.5">{trip.route}</p>
                              <p className="text-xs text-[var(--color-text-muted)]">{trip.date} • Map est: {trip.mapKm} km</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[var(--color-primary)]">-{trip.charged} km <span className="text-[10px] text-[var(--color-text-muted)]">(IoT actual)</span></p>
                              <p className="text-xs text-[var(--color-success)] font-semibold mt-0.5">Saved ₦{trip.saved}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
