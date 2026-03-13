import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isError, setIsError] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';

  useEffect(() => {
    if (!phone) navigate('/register');
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [phone, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setIsError(false);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code === '123456') {
      navigate('/profile-setup');
    } else {
      setIsError(true);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

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
            Verify your number
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-10 text-base">
            Enter the 6-digit code sent to +234 {phone.slice(0, 3)} {phone.slice(3, 6)} {phone.slice(6)}
          </p>

          <motion.div
            animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-between gap-2 mb-8"
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-2xl font-semibold rounded-xl bg-[var(--color-surface-1)] border ${isError ? 'border-[var(--color-error)] text-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]' : 'border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]'} focus:ring-1 transition-all`}
                autoFocus={index === 0}
              />
            ))}
          </motion.div>

          <div className="flex items-center justify-between mb-10 text-sm font-medium">
            <span className="text-[var(--color-text-secondary)]">
              {timer > 0 ? `Resend code in 00:${timer.toString().padStart(2, '0')}` : 'Didn\'t receive the code?'}
            </span>
            <button
              disabled={timer > 0}
              onClick={() => setTimer(60)}
              className={`font-semibold ${timer > 0 ? 'text-[var(--color-text-muted)] cursor-not-allowed' : 'text-[var(--color-primary)] hover:underline'}`}
            >
              Resend
            </button>
          </div>

          <button
            onClick={handleVerify}
            disabled={!isComplete}
            className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
          >
            Verify
          </button>
        </motion.div>
      </main>
    </div>
  );
}

