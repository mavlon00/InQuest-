import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, CheckCircle, Briefcase , ChevronLeft} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CorporateAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !company) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Corporate Account</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
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
                  <Briefcase size={32} className="text-[var(--color-primary)]" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Inquest for Business</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Link your account to your company to easily expense rides and manage corporate travel.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      <Building2 size={20} />
                    </span>
                    <input
                      type="text"
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Acme Corp"
                      className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      <Mail size={20} />
                    </span>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., jane@acme.com"
                      className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!email || !company}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
                  >
                    Link Account
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
              <h2 className="text-2xl font-display font-semibold mb-2">Verification Sent</h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-xs">
                We've sent a verification link to {email}. Please check your inbox to complete the setup.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="w-full max-w-xs bg-[var(--color-surface-2)] text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-3)] transition-colors active:scale-[0.98]"
              >
                Back to Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

