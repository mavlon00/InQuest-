import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverPhoneEntry() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const isValid = phone.length === 10 && /^\d+$/.test(phone);

  const handleSendOTP = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      // POST /api/v1/auth/driver/login
      await new Promise(resolve => setTimeout(resolve, 1200));
      navigate('/verify-otp', { state: { phone: `+234${phone}` } });
    } catch (err) {
      toast.error('Connection failed. Please check your network.');
    } finally {
      setIsLoading(false);
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
            <Phone size={24} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl font-display font-bold leading-tight mb-3">
            What's your <span className="text-[var(--color-primary)]">Number?</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-base font-medium">
            Enter your registered phone number to sign in or start your application.
          </p>
        </div>
        
        {/* Input Group */}
        <div className="space-y-6">
          <div 
            onClick={() => inputRef.current?.focus()}
            className={`
              relative flex items-center h-20 px-6 rounded-[var(--radius-lg)] bg-[var(--color-surface-1)] border transition-all duration-300 cursor-text
              ${isFocused ? 'border-[var(--color-primary)] shadow-[0_0_25px_rgba(127,255,0,0.15)] bg-[var(--color-surface-2)]' : 'border-[var(--color-surface-3)]'}
            `}
          >
            <div className="flex flex-col w-full">
              <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isFocused ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                Phone Number
              </span>
              <div className="flex items-center mt-1">
                <span className="text-xl font-display font-semibold text-[var(--color-text-secondary)] mr-2 tracking-wide">+234</span>
                <input 
                  ref={inputRef}
                  type="tel" 
                  value={phone}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                  }}
                  placeholder="809 000 0000"
                  className="flex-1 bg-transparent border-none outline-none text-2xl font-display font-bold text-white placeholder-[var(--color-text-muted)]/30 tracking-widest"
                />
              </div>
            </div>
            {isValid && (
              <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                <ShieldCheck size={14} className="text-[var(--color-success)]" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 pt-4">
            <p className="text-[var(--color-text-muted)] text-sm font-medium">
              Don't have an account yet? 
              <button 
                onClick={() => navigate('/setup/profile')} 
                className="ml-1 text-[var(--color-primary)] font-bold hover:underline underline-offset-4"
              >
                Become a Driver
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-all-safe bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent pt-8">
        <button 
          onClick={handleSendOTP}
          disabled={!isValid || isLoading}
          className={`
            relative w-full h-16 rounded-[var(--radius-pill)] font-display font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
            ${isValid && !isLoading 
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-glow)] active:scale-[0.98]' 
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'}
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-[var(--color-on-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="animate-pulse">SENDING OTP...</span>
            </div>
          ) : (
            <>
              CONTINUE
              <ChevronRight size={18} />
            </>
          )}
        </button>
        <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-3 px-8 leading-relaxed">
          By continuing, you agree to receive an SMS for verification. Carrier rates may apply.
        </p>
      </div>

    </div>
  );
}
