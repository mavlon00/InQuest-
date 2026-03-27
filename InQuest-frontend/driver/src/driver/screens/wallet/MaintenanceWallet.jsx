import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Wrench, Lock, X, ChevronRight,
  Clock, CheckCircle, XCircle, AlertCircle, Send
} from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const mockDepositHistory = [
  { date: '2026-03-10T00:00:00Z', amount: 429,  source: 'Settlement · Mar 10' },
  { date: '2026-03-09T00:00:00Z', amount: 537,  source: 'Settlement · Mar 9'  },
  { date: '2026-03-08T00:00:00Z', amount: 343,  source: 'Settlement · Mar 8'  },
  { date: '2026-03-07T00:00:00Z', amount: 743,  source: 'Settlement · Mar 7'  },
  { date: '2026-03-06T00:00:00Z', amount: 490,  source: 'Settlement · Mar 6'  },
];

const WITHDRAW_REASONS = [
  'Tyre replacement',
  'Engine repair',
  'Brake system repair',
  'Body repair / dent',
  'Electrical fault',
  'Scheduled service / oil change',
  'Other',
];

const STATUS_CONFIG = {
  PENDING:  { label: 'Under Review',  color: 'var(--color-warning)',  Icon: Clock        },
  APPROVED: { label: 'Approved',      color: 'var(--color-success)',  Icon: CheckCircle  },
  REJECTED: { label: 'Rejected',      color: 'var(--color-error)',    Icon: XCircle      },
};

export default function MaintenanceWallet() {
  const navigate = useNavigate();
  const { wallets, submitMaintenanceWithdrawal, clearMaintenanceWithdrawal } = useDriverStore();
  const { maintenance } = wallets;

  const [showRequest, setShowRequest]         = useState(false);
  const [amount, setAmount]                   = useState('');
  const [reason, setReason]                   = useState('');
  const [customReason, setCustomReason]       = useState('');
  const [loading, setLoading]                 = useState(false);
  const [showHistory, setShowHistory]         = useState(false);

  const parsedAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const pending = maintenance.pendingWithdrawalRequest;
  const finalReason = reason === 'Other' ? customReason : reason;

  const canSubmit =
    parsedAmount >= 100 &&
    parsedAmount <= maintenance.balance &&
    finalReason.trim().length >= 5 &&
    !pending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1800));
      submitMaintenanceWithdrawal(parsedAmount, finalReason);
      toast.success('Withdrawal request submitted. Admin will review within 24 hours.');
      setShowRequest(false);
      setAmount('');
      setReason('');
      setCustomReason('');
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = () => {
    if (window.confirm('Cancel this withdrawal request?')) {
      clearMaintenanceWithdrawal();
      toast('Request cancelled.', { icon: '✕' });
    }
  };

  const formatInput = (val) => {
    const raw = val.replace(/\D/g, '');
    return raw ? parseInt(raw, 10).toLocaleString('en-NG') : '';
  };

  const StatusBanner = () => {
    if (!pending) return null;
    const cfg = STATUS_CONFIG[pending.status] || STATUS_CONFIG.PENDING;
    const Icon = cfg.Icon;

    return (
      <div
        className="rounded-[var(--radius-lg)] p-5 border"
        style={{ backgroundColor: `${cfg.color}10`, borderColor: `${cfg.color}30` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Icon size={20} style={{ color: cfg.color }} />
          <p className="font-semibold text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
          <span className="ml-auto text-xs text-[var(--color-text-muted)]">Withdrawal Request</span>
        </div>

        <div className="space-y-2 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Amount</span>
            <span className="font-display font-bold" style={{ color: cfg.color }}>{fmt(pending.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Reason</span>
            <span className="text-right max-w-[60%] text-[var(--color-text-primary)]">{pending.reason}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-secondary)]">Submitted</span>
            <span>{fmtDateTime(pending.submittedAt)}</span>
          </div>
          {pending.adminNote && (
            <div className="mt-2 p-3 bg-black/20 rounded-[var(--radius-md)]">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Admin Note</p>
              <p className="text-sm">{pending.adminNote}</p>
            </div>
          )}
          {pending.resolvedAt && (
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Resolved</span>
              <span>{fmtDateTime(pending.resolvedAt)}</span>
            </div>
          )}
        </div>

        {pending.status === 'PENDING' && (
          <button
            onClick={handleCancelRequest}
            className="text-xs text-[var(--color-error)] font-medium underline underline-offset-3"
          >
            Cancel request
          </button>
        )}
        {pending.status === 'REJECTED' && (
          <button
            onClick={clearMaintenanceWithdrawal}
            className="w-full mt-2 h-10 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-sm font-semibold text-[var(--color-text-secondary)]"
          >
            Dismiss & Submit New Request
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-8">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-semibold">Maintenance Savings</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Admin-approved withdrawals only</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)]">
          <Lock size={12} className="text-[var(--color-text-muted)]" />
          <span className="text-xs font-semibold text-[var(--color-text-muted)]">LOCKED</span>
        </div>
      </header>

      <div className="px-4 py-5 space-y-4">

        {/* Balance hero */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-6 border border-[var(--color-surface-3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[var(--color-warning)]/5 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-2">
            <Wrench size={16} className="text-[var(--color-warning)]" />
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Maintenance Balance</p>
          </div>
          <h2 className="text-5xl font-display font-bold text-white mb-1">{fmt(maintenance.balance)}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            Last deposit: {fmtDateTime(maintenance.lastDepositAt)} · {fmt(maintenance.lastDepositAmount)}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-2)]/60 rounded-[var(--radius-md)] p-3">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Total Saved</p>
              <p className="font-display font-bold text-white">{fmt(maintenance.totalSaved)}</p>
            </div>
            <div className="bg-[var(--color-surface-2)]/60 rounded-[var(--radius-md)] p-3">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Savings Rate</p>
              <p className="font-display font-bold text-[var(--color-primary)]">{(maintenance.savingsRate * 100).toFixed(0)}% / settlement</p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 flex gap-3 border border-[var(--color-surface-3)]">
          <AlertCircle size={18} className="text-[var(--color-text-secondary)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            This wallet is for <strong className="text-white">keke maintenance only</strong>. Withdrawals require admin approval. Approved funds are transferred directly to your linked bank account.
          </p>
        </div>

        {/* Pending request status */}
        <StatusBanner />

        {/* Request Withdrawal button — disabled if pending */}
        {!pending && (
          <button
            onClick={() => setShowRequest(true)}
            className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-[var(--color-text-primary)] font-display font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-all hover:border-[var(--color-primary)]/40"
          >
            <Send size={18} className="text-[var(--color-primary)]" /> Request Withdrawal
          </button>
        )}

        {pending && pending.status === 'PENDING' && (
          <div className="flex items-center gap-2 bg-[var(--color-warning)]/8 border border-[var(--color-warning)]/20 rounded-[var(--radius-md)] p-3">
            <Lock size={14} className="text-[var(--color-warning)] shrink-0" />
            <p className="text-xs text-[var(--color-warning)]">
              You can only have one active withdrawal request at a time.
            </p>
          </div>
        )}

        {/* Deposit history */}
        <div>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="flex items-center justify-between w-full mb-3"
          >
            <p className="text-sm font-semibold">Deposit History</p>
            <ChevronRight size={16} className={`text-[var(--color-text-muted)] transition-transform ${showHistory ? 'rotate-90' : ''}`} />
          </button>

          {showHistory && (
            <div className="space-y-2">
              {mockDepositHistory.map((d, i) => (
                <div key={i} className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 border border-[var(--color-surface-3)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center shrink-0">
                    <Wrench size={14} className="text-[var(--color-warning)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-text-muted)]">{fmtDate(d.date)}</p>
                    <p className="text-sm font-medium">{d.source}</p>
                  </div>
                  <p className="font-display font-bold text-white">+{fmt(d.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* REQUEST WITHDRAWAL SHEET */}
      {showRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowRequest(false)}>
          <div
            className="bg-[var(--color-surface-1)] w-full rounded-t-[var(--radius-xl)] p-6 pb-safe max-h-[90vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-semibold">Request Withdrawal</h3>
              <button onClick={() => setShowRequest(false)} className="p-2 bg-[var(--color-surface-2)] rounded-full"><X size={20} /></button>
            </div>

            {/* Available */}
            <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 flex justify-between items-center mb-5">
              <p className="text-sm text-[var(--color-text-secondary)]">Available in Maintenance</p>
              <p className="font-display font-bold text-white">{fmt(maintenance.balance)}</p>
            </div>

            {/* Amount */}
            <div className="space-y-1.5 mb-5">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-semibold">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={e => setAmount(formatInput(e.target.value))}
                  placeholder="0"
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-14 pl-8 pr-4 text-white text-xl font-display font-bold focus:border-[var(--color-primary)] outline-none transition-colors placeholder-[var(--color-text-muted)]"
                />
              </div>
              {parsedAmount > maintenance.balance && (
                <p className="text-xs text-[var(--color-error)] flex items-center gap-1">
                  <AlertCircle size={11} /> Exceeds available balance
                </p>
              )}
            </div>

            {/* Reason select */}
            <div className="space-y-2 mb-5">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Reason for Withdrawal</label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                {WITHDRAW_REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`w-full text-left px-4 py-3 rounded-[var(--radius-md)] border text-sm font-medium transition-all ${reason === r ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {reason === 'Other' && (
                <textarea
                  value={customReason}
                  onChange={e => setCustomReason(e.target.value)}
                  placeholder="Describe the maintenance needed…"
                  rows={3}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] p-4 text-white focus:border-[var(--color-primary)] outline-none transition-colors resize-none text-sm placeholder-[var(--color-text-muted)]"
                />
              )}
            </div>

            {/* Admin note */}
            <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 flex gap-2 mb-6">
              <Clock size={14} className="text-[var(--color-text-muted)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Admin will review and respond within 24 hours. You will receive a push notification when a decision is made.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all shadow-[var(--shadow-glow)]"
            >
              {loading ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Submitting…</>
              ) : (
                <><Send size={18} /> Submit Request</>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
