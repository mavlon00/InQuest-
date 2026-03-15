import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Calendar, Edit2, Pause, Play, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useRecurringStore from '../../store/recurringStore';

export default function RecurringBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { schedules, pauseSchedule, resumeSchedule, deleteSchedule, skipInstance, restoreInstance } = useRecurringStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // In a real app we'd fetch if not in state, but mock data covers it
  const schedule = schedules.find(s => s.id === id);

  useEffect(() => {
    if (!schedule && schedules.length > 0) {
      navigate('/book/recurring', { replace: true });
    }
  }, [schedule, schedules.length, navigate]);

  if (!schedule) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#7FFF00] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPaused = schedule.status === 'PAUSED';

  // Format Days helper
  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const formattedDays = schedule.daysOfWeek.map(d => daysMap[d]).join(', ');

  // Mock schedule-specific run history
  const runHistory = [
    { date: "15 Mar", status: "COMPLETED", fare: "₦604" },
    { date: "14 Mar", status: "COMPLETED", fare: "₦604" },
    { date: "13 Mar", status: "SKIPPED", fare: "-" },
  ];

  const handleDelete = async () => {
    try {
      await deleteSchedule(schedule.id);
      navigate('/book/recurring', { replace: true });
    } catch (e) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-body pb-32">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-surface-3)] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/book/recurring')} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold ml-2 truncate max-w-[200px]">{schedule.name || 'Schedule Details'}</h1>
        </div>
        <button 
          onClick={() => navigate(`/book/recurring/${schedule.id}/edit`)}
          className="text-xs font-bold text-[var(--color-primary)] active:text-white transition-colors"
        >
          <Edit2 size={20} />
        </button>
      </div>

      <div className="px-4 pt-6 space-y-6 animate-fade-in relative">
        
        {/* Status Banner */}
        {isPaused ? (
          <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-[var(--radius-sm)] flex items-center gap-3">
            <Pause size={16} className="text-amber-500" />
            <p className="text-xs font-medium text-amber-500/90 flex-1">This schedule is currently paused.</p>
            <button 
              onClick={() => resumeSchedule(schedule.id)}
              className="text-xs font-bold text-[var(--color-primary)]"
            >
              Resume
            </button>
          </div>
        ) : (
          <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 p-3 rounded-[var(--radius-sm)] flex items-start gap-3">
             <AlertCircle size={16} className="text-[var(--color-success)] shrink-0 mt-0.5" />
             <div className="flex-1">
               <p className="text-xs font-bold text-[var(--color-success)] uppercase tracking-wider mb-0.5">Next Ride</p>
               <p className="text-xs font-medium text-[var(--color-success)]/90 leading-tight">
                 Your next ride will be booked automatically on {new Date(schedule.nextTripAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {schedule.time}.
               </p>
             </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-5 border border-[var(--color-surface-3)]">
          
          <div className="space-y-5 mb-5">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Pickup</p>
                <p className="text-sm font-semibold text-white">{schedule.pickup?.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Destination</p>
                <p className="text-sm font-semibold text-white">{schedule.destination?.address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-5 border-t border-[var(--color-surface-3)]">
            <div className="flex items-start gap-2">
               <Calendar size={18} className="text-[var(--color-text-secondary)] shrink-0" />
               <div>
                 <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Days</p>
                 <p className="text-xs font-bold text-white">{formattedDays}</p>
                 {schedule.skipHolidays && <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 flex gap-1 items-center"><span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></span> Skips holidays</p>}
               </div>
            </div>
            <div className="flex items-start gap-2">
               <Clock size={18} className="text-[var(--color-text-secondary)] shrink-0" />
               <div>
                 <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Time</p>
                 <p className="text-xs font-bold text-white">{schedule.time}</p>
                 {schedule.hasReturn && <p className="text-[10px] text-[var(--color-primary)] font-bold mt-0.5">Return: {schedule.returnTime}</p>}
               </div>
            </div>
          </div>

        </div>

        {/* Financials & Preferences */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-surface-3)]">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-[var(--color-surface-3)]">
            <p className="text-sm font-bold text-[var(--color-text-secondary)]">Payment Method</p>
            <p className="text-sm font-bold text-[var(--color-primary)] capitalize">{schedule.paymentMethod?.toLowerCase()}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-[var(--color-text-secondary)]">Estimated Fare per trip</p>
            <p className="text-sm font-bold text-white">
               {schedule.paymentMethod === 'SUBSCRIPTION' ? `${schedule.estimatedFareKm} km` : `₦${schedule.estimatedFare}`}
            </p>
          </div>
        </div>

        {/* Notifications & Automation */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider px-1">App Behaviour</h2>
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] divide-y divide-[var(--color-surface-3)]">
            <div className="p-4 flex justify-between items-center">
               <span className="text-sm font-semibold text-white">Auto-book at {schedule.time}</span>
               <div className="w-10 h-5 rounded-full bg-[var(--color-primary)] flex justify-end p-0.5"><div className="w-4 h-4 rounded-full bg-white"/></div>
            </div>
            <div className="p-4 flex justify-between items-center">
               <span className="text-sm font-semibold text-white">Notify 1 hour before</span>
               <div className="w-10 h-5 rounded-full bg-[var(--color-primary)] flex justify-end p-0.5"><div className="w-4 h-4 rounded-full bg-white"/></div>
            </div>
            <div className="p-4 flex justify-between items-center">
               <span className="text-sm font-semibold text-white">Notify when driver is assigned</span>
               <div className="w-10 h-5 rounded-full bg-[var(--color-primary)] flex justify-end p-0.5"><div className="w-4 h-4 rounded-full bg-white"/></div>
            </div>
          </div>
        </div>

        {/* Run History Preview */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-baseline px-1">
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">Recent Trips</h2>
            <button className="text-[10px] font-bold text-[var(--color-primary)]">View All</button>
          </div>
          
          <div className="space-y-2">
            {runHistory.map((run, i) => (
              <div key={i} className="bg-[var(--color-surface-0)] border border-[var(--color-surface-3)] p-3 rounded-[var(--radius-md)] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white">{run.date}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${run.status === 'COMPLETED' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}>
                    {run.status}
                  </span>
                </div>
                <span className="text-xs font-bold text-[var(--color-text-muted)]">{run.fare}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Fixed Bottom Actions ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-[var(--color-bg)] border-t border-[var(--color-surface-3)] z-50 flex gap-3">
        {showDeleteConfirm ? (
          <div className="w-full flex items-center justify-between p-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-1)] border border-[var(--color-error)]/30">
            <span className="text-sm font-bold text-white pl-2">Delete sure?</span>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-[var(--radius-md)] text-xs font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-2)]">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 rounded-[var(--radius-md)] text-xs font-bold text-white bg-[var(--color-error)]">Delete</button>
            </div>
          </div>
        ) : (
          <>
            <button
               onClick={() => isPaused ? resumeSchedule(schedule.id) : pauseSchedule(schedule.id)}
               className="flex-[0.7] h-14 bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] text-white rounded-[var(--radius-xl)] font-bold text-sm flex items-center justify-center gap-2 active:bg-[var(--color-surface-2)] transition-colors"
             >
               {isPaused ? <Play size={18} /> : <Pause size={18} />}
               {isPaused ? 'Resume' : 'Pause'}
             </button>
            <button
               onClick={() => setShowDeleteConfirm(true)}
               className="flex-[0.3] h-14 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-[var(--radius-xl)] flex items-center justify-center active:bg-[var(--color-error)]/20 transition-colors"
             >
               <Trash2 size={20} />
             </button>
          </>
        )}
      </div>

    </div>
  );
}
