import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Map, Clock, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRecurringStore from '../../store/recurringStore';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function RecurringBookingCreate() {
  const navigate = useNavigate();
  const { 
    draftSchedule, 
    updateDraft, 
    checkConflicts, 
    checkHolidays, 
    setDraftRouteData,
    createSchedule, 
    resetDraft 
  } = useRecurringStore();
  
  const { activeSubscription } = useSubscriptionStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill mock route data for prototype
  useEffect(() => {
    setDraftRouteData(7.4, 30, 888); // 7.4km, 30 mins, ₦888 estimated fare
    return () => resetDraft(); // Clean up on unmount
  }, [setDraftRouteData, resetDraft]);

  const handleNext = async () => {
    if (step === 2) {
      // Check for conflicts and holidays when moving past step 2
      const conflicts = await checkConflicts(draftSchedule.daysOfWeek, draftSchedule.time);
      if (conflicts.length > 0) {
        // Handled in step 3 UI
      }
      checkHolidays(draftSchedule.daysOfWeek, new Date().toISOString().split('T')[0]);
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    if (step === 1) navigate(-1);
    else setStep(prev => prev - 1);
  };

  const submitSchedule = async () => {
    setIsSubmitting(true);
    try {
      await createSchedule({
        ...draftSchedule,
        name: draftSchedule.name || 'My Commute',
        status: 'ACTIVE',
      });
      navigate('/book/recurring', { replace: true });
    } catch (e) {
      alert("Failed to save schedule: " + e.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body pb-32 flex flex-col">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-3)] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-display font-bold leading-tight">New Schedule</h1>
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Step {step} of 4</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-20">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: ROUTE & LABEL */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Where to?</h2>
                <p className="text-[var(--color-text-secondary)] text-sm">Set your route and give it a memorable name.</p>
              </div>

              {/* Label Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Schedule Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Morning Commute" 
                  value={draftSchedule.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  className="w-full h-14 bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] px-4 text-white font-semibold focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>

              {/* Route Selection (Mock) */}
              <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] space-y-4 relative">
                <div className="absolute left-[23px] top-[36px] bottom-[36px] w-[2px] bg-dashed border-l-2 border-dashed border-[var(--color-surface-3)] pointer-events-none" />
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                  </div>
                  <input 
                    type="text" 
                    value={draftSchedule.pickup?.address || ''}
                    placeholder="Set Pickup Location"
                    className="flex-1 h-12 bg-transparent text-white font-semibold border-b border-[var(--color-surface-3)] focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
                    onChange={(e) => updateDraft({ pickup: { address: e.target.value } })}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[var(--color-error)]/20 flex items-center justify-center z-10">
                    <div className="w-2.5 h-2.5 bg-[var(--color-error)]" />
                  </div>
                  <input 
                    type="text" 
                    value={draftSchedule.destination?.address || ''}
                    placeholder="Set Destination"
                    className="flex-1 h-12 bg-transparent text-white font-semibold border-b border-[var(--color-surface-3)] focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-text-muted)]"
                    onChange={(e) => updateDraft({ destination: { address: e.target.value } })}
                  />
                </div>
              </div>

              {/* Optional Return Trip Toggle */}
              <div className="bg-[var(--color-surface-1)] p-5 rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Book return trip too?</h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">Useful for round-trip commutes</p>
                </div>
                <button 
                  onClick={() => updateDraft({ hasReturn: !draftSchedule.hasReturn })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${draftSchedule.hasReturn ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)]'}`}
                >
                  <motion.div animate={{ x: draftSchedule.hasReturn ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: TIMING & RECURRENCE */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">When do you ride?</h2>
                <p className="text-[var(--color-text-secondary)] text-sm">Select days and pickup times.</p>
              </div>

              {/* Days selection */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">Repeats on</h3>
                <div className="flex gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                    const isSelected = draftSchedule.daysOfWeek.includes(i);
                    return (
                      <button 
                        key={i}
                        onClick={() => {
                          const newDays = isSelected 
                            ? draftSchedule.daysOfWeek.filter(d => d !== i)
                            : [...draftSchedule.daysOfWeek, i].sort();
                          updateDraft({ daysOfWeek: newDays });
                        }}
                        className={`flex-1 h-12 rounded-[var(--radius-md)] flex items-center justify-center font-bold transition-colors ${
                          isSelected ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
                {/* Handy presets */}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateDraft({ daysOfWeek: [1,2,3,4,5] })} className="text-xs font-semibold text-[var(--color-primary)] px-3 py-1.5 bg-[var(--color-primary)]/10 rounded-full">Weekdays</button>
                  <button onClick={() => updateDraft({ daysOfWeek: [0,6] })} className="text-xs font-semibold text-[var(--color-text-secondary)] px-3 py-1.5 bg-[var(--color-surface-2)] rounded-full">Weekends</button>
                </div>
              </div>

              {/* Time selection */}
              <div className="space-y-4">
                <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock size={20} className="text-[var(--color-text-secondary)]" />
                    <span className="text-sm font-bold text-white">Pickup Time</span>
                  </div>
                  <input 
                    type="time" 
                    value={draftSchedule.time || ''}
                    onChange={(e) => updateDraft({ time: e.target.value })}
                    className="bg-[var(--color-surface-2)] text-white font-display font-bold px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-surface-3)] focus:outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                {draftSchedule.hasReturn && (
                  <div className="bg-[var(--color-surface-1)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-[var(--color-text-secondary)]" />
                      <span className="text-sm font-bold text-white">Return Time</span>
                    </div>
                    <input 
                      type="time" 
                      value={draftSchedule.returnTime || ''}
                      onChange={(e) => updateDraft({ returnTime: e.target.value })}
                      className="bg-[var(--color-surface-2)] text-white font-display font-bold px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-surface-3)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                )}
              </div>
              
              {/* Skip Holidays Toggle */}
              <div className="bg-[var(--color-surface-1)] p-5 rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    Skip public holidays
                    <span className="bg-[var(--color-surface-2)] px-2 py-0.5 rounded text-[10px] text-[var(--color-text-muted)] uppercase">Smart</span>
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">Automatically pause on official NG holidays</p>
                </div>
                <button 
                  onClick={() => updateDraft({ skipHolidays: !draftSchedule.skipHolidays })}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${draftSchedule.skipHolidays ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)]'}`}
                >
                  <motion.div animate={{ x: draftSchedule.skipHolidays ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

            </motion.div>
          )}

          {/* STEP 3: PREFERENCES & CONFLICTS */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Smart Preferences</h2>
                <p className="text-[var(--color-text-secondary)] text-sm">Fine-tune how we manage this schedule.</p>
              </div>

              {/* Conflict Warning */}
              {draftSchedule.hasConflict && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-[var(--radius-md)] flex items-start gap-3">
                  <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-500 mb-1">Time Conflict Detected</h4>
                    <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                      This overlaps with your existing "{draftSchedule.conflictDetails?.name}" schedule. You can still save it, but please review your times.
                    </p>
                  </div>
                </div>
              )}

              {/* Holiday Preview */}
              {draftSchedule.skipHolidays && draftSchedule.upcomingHolidays?.length > 0 && (
                <div className="bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] p-4 rounded-[var(--radius-md)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-[var(--color-primary)]" />
                    <h4 className="text-sm font-bold text-white">Upcoming skipped holidays</h4>
                  </div>
                  <div className="space-y-2">
                    {draftSchedule.upcomingHolidays.slice(0, 2).map((holiday, i) => (
                      <div key={i} className="flex justify-between text-xs font-medium">
                        <span className="text-[var(--color-text-secondary)]">{holiday.name}</span>
                        <span className="text-white">{holiday.date}</span>
                      </div>
                    ))}
                    {draftSchedule.upcomingHolidays.length > 2 && (
                      <div className="text-xs text-[var(--color-primary)] font-semibold mt-2 pt-2 border-t border-[var(--color-surface-3)]">
                        + {draftSchedule.upcomingHolidays.length - 2} more in next 90 days
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-[var(--color-surface-1)] p-5 rounded-[var(--radius-lg)] border border-[var(--color-surface-3)]">
                <h3 className="text-sm font-bold text-white mb-4">Payment Method</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => updateDraft({ paymentMethod: 'SUBSCRIPTION' })}
                    disabled={!activeSubscription}
                    className={`w-full flex items-center justify-between p-4 rounded-[var(--radius-md)] border-2 transition-all ${
                      draftSchedule.paymentMethod === 'SUBSCRIPTION' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)]'
                    } ${!activeSubscription ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        Subscription Credit
                        {activeSubscription && <span className="text-[10px] bg-[var(--color-success)]/20 text-[var(--color-success)] px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>}
                      </div>
                      <div className="text-xs font-medium text-[var(--color-text-secondary)]">
                        {activeSubscription ? `${activeSubscription.kmRemaining.toFixed(1)} km remaining` : 'No active plan'}
                      </div>
                    </div>
                    {draftSchedule.paymentMethod === 'SUBSCRIPTION' && <CheckCircle2 size={20} className="text-[var(--color-primary)]" />}
                  </button>

                  <button 
                    onClick={() => updateDraft({ paymentMethod: 'WALLET' })}
                    className={`w-full flex items-center justify-between p-4 rounded-[var(--radius-md)] border-2 transition-all ${
                      draftSchedule.paymentMethod === 'WALLET' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)]'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold text-white mb-1">Wallet Balance</div>
                      <div className="text-xs font-medium text-[var(--color-text-secondary)]">₦1,500 available</div>
                    </div>
                    {draftSchedule.paymentMethod === 'WALLET' && <CheckCircle2 size={20} className="text-[var(--color-primary)]" />}
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Review & Activate</h2>
                <p className="text-[var(--color-text-secondary)] text-sm">Please verify your commute details.</p>
              </div>

              {/* Summary Card */}
              <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-5 border border-[var(--color-primary)]/30 relative shadow-[var(--shadow-glow)]">
                
                <h3 className="text-lg font-display font-bold text-white mb-4 pr-10">{draftSchedule.name || 'My Commute'}</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Pickup</p>
                      <p className="text-sm font-semibold text-white">{draftSchedule.pickup?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Destination</p>
                      <p className="text-sm font-semibold text-white">{draftSchedule.destination?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Time</p>
                      <p className="text-sm font-semibold text-white">
                        {draftSchedule.time} • {draftSchedule.daysOfWeek.length} days/week
                        {draftSchedule.hasReturn && ` (Return: ${draftSchedule.returnTime})`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-surface-3)] grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Est. Distance</p>
                    <p className="text-base font-bold text-white">{draftSchedule.routeDistanceKm} km</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Payment</p>
                    <p className="text-base font-bold text-[var(--color-primary)] capitalize">{draftSchedule.paymentMethod?.toLowerCase()}</p>
                  </div>
                </div>
              </div>

              {/* Explanation of mechanics */}
              <div className="bg-[var(--color-surface-2)] p-4 rounded-[var(--radius-md)] space-y-3">
                <p className="text-xs font-medium text-[var(--color-text-secondary)] leading-relaxed">
                  We'll start looking for a driver 15 minutes before your scheduled time. You'll receive a notification when your ride is booked.
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Cancel any individual trip freely</p>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Fixed Bottom Actions ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[var(--color-bg)] border-t border-[var(--color-surface-3)] z-50 flex gap-3">
        {step === 4 ? (
          <button
            onClick={submitSchedule}
            disabled={isSubmitting}
            className="flex-1 h-14 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-[var(--radius-xl)] font-bold text-lg active:scale-95 transition-transform shadow-[var(--shadow-glow)]"
          >
            {isSubmitting ? 'Activating...' : 'Activate Schedule'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && (!draftSchedule.pickup?.address || !draftSchedule.destination?.address)) ||
              (step === 2 && (draftSchedule.daysOfWeek.length === 0 || !draftSchedule.time)) ||
              (step === 3 && !draftSchedule.paymentMethod)
            }
            className="flex-1 h-14 bg-white text-[var(--color-bg)] rounded-[var(--radius-xl)] font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            Next Step
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
