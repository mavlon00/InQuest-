import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock } from 'lucide-react';
import useRecurringStore from '../../store/recurringStore';

export default function RecurringBookingEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { schedules, draftSchedule, setEditMode, updateDraft, updateSchedule, resetDraft } = useRecurringStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      setEditMode(id);
    }
    return () => resetDraft();
  }, [id, setEditMode, resetDraft]);

  const schedule = schedules.find(s => s.id === id);

  if (!schedule || !draftSchedule.id) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#7FFF00] rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateSchedule(id, {
        name: draftSchedule.name,
        daysOfWeek: draftSchedule.daysOfWeek,
        time: draftSchedule.time,
        returnTime: draftSchedule.returnTime,
        paymentMethod: draftSchedule.paymentMethod,
      });
      navigate(`/book/recurring/${id}`, { replace: true });
    } catch (e) {
      alert("Failed to update schedule");
      setIsSubmitting(false);
    }
  };

  const hasChanges = 
    schedule.name !== draftSchedule.name ||
    schedule.time !== draftSchedule.time ||
    JSON.stringify(schedule.daysOfWeek) !== JSON.stringify(draftSchedule.daysOfWeek) ||
    schedule.paymentMethod !== draftSchedule.paymentMethod ||
    (schedule.hasReturn && schedule.returnTime !== draftSchedule.returnTime);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body pb-32">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-3)] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold ml-2">Edit Schedule</h1>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-8 animate-fade-in relative">

        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Schedule Name</label>
          <input 
            type="text" 
            value={draftSchedule.name || ''}
            onChange={(e) => updateDraft({ name: e.target.value })}
            className="w-full h-14 bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] px-4 text-white font-semibold focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>

        {/* Read-only Route Info */}
        <div className="bg-[var(--color-surface-0)] rounded-[var(--radius-lg)] p-4 border border-[var(--color-surface-3)] space-y-4 opacity-80">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Route (Cannot be changed)</p>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-white">{schedule.pickup?.address}</p>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-white">{schedule.destination?.address}</p>
          </div>
        </div>

        {/* Edit explicitly: Days of Week */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex justify-between items-center">
            Repeats on
            <span className="text-[10px] text-[var(--color-warning)]">{draftSchedule.daysOfWeek.length === 0 && 'Select at least one day'}</span>
          </h3>
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
        </div>

        {/* Edit Time */}
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

          {schedule.hasReturn && (
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

        {/* Payment Selection */}
        <div className="space-y-3">
           <h3 className="text-sm font-bold text-white mb-2">Payment Method</h3>
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => updateDraft({ paymentMethod: 'SUBSCRIPTION' })}
                className={`p-4 rounded-[var(--radius-md)] border-2 transition-all ${draftSchedule.paymentMethod === 'SUBSCRIPTION' ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] border-[var(--color-surface-3)] text-[var(--color-text-secondary)]'}`}
              >
                <div className="font-bold text-sm">Subscription</div>
              </button>
              <button 
                onClick={() => updateDraft({ paymentMethod: 'WALLET' })}
                className={`p-4 rounded-[var(--radius-md)] border-2 transition-all ${draftSchedule.paymentMethod === 'WALLET' ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] border-[var(--color-surface-3)] text-[var(--color-text-secondary)]'}`}
              >
                <div className="font-bold text-sm">Wallet</div>
              </button>
           </div>
        </div>

      </div>

      {/* ── Fixed Bottom Actions ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[var(--color-bg)] border-t border-[var(--color-surface-3)] z-50">
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSubmitting || draftSchedule.daysOfWeek.length === 0}
          className="w-full h-14 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-[var(--radius-xl)] font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-[var(--shadow-glow)]"
        >
          {isSubmitting ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes Made'}
        </button>
      </div>

    </div>
  );
}
