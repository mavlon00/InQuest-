import React from 'react';
import { Clock, ShieldCheck, MessageCircle, AlertCircle } from 'lucide-react';

export default function DriverPendingApproval() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[var(--color-primary)]/3 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
        
        {/* Animated Status Icon */}
        <div className="relative mb-12">
          {/* Pulse Rings */}
          <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-[-20px] border border-[var(--color-primary)]/10 rounded-full animate-[pulse_4s_infinite]" />
          
          <div className="relative w-32 h-32 rounded-full bg-[var(--color-surface-1)] border-4 border-[var(--color-surface-3)] flex items-center justify-center shadow-xl">
            <Clock size={56} className="text-[var(--color-primary)] animate-[spin_10s_linear_infinite]" />
          </div>

          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--color-success)] rounded-full border-4 border-[var(--color-bg)] flex items-center justify-center shadow-lg">
            <ShieldCheck size={20} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-display font-bold leading-tight mb-4">
          Application <br />
          <span className="text-[var(--color-primary)]">Under Review</span>
        </h1>
        
        <p className="text-[var(--color-text-secondary)] text-lg font-medium mb-8 max-w-sm leading-relaxed">
          Our team is verifying your documents. This usually takes <span className="text-white font-bold">under 24 hours</span>.
        </p>

        {/* Info Card */}
        <div className="w-full max-w-sm bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-lg)] p-5 flex gap-4 text-left mb-12 shadow-md">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Stay tuned!</p>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              We'll send you an SMS and a push notification immediately once your account is activated.
            </p>
          </div>
        </div>

        {/* Support Action */}
        <div className="w-full max-w-sm space-y-4">
          <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-4">Need help?</p>
          <button 
            onClick={() => window.open('https://wa.me/2348000000000', '_blank')}
            className="w-full h-16 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-white font-display font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[var(--color-surface-3)] active:scale-[0.98]"
          >
            <MessageCircle size={22} className="text-[#25D366]" />
            CHAT WITH SUPPORT
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
