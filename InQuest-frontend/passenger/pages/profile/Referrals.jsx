import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Copy, CheckCircle, Gift , ChevronLeft} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Referrals() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const referralCode = 'INQ-JOHND-2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Inquest Mobility',
          text: `Use my referral code ${referralCode} to get ₦500 off your first ride!`,
          url: 'https://inquest.app',
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Refer & Earn</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <div className="bg-[var(--color-surface-1)] p-6 rounded-3xl border border-[var(--color-border-subtle)] text-center shadow-sm">
          <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-[var(--color-primary)]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Get ₦500, Give ₦500</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Invite friends to Inquest. They get ₦500 off their first ride, and you get 500 Green Points when they complete it.
          </p>

          <div className="bg-[var(--color-surface-2)] rounded-2xl p-4 border border-[var(--color-border-subtle)] mb-6">
            <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Your Referral Code</p>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xl tracking-widest">{referralCode}</span>
              <button
                onClick={handleCopy}
                className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-full transition-colors"
              >
                {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Share2 size={20} /> Share Link
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Your Referrals</h3>
          <div className="space-y-4">
            {[
              { name: 'Sarah Jenkins', status: 'Completed', date: 'Oct 20, 2026', pts: '+500 pts' },
              { name: 'Michael Obi', status: 'Pending', date: 'Oct 22, 2026', pts: 'Pending' },
            ].map((ref, i) => (
              <div key={i} className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">{ref.name}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">{ref.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm mb-1 ${ref.status === 'Completed' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {ref.pts}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{ref.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

