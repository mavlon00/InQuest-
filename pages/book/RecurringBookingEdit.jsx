import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Clock, 
  Calendar, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, X, Zap, 
  ArrowLeft, Bell
} from 'lucide-react';
import useRecurringStore from '../../store/recurringStore';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function RecurringBookingEdit() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const { 
    schedules, draftSchedule, updateDraft, checkConflicts, 
    checkHolidays, updateSchedule, resetDraft, setEditMode
  } = useRecurringStore();
  const { isSubscriptionUsable } = useSubscriptionStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEditMode(scheduleId);
    return () => resetDraft();
  }, [scheduleId]);

  if (!draftSchedule.id) return null;

  // ─── STEP 1: ROUTE SELECTION (Simplified for Edit) ─────────────────────────
  const RenderStep1 = () => {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-white font-display text-3xl font-bold">The Route</h2>
          <p className="text-white/40 text-sm">Where are you going every day?</p>
        </div>

        <div className="space-y-4">
           {/* Pickup */}
           <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-[24px] p-5 flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20" />
              <div className="flex-1">
                 <div className="text-[10px] text-white/30 font-black uppercase mb-1">Pickup</div>
                 <div className="text-white font-bold">{draftSchedule.pickup?.address}</div>
              </div>
           </div>

           {/* Destination */}
           <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-[24px] p-5 flex items-center gap-4">
              <MapPin size={20} className="text-red-500" />
              <div className="flex-1">
                 <div className="text-[10px] text-white/30 font-black uppercase mb-1">Destination</div>
                 <div className="text-white font-bold">{draftSchedule.destination?.address}</div>
              </div>
           </div>
        </div>

        <div className="bg-white/5 p-6 rounded-[28px] border border-white/5 flex items-center justify-between">
           <div>
              <div className="text-white/30 text-[10px] font-black uppercase mb-1">Distance</div>
              <div className="text-white font-display text-xl font-bold">{draftSchedule.routeDistanceKm} km</div>
           </div>
           <div>
              <div className="text-white/30 text-[10px] font-black uppercase mb-1">Duration</div>
              <div className="text-white font-display text-xl font-bold">~{draftSchedule.routeDurationMins} mins</div>
           </div>
           <div>
              <div className="text-white/30 text-[10px] font-black uppercase mb-1">Est. Fare</div>
              <div className="text-[var(--color-primary)] font-display text-xl font-bold">₦{draftSchedule.estimatedFare}</div>
           </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
           <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
           <p className="text-[10px] text-white/40 italic leading-relaxed">
             Route modification is limited in edit mode to maintain consistent pricing. To change the route entirely, please create a new schedule.
           </p>
        </div>

        <button 
           onClick={() => setStep(2)}
           className="w-full h-16 bg-[var(--color-primary)] text-black font-bold rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-2"
        >
           Update Schedule <ArrowRight size={20} />
        </button>
      </div>
    );
  };

  // ─── STEP 2: SCHEDULE LOGIC ───────────────────────────────────────────────
  const RenderStep2 = () => {
    const days = [
      { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' },
      { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' },
      { id: 7, label: 'Sun' }
    ];

    const toggleDay = (dayId) => {
      const current = draftSchedule.daysOfWeek;
      const next = current.includes(dayId) 
        ? current.filter(id => id !== dayId)
        : [...current, dayId].sort();
      updateDraft({ daysOfWeek: next });
    };

    const canContinue = draftSchedule.daysOfWeek.length > 0 && draftSchedule.time;

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-white font-display text-3xl font-bold">The Schedule</h2>
          <p className="text-white/40 text-sm">When do you want to travel?</p>
        </div>

        <div className="space-y-4">
           <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Repeat on</div>
           <div className="grid grid-cols-4 gap-3">
              {days.map(day => (
                <button 
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`h-14 rounded-2xl border font-bold text-xs transition-all ${
                    draftSchedule.daysOfWeek.includes(day.id)
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-black'
                      : 'bg-white/5 border-white/5 text-white/40'
                  }`}
                >
                  {day.label}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Pickup Time</div>
              <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                 <Clock size={16} className="text-white/30" />
                 <input 
                    type="time"
                    value={draftSchedule.time || ''}
                    onChange={(e) => updateDraft({ time: e.target.value })}
                    className="bg-transparent border-none outline-none text-white font-bold w-full"
                 />
              </div>
           </div>
           
           <div className="space-y-2">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Internal Name</div>
              <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                 <input 
                    type="text"
                    value={draftSchedule.name || ''}
                    onChange={(e) => updateDraft({ name: e.target.value })}
                    placeholder="e.g. Work Commute"
                    className="bg-transparent border-none outline-none text-white font-bold w-full text-sm"
                 />
              </div>
           </div>
        </div>

        <div className="bg-[var(--color-surface-2)] rounded-[28px] p-6 border border-white/5">
           <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-bold">Return Trip?</h4>
              <button 
                onClick={() => updateDraft({ hasReturn: !draftSchedule.hasReturn })}
                className={`w-12 h-6 rounded-full relative transition-colors ${draftSchedule.hasReturn ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: draftSchedule.hasReturn ? 26 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                />
              </button>
           </div>
           
           <AnimatePresence>
              {draftSchedule.hasReturn && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 pt-4 border-t border-white/5"
                >
                   <div className="space-y-2">
                      <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Return Pickup Time</div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                         <Clock size={16} className="text-white/30" />
                         <input 
                            type="time"
                            value={draftSchedule.returnTime || ''}
                            onChange={(e) => updateDraft({ returnTime: e.target.value })}
                            className="bg-transparent border-none outline-none text-white font-bold w-full"
                         />
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        <button 
           disabled={!canContinue}
           onClick={async () => {
             await checkConflicts(draftSchedule.daysOfWeek, draftSchedule.time);
             setStep(3);
           }}
           className={`w-full h-16 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
             canContinue ? 'bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)]' : 'bg-white/5 text-white/20'
           }`}
        >
           Review Changes <ArrowRight size={20} />
        </button>
      </div>
    );
  };

  // ─── STEP 3: REVIEW & SAVE ────────────────────────────────────────────────
  const RenderStep3 = () => {
    const isUsable = isSubscriptionUsable();
    const hasConflict = draftSchedule.hasConflict;

    const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        await updateSchedule(scheduleId, draftSchedule);
        navigate(`/book/recurring/${scheduleId}`);
      } catch (e) {
        console.error(e);
      }
      setIsSubmitting(false);
    };

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-white font-display text-3xl font-bold">Review Changes</h2>
          <p className="text-white/40 text-sm">Please confirm your updated routine</p>
        </div>

        <div className="space-y-6">
           {/* SUMMARY CARD */}
           <div className="bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/5">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h4 className="text-white font-bold text-lg mb-1">{draftSchedule.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--color-primary)] font-black uppercase tracking-widest">
                       <Clock size={12} /> {draftSchedule.time}
                    </div>
                 </div>
                 <div className="bg-white/5 px-3 py-1 rounded-full text-[9px] text-white/40 font-black uppercase">
                    {draftSchedule.daysOfWeek.length} days / week
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                    <span className="text-white/60 truncate">{draftSchedule.pickup?.address}</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-white/60 truncate">{draftSchedule.destination?.address}</span>
                 </div>
              </div>
           </div>

           {/* CONFLICTS */}
           {hasConflict && draftSchedule.conflictDetails?.id !== scheduleId && (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex gap-4">
                 <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                 <div>
                    <h4 className="text-red-400 font-bold text-sm mb-1">Time Conflict</h4>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                       This schedule overlaps with <span className="text-white font-bold">"{draftSchedule.conflictDetails?.name}"</span>. 
                    </p>
                 </div>
              </div>
           )}

           {/* SETTINGS */}
           <div className="bg-white/5 border border-white/5 rounded-[28px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-white/30" />
                    <span className="text-sm font-medium text-white/80">Skip Holidays</span>
                 </div>
                 <button 
                   onClick={() => updateDraft({ skipHolidays: !draftSchedule.skipHolidays })}
                   className={`w-10 h-5 rounded-full relative transition-colors ${draftSchedule.skipHolidays ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                 >
                   <motion.div 
                     animate={{ x: draftSchedule.skipHolidays ? 22 : 2 }}
                     className="absolute top-1 w-3 h-3 bg-white rounded-full" 
                   />
                 </button>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Bell size={18} className="text-white/30" />
                    <span className="text-sm font-medium text-white/80">Notifications</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => updateDraft({ notifications: { ...draftSchedule.notifications, oneHour: !draftSchedule.notifications.oneHour } })}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${draftSchedule.notifications.oneHour ? 'bg-[var(--color-primary)] text-black' : 'bg-white/5 text-white/40'}`}
                    >
                      1h
                    </button>
                    <button 
                      onClick={() => updateDraft({ notifications: { ...draftSchedule.notifications, fifteenMin: !draftSchedule.notifications.fifteenMin } })}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${draftSchedule.notifications.fifteenMin ? 'bg-[var(--color-primary)] text-black' : 'bg-white/5 text-white/40'}`}
                    >
                      15m
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-4 space-y-3">
           <button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full h-16 bg-[var(--color-primary)] text-black font-bold text-lg rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
           >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Save Changes'}
           </button>
           <button 
              onClick={() => setStep(2)}
              className="w-full h-14 bg-transparent text-white/30 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
           >
              <ArrowLeft size={16} /> Edit Schedule
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A2421] pb-10">
      <header className="pt-12 px-5 mb-8 flex items-center justify-between">
        <button 
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else navigate(-1);
          }}
          className="text-white/50"
        >
          <ChevronLeft size={28} />
        </button>
        
        <div className="flex gap-2">
           {[1, 2, 3].map(s => (
             <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-[var(--color-primary)]' : 'w-4 bg-white/10'}`} />
           ))}
        </div>

        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/30">
           <Edit2 size={20} />
        </div>
      </header>

      <div className="px-5">
         {step === 1 && <RenderStep1 />}
         {step === 2 && <RenderStep2 />}
         {step === 3 && <RenderStep3 />}
      </div>
    </div>
  );
}

function Edit2({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
