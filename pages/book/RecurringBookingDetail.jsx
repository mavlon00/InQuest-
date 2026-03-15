import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MoreVertical, MapPin, Clock, 
  Calendar, Pause, Play, Trash2, Edit2,
  ChevronRight, Info, AlertCircle, CheckCircle2,
  Zap, ArrowRight, History, Settings
} from 'lucide-react';
import useRecurringStore from '../../store/recurringStore';
import { format, parseISO } from 'date-fns';

export default function RecurringBookingDetail() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { 
    schedules, upcomingRides, pauseSchedule, resumeSchedule, 
    deleteSchedule, skipInstance, restoreInstance 
  } = useRecurringStore();

  const [showMenu, setShowMenu] = useState(false);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const found = schedules.find(s => s.id === scheduleId);
    if (found) {
      setSchedule(found);
    } else {
      // If not found in store, could fetch from API
      // For now, redirect if missing
      // navigate('/book/recurring');
    }
  }, [scheduleId, schedules]);

  if (!schedule) return null;

  const relevantUpcoming = upcomingRides.filter(r => r.scheduleId === scheduleId);
  const isActive = schedule.status === 'ACTIVE';

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this schedule? This cannot be undone.')) {
      await deleteSchedule(scheduleId);
      navigate('/book/recurring');
    }
  };

  const handleToggleStatus = async () => {
    if (isActive) {
      await pauseSchedule(scheduleId);
    } else {
      await resumeSchedule(scheduleId);
    }
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#1A2421] pb-20">
      {/* HEADER */}
      <header className="pt-12 px-5 mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/book/recurring')} className="text-white/50">
          <ChevronLeft size={28} />
        </button>
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-white/50"
          >
            <MoreVertical size={20} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-[var(--color-surface-2)] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <button 
                  onClick={() => navigate(`/book/recurring/${scheduleId}/edit`)}
                  className="w-full text-left p-4 text-sm font-medium text-white/70 hover:bg-white/5 flex items-center gap-3"
                >
                  <Edit2 size={16} /> Edit Schedule
                </button>
                <button 
                  onClick={handleToggleStatus}
                  className={`w-full text-left p-4 text-sm font-medium hover:bg-white/5 flex items-center gap-3 ${isActive ? 'text-amber-500' : 'text-[#7FFF00]'}`}
                >
                  {isActive ? <Pause size={16} /> : <Play size={16} />} 
                  {isActive ? 'Pause Routine' : 'Resume Routine'}
                </button>
                <div className="h-px bg-white/5" />
                <button 
                  onClick={handleDelete}
                  className="w-full text-left p-4 text-sm font-medium text-red-500 hover:bg-red-500/5 flex items-center gap-3"
                >
                  <Trash2 size={16} /> Delete Forever
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="px-5 space-y-8">
        {/* HERO SECTION */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-display text-4xl font-bold text-white">{schedule.name}</h1>
            {isActive ? (
               <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_rgba(127,255,0,0.5)] mt-1" />
            ) : (
               <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 border border-amber-500/20">Paused</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-white/40 text-sm font-bold uppercase tracking-widest">
            <Clock size={16} />
            <span>{schedule.time}</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <div className="flex gap-1">
               {[1,2,3,4,5,6,7].map(d => {
                 const active = schedule.daysOfWeek.includes(d);
                 const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                 return (
                   <span key={d} className={`text-[10px] ${active ? 'text-[var(--color-primary)] font-black' : 'text-white/10'}`}>
                     {dayLabels[d-1]}
                   </span>
                 );
               })}
            </div>
          </div>
        </section>

        {/* ROUTE CARD */}
        <section className="bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[var(--color-primary)]/5 to-transparent pointer-events-none" />
           
           <div className="space-y-6 relative">
              <div className="flex gap-4">
                 <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/10" />
                 </div>
                 <div>
                    <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Pickup</div>
                    <div className="text-white font-medium">{schedule.pickup.address}</div>
                 </div>
              </div>

              <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[var(--color-primary)]/30 to-red-500/30" />

              <div className="flex gap-4">
                 <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5">
                    <MapPin size={18} className="text-red-500" />
                 </div>
                 <div>
                    <div className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Destination</div>
                    <div className="text-white font-medium">{schedule.destination.address}</div>
                 </div>
              </div>
           </div>

           <div className="mt-8 flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-center">
                 <div className="text-[9px] text-white/30 font-black uppercase mb-1">Distance</div>
                 <div className="text-white font-bold">{schedule.routeDistanceKm} km</div>
              </div>
              <div className="text-center">
                 <div className="text-[9px] text-white/30 font-black uppercase mb-1">Duration</div>
                 <div className="text-white font-bold">~{schedule.routeDurationMins}m</div>
              </div>
              <div className="text-center">
                 <div className="text-[9px] text-white/30 font-black uppercase mb-1">Est. Fare</div>
                 <div className="text-[var(--color-primary)] font-bold">₦{schedule.estimatedFare}</div>
              </div>
           </div>
        </section>

        {/* SETTINGS SUMMARY */}
        <section className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
              <div className="text-white/30 text-[9px] font-black uppercase">Payment</div>
              <div className="flex items-center gap-2">
                 <Zap size={14} className="text-[var(--color-primary)]" />
                 <span className="text-white font-bold text-sm">Subscription</span>
              </div>
           </div>
           <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
              <div className="text-white/30 text-[9px] font-black uppercase">Holiday Rules</div>
              <div className="flex items-center gap-2">
                 <Calendar size={14} className="text-[#60A5FA]" />
                 <span className="text-white font-bold text-sm">{schedule.skipHolidays ? 'Auto-skip' : 'Always run'}</span>
              </div>
           </div>
        </section>

        {/* UPCOMING INSTANCES */}
        <section className="space-y-4">
           <h3 className="text-white font-bold flex items-center gap-2 px-1">
              Upcoming instances
              <span className="text-white/20 text-xs font-medium">Next 7 days</span>
           </h3>

           {relevantUpcoming.length > 0 ? (
             <div className="space-y-3">
                {relevantUpcoming.slice(0, 5).map((ride, i) => (
                  <div 
                    key={i} 
                    className={`bg-[var(--color-surface-1)] rounded-2xl p-4 border flex items-center justify-between ${ride.status === 'SKIPPED' ? 'opacity-40 border-white/5 grayscale-[0.8]' : 'border-white/5'}`}
                  >
                     <div className="flex items-center gap-4">
                        <div className="text-center min-w-[32px]">
                           <div className="text-[10px] text-white/30 font-bold uppercase">{format(parseISO(ride.scheduledAt), 'EEE')}</div>
                           <div className="text-white font-display font-bold text-lg leading-tight">{format(parseISO(ride.scheduledAt), 'd')}</div>
                        </div>
                        <div>
                           <div className="text-white font-bold text-sm">{format(parseISO(ride.scheduledAt), 'h:mm a')}</div>
                           <div className="text-white/40 text-[10px] font-medium tracking-wider">{ride.status}</div>
                        </div>
                     </div>

                     <button 
                       onClick={() => ride.status === 'SKIPPED' ? restoreInstance(ride.instanceId) : skipInstance(ride.instanceId)}
                       className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${ride.status === 'SKIPPED' ? 'bg-[var(--color-primary)] text-black' : 'bg-white/10 text-white/60'}`}
                     >
                        {ride.status === 'SKIPPED' ? 'Restore' : 'Skip'}
                     </button>
                  </div>
                ))}
             </div>
           ) : (
             <div className="py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center text-white/20 text-xs italic">
                No instances scheduled in current active window.
             </div>
           )}
        </section>

        {/* STATS / HISTORY */}
        <section>
           <button className="w-full bg-white/5 border border-white/5 rounded-[28px] p-6 flex items-center justify-between group active:bg-white/10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/30">
                    <History size={20} />
                 </div>
                 <div className="text-left">
                    <h4 className="text-white font-bold">Trip History</h4>
                    <p className="text-white/30 text-[10px]">View all {schedule.totalTrips} completed rides for this routine</p>
                 </div>
              </div>
              <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
           </button>
        </section>

        {/* NOTIFICATION NOTICE */}
        <div className="bg-amber-500/5 border-l-4 border-amber-500/30 p-4 rounded-r-2xl flex gap-4">
           <Info size={18} className="text-amber-500 flex-shrink-0" />
           <p className="text-[11px] text-white/50 leading-relaxed italic font-medium">
             Driver matching begins exactly 5 minutes before scheduled pickup time. Ensure your wallet has sufficient funds or your subscription is active.
           </p>
        </div>
      </div>
    </div>
  );
}
