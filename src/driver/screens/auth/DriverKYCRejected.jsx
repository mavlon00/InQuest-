import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import toast from 'react-hot-toast';
import { XCircle, RotateCcw, MessageCircle } from 'lucide-react';

export default function DriverKYCRejected() {
  const navigate = useNavigate();
  const { kycRejectionReason, setKycStatus } = useDriverStore();
  const [loading, setLoading] = useState(false);

  const reason = kycRejectionReason
    || 'Your selfie did not clearly show your face and ID together. Please retake the photo in good lighting, ensuring both your face and the front of your ID are fully visible.';

  const handleResubmit = () => {
    setKycStatus('NOT_STARTED');
    navigate('/kyc', { replace: true });
  };

  const handleContactSupport = () => {
    const msg = encodeURIComponent('Hello Inquest Support, my KYC was rejected. I need help understanding the reason. Driver ID: [drv_001]');
    window.open(`https://wa.me/2349000000000?text=${msg}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">

      {/* Top red glow */}
      <div className="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-[var(--color-error)]/8 to-transparent pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">

        {/* Logo */}
        <p className="font-display font-bold text-2xl text-[var(--color-primary)] tracking-tighter mb-12">
          IN QUEST
        </p>

        {/* X Icon */}
        <div className="w-28 h-28 rounded-full bg-[var(--color-error)]/10 border-2 border-[var(--color-error)]/30 flex items-center justify-center mb-8">
          <XCircle size={56} strokeWidth={1.5} className="text-[var(--color-error)]" />
        </div>

        <h1 className="text-3xl font-display font-semibold mb-3 text-[var(--color-error)]">
          Verification Failed
        </h1>

        <p className="text-[var(--color-text-secondary)] text-sm mb-6 max-w-xs">
          Our team reviewed your submission and could not verify your identity. Please review the reason below and resubmit.
        </p>

        {/* Rejection reason card */}
        <div className="w-full max-w-sm bg-[var(--color-error)]/8 border border-[var(--color-error)]/25 rounded-[var(--radius-lg)] p-5 mb-10 text-left">
          <p className="text-xs font-semibold text-[var(--color-error)] uppercase tracking-wider mb-2">Rejection Reason</p>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{reason}</p>
        </div>

        {/* Resubmit CTA */}
        <button
          onClick={handleResubmit}
          className="w-full max-w-sm h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg mb-4 flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[var(--shadow-glow)]"
        >
          <RotateCcw size={18} /> Resubmit KYC
        </button>

        {/* Contact link */}
        <button
          onClick={handleContactSupport}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-white font-medium transition-colors"
        >
          <MessageCircle size={16} /> Contact Support
        </button>
      </div>

      <div className="p-6 pb-safe">
        <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">
          Repeated rejections may result in your account being suspended. Ensure all documents are clear and valid before resubmitting.
        </p>
      </div>
    </div>
  );
}
