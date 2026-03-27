import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Calendar, Filter, ChevronRight, 
  MapPin, Clock, ArrowRightLeft, TrendingUp, Info
} from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';

export default function SubscriptionHistory() {
  const navigate = useNavigate();
  const { 
    subscriptionTrips, historySummary, fetchHistory, isLoading 
  } = useSubscriptionStore();

  const [filter, setFilter] = useState('current'); // 'current' | 'previous' | 'all'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    fetchHistory(filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#1A2421] pb-10">
      {/* HEADER */}
      <header className="pt-12 px-5 mb-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-white/50">
            <ChevronLeft size={28} />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-white/70 text-sm font-bold active:scale-95 transition-transform"
            >
              <Filter size={14} />
              {filter === 'current' ? 'Current Cycle' : filter === 'previous' ? 'Previous Cycles' : 'All Trips'}
            </button>
            
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-[var(--color-surface-2)] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {[
                    { id: 'current', label: 'Current Cycle' },
                    { id: 'previous', label: 'Previous Cycles' },
                    { id: 'all', label: 'All Trips' }
                  ].map((opt) => (
                    <button 
                      key={opt.id}
                      onClick={() => { setFilter(opt.id); setShowFilterDropdown(false); }}
                      className={`w-full text-left p-4 text-sm font-medium hover:bg-white/5 transition-colors ${filter === opt.id ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'text-white/60'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-white leading-tight">Subscription History</h1>
      </header>

      {/* SUMMARY STATS */}
      {historySummary && (
        <section className="px-5 mb-10">
          <div className="bg-gradient-to-br from-[var(--color-surface-1)] to-[var(--color-surface-2)] rounded-[32px] p-6 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-[var(--color-primary)]">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest">Efficiency metrics</h3>
            </div>

            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <div className="text-white font-display text-4xl font-bold">{historySummary.totalKmUsed.toFixed(1)}</div>
                <div className="text-white/30 text-[10px] font-bold uppercase mt-1">Total KM Used</div>
              </div>
              <div className="text-right">
                <div className="text-[var(--color-primary)] font-display text-4xl font-bold">₦{historySummary.totalSaved.toLocaleString()}</div>
                <div className="text-white/30 text-[10px] font-bold uppercase mt-1">Total Saved</div>
              </div>
              <div>
                <div className="text-white/60 text-2xl font-bold">{historySummary.totalTrips}</div>
                <div className="text-white/30 text-[10px] font-bold uppercase mt-1">Seamless Trips</div>
              </div>
              <div className="text-right">
                <div className="text-white/60 text-2xl font-bold">{historySummary.averageKmPerTrip.toFixed(1)}km</div>
                <div className="text-white/30 text-[10px] font-bold uppercase mt-1">Avg KM / Trip</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TRIP LIST */}
      <section className="px-5 space-y-4">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          Trips <span className="text-white/30 font-medium text-sm">({subscriptionTrips.length})</span>
        </h3>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-white/30">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading trips...</span>
          </div>
        ) : subscriptionTrips.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
              <History size={24} />
            </div>
            <p className="text-white/30 text-sm font-medium italic">No trips found for this period</p>
          </div>
        ) : (
          subscriptionTrips.map((trip, i) => (
            <div 
              key={i} 
              className={`bg-[var(--color-surface-1)] rounded-[28px] p-6 border border-white/5 shadow-lg relative overflow-hidden ${trip.isOverflow ? 'border-amber-500/20' : ''}`}
            >
              {trip.isOverflow && (
                <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl border-b border-l border-amber-500/20">
                  Split billing
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="text-white font-bold text-sm tracking-tight">{trip.route}</div>
                  <div className="flex items-center gap-2 text-[10px] text-white/30 font-medium uppercase">
                    <Calendar size={10} />
                    {new Date(trip.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                    <Clock size={10} />
                    {new Date(trip.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--color-primary)] font-display text-xl font-bold">-{trip.kmDeducted}km</div>
                  <div className="text-[#22C55E] text-[10px] font-bold uppercase tracking-wider mt-0.5">Saved ₦{trip.subscriptionSaved}</div>
                </div>
              </div>

              <div className="h-px bg-white/5 w-full mb-4" />

              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-white/30">
                  <MapPin size={10} />
                  <span>IoT Verified Actual</span>
                </div>
                {trip.isOverflow ? (
                  <div className="flex items-center gap-2 text-amber-500">
                    <Info size={10} />
                    <span>Split with wallet</span>
                  </div>
                ) : (
                  <div className="text-[var(--color-primary)]/40">Fully covered</div>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {/* FOOTER MESSAGE */}
      <div className="mt-12 px-10 text-center">
        <p className="text-[10px] text-white/30 leading-relaxed italic">
          Trips are logged immediately after trip completion based on your device's IoT distance measurement.
        </p>
      </div>
    </div>
  );
}
