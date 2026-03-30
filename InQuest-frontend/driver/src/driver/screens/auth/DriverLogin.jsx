import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, ChevronRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useDriverStore } from '../../app/driverStore';

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

export default function DriverLogin() {
  const navigate = useNavigate();
  const login    = useDriverStore((state) => state.login);
  const [tab, setTab]         = useState('login');   // 'login' | 'register'
  const [form, setForm]       = useState({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [showC, setShowC]     = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
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
        ? { email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, role: 'Driver' }
        : { email: form.email, password: form.password };

      const res  = await api.post(endpoint, payload);
      const data = res.data.data;
      login(data);

      const user = data.user;
      if (!user.first_name || !user.last_name) {
        navigate('/setup/profile');
      } else {
        // existing driver — route by KYC status
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
      toast.error('Google sign-in is not configured yet.'); return;
    }
    sessionStorage.setItem('signup_role', 'Driver');
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
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] px-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-primary)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="pt-14 pb-8 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
          <ShieldCheck size={28} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="text-3xl font-display font-bold text-center">Inquest Driver</h1>
        <p className="text-[var(--color-text-secondary)] text-center mt-1">
          {tab === 'login' ? 'Welcome back. Log in to continue.' : 'Create your driver account.'}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-[var(--color-surface-1)] rounded-2xl p-1 mb-8 border border-[var(--color-surface-3)]">
        {['login','register'].map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-glow)]' : 'text-[var(--color-text-secondary)]'}`}>
            {t === 'login' ? 'Log In' : 'Register'}
          </button>
        ))}
      </div>

      {/* Google */}
      <button onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-[var(--color-text-primary)] py-3.5 rounded-[var(--radius-lg)] font-semibold transition-all mb-5">
        <GoogleIcon /> Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-[var(--color-surface-3)]" />
        <span className="text-xs text-[var(--color-text-muted)] font-medium">or with email</span>
        <div className="flex-1 h-px bg-[var(--color-surface-3)]" />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form className="space-y-4 flex-1" onSubmit={handleSubmit}>
        {tab === 'register' && (
          <div className="grid grid-cols-2 gap-3">
            {['first_name','last_name'].map(k => (
              <div key={k}>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">
                  {k === 'first_name' ? 'First Name' : 'Last Name'}
                </label>
                <input required type="text" value={form[k]} onChange={set(k)}
                  placeholder={k === 'first_name' ? 'John' : 'Doe'}
                  className="w-full bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-lg)] px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">Email Address</label>
          <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
            className="w-full bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-lg)] px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">Password</label>
          <div className="relative">
            <input required type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder={tab === 'register' ? 'Min. 8 characters' : 'Enter your password'}
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-lg)] px-4 py-3 pr-12 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>

        {tab === 'register' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-1.5">Confirm Password</label>
            <div className="relative">
              <input required type={showC ? 'text' : 'password'} value={form.confirm_password} onChange={set('confirm_password')} placeholder="Re-enter password"
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-lg)] px-4 py-3 pr-12 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
              <button type="button" onClick={() => setShowC(!showC)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                {showC ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>
        )}

        <div className="pb-8 pt-2">
          <button type="submit" disabled={loading}
            className={`w-full h-16 rounded-[var(--radius-pill)] font-display font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
              ${!loading ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-glow)] active:scale-[0.98]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'}`}>
            {loading
              ? <><Loader2 size={20} className="animate-spin" /> <span className="animate-pulse">PLEASE WAIT...</span></>
              : <>{tab === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'} <ChevronRight size={18}/></>
            }
          </button>
          <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-3 px-8 leading-relaxed">
            By continuing, you agree to Inquest's Terms of Service and Privacy Policy.
          </p>
        </div>
      </form>
    </div>
  );
}
