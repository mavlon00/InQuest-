import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function Trips() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const response = await api.get('/rides/history');
        if (response.data.status === 'success') {
          const raw = response.data.data?.rides || [];
          const mapped = raw.map(r => ({
            id: r.id,
            status: r.status === 'COMPLETED' ? 'Completed'
                  : r.status === 'CANCELLED' ? 'Cancelled'
                  : r.status,
            date: r.created_at
              ? new Date(r.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
              : '—',
            pickup: r.pickup_address || `${r.pickup_latitude?.toFixed(4)}, ${r.pickup_longitude?.toFixed(4)}` || '—',
            dropoff: r.destination_address || `${r.destination_latitude?.toFixed(4)}, ${r.destination_longitude?.toFixed(4)}` || '—',
            fare: r.actual_fare != null ? `₦${r.actual_fare.toLocaleString()}` : `₦${r.estimated_fare?.toLocaleString() || '0'}`,
          }));
          setTrips(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch trip history:', err);
        setError('Could not load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

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

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-[var(--color-error)] text-sm">{error}</p>
          </div>
        )}

        {/* Trips List */}
        {!loading && !error && (
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
        )}

        {!loading && !error && filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation size={24} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-[var(--color-text-secondary)] font-semibold">No trips yet</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Your ride history will appear here after your first trip.</p>
          </div>
        )}
      </main>
    </div>
  );
}
