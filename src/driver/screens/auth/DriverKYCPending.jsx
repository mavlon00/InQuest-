import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import toast from 'react-hot-toast';
import { Clock, RefreshCw, MessageCircle, CheckCircle } from 'lucide-react';

export default function DriverKYCPending() {
  const navigate = useNavigate();
  const { setKycStatus } = useDriverStore();
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleCheckAgain = async () => {
    setChecking(true);
    setChecked(false);
    try {
      // Mock GET /driver/kyc/status
      await new Promise(r => setTimeout(r, 1800));
      // In production this would read the real status from API.
      // For demo, status remains SUBMITTED.
      setChecked(true);
      toast('Your application is still under review.', { icon: '🔍' });
    } catch {
      toast.error('Could not check status. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleContactSupport = () => {
    const msg = encodeURIComponent('Hello Inquest Support, I submitted my KYC and it is still under review. My name is [name]. Driver ID: [drv_001]');
    window.open(`https://wa.me/2349000000000?text=${msg}`, '_blank');
  };

  // DEV helper — simulate approval
  const simulateApproval = () => {
    setKycStatus('APPROVED');
    toast.success('KYC Approved! Welcome aboard.');
    navigate('/home', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">

      {/* Top decoration */}
      <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-to-b from-[var(--color-primary)]/8 to-transparent pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">

        {/* Logo wordmark */}
        <p className="font-display font-bold text-2xl text-[var(--color-primary)] tracking-tighter mb-12">
          IN QUEST
        </p>

        {/* Clock icon */}
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 flex items-center justify-center">
            <Clock size={56} strokeWidth={1.5} className="text-[var(--color-primary)]" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)]/20 animate-ping" />
        </div>

        <h1 className="text-3xl font-display font-semibold mb-4">
          Verification In Progress
        </h1>

        <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-2 max-w-sm">
          Our team is reviewing your documents.
        </p>
        <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-2 max-w-sm">
          This usually takes less than <span className="text-white font-medium">24 hours.</span>
        </p>
        <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-10 max-w-sm">
          You will receive an <span className="text-white font-medium">SMS</span> once approved.
        </p>

        {checked && (
          <div className="w-full max-w-sm bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] p-4 mb-6 flex items-center gap-3">
            <RefreshCw size={18} className="text-[var(--color-text-secondary)] shrink-0" />
            <p className="text-sm text-[var(--color-text-secondary)] text-left">Status unchanged — still under review. We'll notify you by SMS.</p>
          </div>
        )}

        {/* Check Again */}
        <button
          onClick={handleCheckAgain}
          disabled={checking}
          className="w-full max-w-sm h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg mb-4 flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60 shadow-[var(--shadow-glow)]"
        >
          {checking ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Checking…
            </>
          ) : (
            <>
              <RefreshCw size={18} /> Check Again
            </>
          )}
        </button>

        {/* Contact Support */}
        <button
          onClick={handleContactSupport}
          className="w-full max-w-sm h-12 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-[var(--color-text-secondary)] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
        >
          <MessageCircle size={18} /> Contact Support
        </button>
      </div>

      {/* DEV panel */}
      <div className="p-6 border-t border-[var(--color-surface-3)] pb-safe">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center mb-3 uppercase tracking-wider">Dev Tools</p>
        <button
          onClick={simulateApproval}
          className="w-full h-10 rounded-[var(--radius-pill)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-sm font-semibold flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} /> Simulate KYC Approved
        </button>
      </div>
    </div>
  );
}
