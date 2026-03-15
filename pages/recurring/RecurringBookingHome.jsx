import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import useRecurringStore from '../../store/recurringStore';

export default function RecurringBookingHome() {
  const navigate = useNavigate();
  const { schedules, upcomingRides, fetchSchedules, fetchUpcomingRides, isLoading } = useRecurringStore();

  useEffect(() => {
    fetchSchedules();
    fetchUpcomingRides(14); // Next 14 days
  }, [fetchSchedules, fetchUpcomingRides]);

  if (isLoading && schedules.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#7FFF00] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Group upcoming trips by date loosely for display
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body pb-24 relative">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-3)] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold ml-2">Recurring Rides</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-8 animate-fade-in">
        
        {/* Empty State vs Schedules */}
        {schedules.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-4">
            <div className="w-20 h-20 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-[var(--color-primary)]" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">Automate your commute</h2>
            <p className="text-[var(--color-text-secondary)]">Set your pickup, destination, and days. We'll book your ride automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Your Schedules</h2>
              <span className="text-xs font-semibold text-white bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">{schedules.length} active</span>
            </div>

            {schedules.map(schedule => (
              <motion.div 
                key={schedule.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/book/recurring/${schedule.id}`)}
                className={`bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-4 border transition-colors cursor-pointer
                  ${schedule.status === 'ACTIVE' 
                    ? 'border-[var(--color-surface-3)] active:border-[var(--color-primary)]/50' 
                    : 'border-transparent opacity-60'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-display font-bold text-white leading-tight pr-4">
                    {schedule.name || schedule.label || 'Recurring Ride'}
                  </h3>
                  <div className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${
                    schedule.status === 'ACTIVE' ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]' : 'bg-white/10 text-white/50'
                  }`}>
                    {schedule.status}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <span className="text-white truncate">{schedule.pickup?.address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm pl-2 border-l-2 border-dashed border-[var(--color-surface-3)] py-1 mb-1">
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold ml-4">To</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={16} className="text-[var(--color-error)] shrink-0 mt-0.5" />
                    <span className="text-white truncate">{schedule.destination?.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--color-surface-3)]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                    <Clock size={14} />
                    <span>{schedule.time} on {schedule.daysOfWeek.length} days/week</span>
                  </div>
                  <span className="text-xs font-bold text-[var(--color-primary)]">
                    {schedule.hasReturn && '⇄ Return trip'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upcoming Rides Feed */}
        {upcomingRides.length > 0 && (
          <div className="pt-4 border-t border-[var(--color-surface-3)]">
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Upcoming Trips</h2>
            
            <div className="space-y-3">
              {upcomingRides.map((trip, idx) => {
                const tripDate = new Date(trip.scheduledAt);
                const isToday = tripDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) === today;
                const timeStr = tripDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                const dateStr = tripDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                
                return (
                  <div key={idx} className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] p-3 flex items-center justify-between border-l-4 border-l-[var(--color-primary)] border border-[var(--color-surface-3)]">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{timeStr}</span>
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{isToday ? 'Today' : dateStr}</span>
                      </div>
                      <p className="text-sm text-white truncate font-medium">{trip.scheduleName}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{trip.pickup?.address} → {trip.destination?.address}</p>
                    </div>
                    {trip.status === 'SKIPPED' ? (
                       <span className="text-[10px] font-bold text-[var(--color-warning)] uppercase tracking-wider bg-[var(--color-warning)]/10 px-2 py-1 rounded">Skipped</span>
                    ) : (
                      <button className="text-xs font-bold text-[var(--color-text-secondary)] active:text-white border border-[var(--color-surface-3)] px-3 py-1.5 rounded-full">
                        Skip
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => navigate('/book/recurring/create')}
          className="w-14 h-14 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center shadow-[var(--shadow-glow)] active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

    </div>
  );
}
