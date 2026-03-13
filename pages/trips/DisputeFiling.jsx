import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Upload, CheckCircle , ChevronLeft} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisputeFiling() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Driver behavior',
    'Vehicle condition',
    'Payment issue',
    'Route taken',
    'Safety concern',
    'Other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !description) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Report an Issue</h1>
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
              <div className="bg-[var(--color-warning)]/10 p-4 rounded-2xl flex items-start gap-3 border border-[var(--color-warning)]/20">
                <AlertTriangle size={20} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-text-primary)]">
                  We take all reports seriously. Our safety team will review your dispute and contact you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3">What happened?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`p-3 rounded-xl text-sm font-medium border text-left transition-colors ${
                          category === c
                            ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)]'
                            : 'bg-[var(--color-surface-1)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Provide details
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl p-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Attachments (Optional)
                  </label>
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-[var(--color-border)] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <Upload size={24} />
                    <span className="text-sm font-medium">Upload photos or screenshots</span>
                    <span className="text-xs text-[var(--color-text-muted)]">Max 5MB per file</span>
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!category || !description}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
                  >
                    Submit Report
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
              <h2 className="text-2xl font-display font-semibold mb-2">Report Submitted</h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-xs">
                We've received your report for trip {tripId}. Our team will review it and contact you shortly.
              </p>
              <button
                onClick={() => navigate('/trips')}
                className="w-full max-w-xs bg-[var(--color-surface-2)] text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-3)] transition-colors active:scale-[0.98]"
              >
                Back to Trips
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

