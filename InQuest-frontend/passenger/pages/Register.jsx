import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { useStore } from '../store';

const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function Register() {
  const navigate  = useNavigate();
  const login     = useStore((state) => state.login);
  const [tab, setTab] = useState('register'); // 'register' | 'login'
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '', referral_code: ''
  });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    if (tab === 'register') {
      if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
      if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    }

    setLoading(true);
    try {
      const endpoint = tab === 'register' ? '/auth/email-register' : '/auth/email-login';
      const payload  = tab === 'register'
        ? { email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, role: 'Passenger', referral_code: form.referral_code || undefined }
        : { email: form.email, password: form.password };

      const res   = await api.post(endpoint, payload);
      const data  = res.data.data;
      const token = data.access_token;
      const user  = data.user;

      localStorage.setItem('accessToken', token);
      login(user);

      if (!user.first_name || !user.last_name) {
        navigate('/profile-setup');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      setError('Google sign-in is not configured yet.'); return;
    }
    sessionStorage.setItem('signup_role', 'Passenger');
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/google/callback`,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: Math.random().toString(36).slice(2),
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="px-6 py-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
      </header>

      <main className="flex-1 px-6 pt-6 pb-12 flex flex-col max-w-md mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Tab switcher */}
          <div className="flex bg-[var(--color-surface-1)] rounded-2xl p-1 mb-8 border border-[var(--color-border-subtle)]">
            {['register', 'login'].map((t) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-[var(--shadow-glow)]' : 'text-[var(--color-text-secondary)]'}`}>
                {t === 'register' ? 'Create Account' : 'Log In'}
              </button>
            ))}
          </div>

          <h1 className="text-3xl font-display font-semibold mb-1 tracking-tight">
            {tab === 'register' ? 'Join Inquest' : 'Welcome back'}
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            {tab === 'register' ? 'Create your passenger account.' : 'Log in to continue your journey.'}
          </p>

          {/* Google */}
          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] py-3 rounded-2xl font-semibold transition-all mb-4">
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
            <span className="text-xs text-[var(--color-text-muted)] font-medium">or with email</span>
            <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleAuth}>
            {tab === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">First Name</label>
                  <input required type="text" value={form.first_name} onChange={set('first_name')} placeholder="John"
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Last Name</label>
                  <input required type="text" value={form.last_name} onChange={set('last_name')} placeholder="Doe"
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Email Address</label>
              <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">Password</label>
                {tab === 'login' && <button type="button" className="text-xs text-[var(--color-primary)] hover:underline">Forgot password?</button>}
              </div>
              <div className="relative">
                <input required type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder={tab === 'register' ? 'Min. 8 characters' : 'Enter your password'}
                  className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-3 pr-12 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input required type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={set('confirm_password')} placeholder="Re-enter password"
                      className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-3 pr-12 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                    Referral Code <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
                  </label>
                  <input type="text" value={form.referral_code} onChange={set('referral_code')} placeholder="e.g. ABC123"
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all uppercase tracking-widest" />
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-base shadow-[var(--shadow-glow)] disabled:opacity-50 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : tab === 'register' ? 'Create Account' : 'Log In'
              }
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
