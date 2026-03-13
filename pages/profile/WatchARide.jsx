import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShieldCheck , ChevronLeft} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WatchARide() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleWatch = (e) => {
    e.preventDefault();
    if (!code) return;
    // Mock navigation to tracking
    navigate(`/tracking/${code}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Watch a Ride</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <div className="bg-[var(--color-surface-1)] p-6 rounded-3xl border border-[var(--color-border-subtle)] text-center shadow-sm">
          <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Track a Loved One</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Enter the unique tracking code shared by the passenger to view their live location and trip details.
          </p>
        </div>

        <form onSubmit={handleWatch} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Tracking Code
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <Search size={20} />
              </span>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g., INQ-123-ABC"
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-lg font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow uppercase"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!code}
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
            >
              Start Tracking
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

