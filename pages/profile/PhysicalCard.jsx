import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle , ChevronLeft} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PhysicalCard() {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address || !city || !state) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Request Physical Card</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-[var(--color-surface-1)] p-6 rounded-3xl border border-[var(--color-border-subtle)] text-center shadow-sm">
                <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-[var(--color-primary)]" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Where should we send your new Inquest Physical Card? Delivery takes 3-5 business days.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., 123 Main St, Apt 4B"
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Ikeja"
                      className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g., Lagos"
                      className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!address || !city || !state}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
                  >
                    Confirm Delivery Address
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-[60vh] text-center"
            >
              <div className="w-24 h-24 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mb-6">
                <CheckCircle size={48} className="text-[var(--color-success)]" />
              </div>
              <h2 className="text-2xl font-display font-semibold mb-2">Card Requested</h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-xs">
                Your physical card is being processed and will be delivered to {address}, {city} within 3-5 business days.
              </p>
              <button
                onClick={() => navigate('/profile/card')}
                className="w-full max-w-xs bg-[var(--color-surface-2)] text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-3)] transition-colors active:scale-[0.98]"
              >
                Back to My Card
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

