import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2, Car } from 'lucide-react';
import api from '../utils/api';

const DRIVER_URL = import.meta.env.VITE_DRIVER_APP_URL || 'http://localhost:5175';
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

export default function SignUpDriver() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: ''
  });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const redirectUser = (data) => {
    const { access_token, user } = data;
    // New drivers always go to setup/profile to start their onboarding
    const path = user.is_new_user ? '/setup/profile' : '/home';
    window.location.href = `${DRIVER_URL}${path}?token=${encodeURIComponent(access_token)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/email-register', {
        email:      form.email,
        password:   form.password,
        first_name: form.first_name,
        last_name:  form.last_name,
        role:       'Driver',
      });
      redirectUser(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      setError('Google sign-in is not configured yet.'); return;
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
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-surface-1">
      <div className="w-full max-w-md bg-surface-0 rounded-3xl border border-surface-2 shadow-2xl p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Car className="w-7 h-7 text-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-text-primary text-center mb-1">Apply to Drive</h2>
        <p className="text-text-secondary text-center mb-8">Create your driver account to get started</p>

        {/* Requirements Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-6 text-sm text-text-secondary">
          <span className="font-semibold text-primary">Requirements:</span> Valid driver's license, LASDRI cert (Lagos), clean record, 3+ years experience, guarantor verification.
        </div>

        {/* Google */}
        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 bg-surface-1 hover:bg-surface-2 border border-surface-2 text-text-primary py-3 rounded-xl font-semibold transition-all mb-4">
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-surface-2" />
          <span className="text-xs text-text-secondary font-medium">or register with email</span>
          <div className="flex-1 h-px bg-surface-2" />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">First Name</label>
              <input required type="text" value={form.first_name} onChange={set('first_name')} placeholder="John"
                className="w-full bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Last Name</label>
              <input required type="text" value={form.last_name} onChange={set('last_name')} placeholder="Doe"
                className="w-full bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
            <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
              className="w-full bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
            <div className="relative">
              <input required type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 characters"
                className="w-full bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 pr-12 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
            <div className="relative">
              <input required type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={set('confirm_password')} placeholder="Re-enter password"
                className="w-full bg-surface-1 border border-surface-2 rounded-xl px-4 py-3 pr-12 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-dim text-on-primary py-4 rounded-xl font-bold transition-all shadow-[0_4px_14px_rgba(127,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(127,255,0,0.3)] flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Start Application <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-2 text-center">
          <p className="text-text-secondary text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
          </p>
          <p className="text-text-secondary text-sm mt-2">
            Want to ride instead?{' '}
            <Link to="/signup/passenger" className="text-primary font-bold hover:underline">Sign up as passenger</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
