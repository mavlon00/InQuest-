import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Navigation, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Trips() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const trips = [
    { id: 'TRP-123', status: 'Completed', date: 'Oct 24, 2026 • 2:30 PM', pickup: 'Allen Roundabout', dropoff: 'Ikeja City Mall', fare: '₦450' },
    { id: 'TRP-124', status: 'Cancelled', date: 'Oct 22, 2026 • 9:15 AM', pickup: 'Maryland Mall', dropoff: 'Oshodi', fare: '₦0' },
    { id: 'TRP-125', status: 'Completed', date: 'Oct 20, 2026 • 6:45 PM', pickup: 'Lekki Phase 1', dropoff: 'Victoria Island', fare: '₦1,200' },
  ];

  const filteredTrips = filter === 'All' 
    ? trips 
    : trips.filter(t => t.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-xl font-display font-semibold">My Trips</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Completed', 'Cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)]'
                  : 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate(`/trips/${trip.id}`)}
              className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">{trip.date}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  trip.status === 'Completed' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                }`}>
                  {trip.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
                  <div className="w-0.5 h-6 bg-[var(--color-border)]" />
                  <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{trip.pickup}</p>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{trip.dropoff}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
                <span className="font-semibold text-[var(--color-primary)]">{trip.fare}</span>
                <span className="text-xs text-[var(--color-text-secondary)] font-mono">{trip.id}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation size={24} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[var(--color-text-secondary)]">No trips found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

