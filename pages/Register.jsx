import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Register() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) setPhone(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      navigate('/verify-otp', { state: { phone } });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="px-6 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      </header>

      <main className="flex-1 px-6 pt-8 pb-12 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          <h1 className="text-3xl font-display font-semibold mb-2 tracking-tight">
            Enter your phone number
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-10 text-base">
            We'll send you a code to verify your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
                <svg className="w-6 h-4 rounded-sm" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="400" fill="#008751"/>
                  <rect x="200" width="200" height="400" fill="#ffffff"/>
                  <rect x="400" width="200" height="400" fill="#008751"/>
                </svg>
                <span>+234</span>
                <div className="w-px h-5 bg-[var(--color-border)] ml-2" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="800 000 0000"
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl py-4 pl-28 pr-4 text-lg font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={phone.length !== 10}
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
            >
              Send OTP
            </button>
          </form>
        </motion.div>

        <div className="text-center mt-auto pt-8 border-t border-[var(--color-border-subtle)]">
          <p className="text-[var(--color-text-secondary)] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

