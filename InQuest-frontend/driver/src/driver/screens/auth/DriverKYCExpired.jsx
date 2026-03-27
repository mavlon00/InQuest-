import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import { AlertTriangle, RotateCcw, MessageCircle } from 'lucide-react';

const EXPIRED_DOCS = [
  { name: "Driver's Licence", expiredOn: 'December 2025' },
  { name: 'Vehicle Licence',  expiredOn: 'January 2026'  },
];

export default function DriverKYCExpired() {
  const navigate = useNavigate();
  const { setKycStatus } = useDriverStore();

  const handleRenew = () => {
    // Reset KYC so the driver goes through the full flow again
    setKycStatus('NOT_STARTED');
    navigate('/kyc', { replace: true });
  };

  const handleContactSupport = () => {
    const msg = encodeURIComponent('Hello Inquest Support, my KYC documents have expired and I need help renewing them. Driver ID: [drv_001]');
    window.open(`https://wa.me/2349000000000?text=${msg}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">

      {/* Warning glow */}
      <div className="absolute top-0 left-0 right-0 h-60 bg-gradient-to-b from-[var(--color-warning)]/8 to-transparent pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative">

        {/* Logo */}
        <p className="font-display font-bold text-2xl text-[var(--color-primary)] tracking-tighter mb-12">
          IN QUEST
        </p>

        {/* Warning icon */}
        <div className="w-28 h-28 rounded-full bg-[var(--color-warning)]/10 border-2 border-[var(--color-warning)]/30 flex items-center justify-center mb-8">
          <AlertTriangle size={56} strokeWidth={1.5} className="text-[var(--color-warning)]" />
        </div>

        <h1 className="text-3xl font-display font-semibold mb-3 text-[var(--color-warning)]">
          Documents Expired
        </h1>

        <p className="text-[var(--color-text-secondary)] text-sm mb-8 max-w-xs leading-relaxed">
          Your KYC was previously approved, but one or more of your documents have since expired. You need to renew them to continue operating.
        </p>

        {/* Expired docs list */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-left mb-2">Expired Documents</p>
          {EXPIRED_DOCS.map(doc => (
            <div
              key={doc.name}
              className="flex items-center justify-between bg-[var(--color-warning)]/8 border border-[var(--color-warning)]/25 rounded-[var(--radius-md)] p-4"
            >
              <p className="font-medium text-sm text-left">{doc.name}</p>
              <div className="text-right">
                <p className="text-xs text-[var(--color-warning)] font-semibold">EXPIRED</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">{doc.expiredOn}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Renew CTA */}
        <button
          onClick={handleRenew}
          className="w-full max-w-sm h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg mb-4 flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[var(--shadow-glow)]"
        >
          <RotateCcw size={18} /> Update Documents
        </button>

        <button
          onClick={handleContactSupport}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-white font-medium transition-colors"
        >
          <MessageCircle size={16} /> Contact Support
        </button>
      </div>

      <div className="p-6 pb-safe">
        <p className="text-xs text-[var(--color-text-muted)] text-center leading-relaxed">
          You cannot go online until expired documents are renewed and re-verified. This typically takes under 24 hours.
        </p>
      </div>
    </div>
  );
}
