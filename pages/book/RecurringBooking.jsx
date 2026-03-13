import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Clock, ArrowRight, CheckCircle2, Plus, CreditCard } from 'lucide-react';
import { useStore } from '../../store';

export default function RecurringBooking() {
  const navigate = useNavigate();
  const { paymentMethods, updateBooking, setToastMessage } = useStore();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [frequency, setFrequency] = useState('daily'); // 'daily', 'mon-fri', 'weekend'
  const [time, setTime] = useState('08:00');

  const handleSchedule = () => {
    if (!pickup || !dropoff) {
      setToastMessage('Please enter pickup and dropoff locations');
      return;
    }

    // In a real app, this would create a subscription entry
    setToastMessage('Subscription scheduled successfully!');
    navigate('/home');
  };

  const frequencies = [
    { id: 'daily', label: 'Daily', desc: 'Every day of the week' },
    { id: 'mon-fri', label: 'Mon - Fri', desc: 'Working days only' },
    { id: 'weekend', label: 'Weekends', desc: 'Saturday & Sunday' }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-display font-semibold">Schedule Recurring Ride</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {/* Route Section */}
        <section className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Pickup Location</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-success)]">
                <MapPin size={18} />
              </span>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Where should we pick you up?"
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-[var(--color-surface-2)] p-2 rounded-full border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
              <ArrowRight size={16} className="rotate-90" />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Dropoff Location</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-error)]">
                <MapPin size={18} />
              </span>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Where is your destination?"
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] transition-all shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Frequency Section */}
        <section>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-4">Frequency</label>
          <div className="space-y-3">
            {frequencies.map((f) => (
              <button
                key={f.id}
                onClick={() => setFrequency(f.id)}
                className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${frequency === f.id
                  ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-sm'
                  : 'bg-[var(--color-surface-1)] border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-2)]'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${frequency === f.id ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'
                    }`}>
                    <Calendar size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{f.label}</h3>
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{f.desc}</p>
                  </div>
                </div>
                {frequency === f.id && (
                  <CheckCircle2 size={20} className="text-[var(--color-primary)]" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Time Selection */}
        <section>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">Preferred Time</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]">
              <Clock size={20} />
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-6 py-4 text-[var(--color-text-primary)] font-display font-bold text-xl focus:border-[var(--color-primary)] transition-all shadow-sm appearance-none"
            />
          </div>
          <p className="mt-2 text-[10px] text-[var(--color-text-muted)] text-center italic">
            Your ride will be automatically requested 10 minutes before this time.
          </p>
        </section>

        {/* Payment Method Section */}
        <section>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">Payment Method</label>
          {paymentMethods.length > 0 ? (
            <button
              onClick={() => navigate('/profile/payments')}
              className="w-full p-5 rounded-3xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] flex items-center justify-between hover:bg-[var(--color-surface-2)] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-black transition-colors">
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">
                    {paymentMethods.find(m => m.isDefault)?.brand} •••• {paymentMethods.find(m => m.isDefault)?.last4}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wider">Default Payment Method</p>
                </div>
              </div>
              <div className="p-2 text-[var(--color-text-muted)]">
                <ArrowRight size={20} className="opacity-50" />
              </div>
            </button>
          ) : (
            <button
              onClick={() => setAddPaymentSheetOpen(true)}
              className="w-full p-6 rounded-[32px] border-2 border-dashed border-[var(--color-border)] flex flex-col items-center gap-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-primary)]/50 transition-all group"
            >
              <Plus size={24} />
              <span className="font-bold text-xs uppercase tracking-widest">Add Payment Method</span>
            </button>
          )}
        </section>
      </main>

      <div className="p-6 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] sticky bottom-0 z-10">
        <button
          onClick={handleSchedule}
          disabled={!pickup || !dropoff}
          className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-bold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:brightness-95 transition-all active:scale-[0.98]"
        >
          Confirm Subscription
        </button>
      </div>
    </div>
  );
}
