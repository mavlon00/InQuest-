import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDriverStore } from '../../app/driverStore';
import api from '../../utils/api';

export default function DriverOTPVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '+2348000000000';
  const setAccessToken = useDriverStore(state => state.setAccessToken);
  const setDriver = useDriverStore(state => state.setDriver);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setIsError(false);
    if (value && index < 5) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === 5 && newOtp.every(v => v !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const verifyOtp = async (code) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        phone_number: phone,
        otp: code,
        role: 'Driver'
      });
      
      const token = response.data.data?.access_token || response.data?.access_token;
      localStorage.setItem("accessToken", token);
      setAccessToken(token);

      const user = response.data.data?.user || response.data?.user;
      
      // Use real user data from API
      setDriver({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone_number,
        photoUrl: user.photo_url,
        email: user.email,
        kycStatus: user.kyc_status || 'NOT_STARTED',
        role: user.role,
        isVerified: user.is_verified,
        vehicle: user.vehicle || null
      });

      toast.success('Identity Verified');
      // Navigate based on whether profile is complete
      if (!user.first_name) {
         navigate('/setup/profile');
      } else {
         navigate('/home');
      }
    } catch (err) {
      setIsError(true);
      toast.error('Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      await api.post('/auth/register', { phone_number: phone });
      setTimeLeft(60); 
      toast.success('New code sent');
    } catch (err) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-primary)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <header className="px-6 pt-safe pt-6 pb-2 sticky top-0 bg-[var(--color-bg)]/80 backdrop-blur-md z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-surface-3)] active:bg-[var(--color-surface-3)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </header>
      
      <div className="flex-1 px-6 pt-8 pb-32">
        <div className="mb-10">
          <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center mb-6">
            <Mail size={24} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl font-display font-bold leading-tight mb-3">
            Verify <span className="text-[var(--color-primary)]">Identity</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base font-medium">
            Enter the 6-digit code sent to <span className="text-white font-bold">{phone.slice(0, 4)}***{phone.slice(-4)}</span>
          </p>
        </div>
        
        {/* OTP Inputs */}
        <div className={`flex justify-between gap-2 mb-10 ${isError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="tel"
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setActiveIndex(index)}
              className={`
                w-full h-16 text-center text-2xl font-display font-bold rounded-[var(--radius-md)] bg-[var(--color-surface-1)] border transition-all duration-300
                ${activeIndex === index ? 'border-[var(--color-primary)] shadow-[0_0_15px_rgba(127,255,0,0.1)] bg-[var(--color-surface-2)]' : 'border-[var(--color-surface-3)]'}
                ${isError ? 'border-[var(--color-error)] text-[var(--color-error)] shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'text-white'}
              `}
            />
          ))}
        </div>
        
        <div className="flex flex-col items-center gap-6">
          {timeLeft > 0 ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Resend in</span>
              <span className="text-sm font-display font-bold text-white tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <button 
              onClick={resendOtp}
              className="flex items-center gap-2 text-[var(--color-primary)] font-bold hover:underline underline-offset-4"
            >
              <RotateCcw size={16} />
              Resend Code
            </button>
          )}
          
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm font-medium">
            <ShieldCheck size={14} className="text-[var(--color-success)]" />
            Secure Verification
          </div>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-display font-bold tracking-widest animate-pulse">VERIFYING...</p>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
      `}</style>
    </div>
  );
}
