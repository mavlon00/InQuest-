import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Banknote, ChevronRight, X, CheckCircle,
  TrendingUp, Calendar, AlertCircle, Building2
} from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const mockSettlements = [
  { date: '2026-03-10', gross: 14200, net: 8141, commission: 2130, kekeFee: 3500, maintenance: 429 },
  { date: '2026-03-09', gross: 18600, net: 10773, commission: 2790, kekeFee: 3500, maintenance: 537 },
  { date: '2026-03-08', gross: 12400, net: 6997, commission: 1860, kekeFee: 3500, maintenance: 343 },
  { date: '2026-03-07', gross: 21000, net: 12607, commission: 3150, kekeFee: 3500, maintenance: 743 },
  { date: '2026-03-06', gross: 16800, net: 9810, commission: 2520, kekeFee: 3500, maintenance: 490 },
  { date: '2026-03-05', gross: 9600,  net: 5225, commission: 1440, kekeFee: 3500, maintenance: 235 },
];

const mockWithdrawals = [
  { id: 'w001', date: '2026-03-09', amount: 5000,  status: 'COMPLETED', bank: 'Access Bank', account: '****3421' },
  { id: 'w002', date: '2026-03-07', amount: 8000,  status: 'COMPLETED', bank: 'GTBank',      account: '****1278' },
  { id: 'w003', date: '2026-03-05', amount: 3500,  status: 'COMPLETED', bank: 'Access Bank', account: '****3421' },
];

const QUICK_AMOUNTS = [2000, 5000, 10000, 20000];

const BANKS = ['Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank', 'Kuda Bank', 'Opay', 'Palmpay'];

export default function MainWallet() {
  const navigate = useNavigate();
  const { wallets, setWallets } = useDriverStore();
  const { main } = wallets;

  const [showWithdraw, setShowWithdraw]     = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank]     = useState('Access Bank');
  const [accountNumber, setAccountNumber]   = useState('1234567890');
  const [pin, setPin]                       = useState('');
  const [loading, setLoading]               = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const parsedAmount = parseInt(withdrawAmount.replace(/,/g, ''), 10) || 0;

  const handleWithdraw = async () => {
    if (parsedAmount < 100) { toast.error('Minimum withdrawal is ₦100'); return; }
    if (parsedAmount > main.balance) { toast.error('Insufficient balance'); return; }
    if (pin.length !== 4) { toast.error('Enter your 4-digit PIN'); return; }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      // Deduct from local state
      setWallets({
        ...wallets,
        main: { ...main, balance: main.balance - parsedAmount },
      });
      toast.success(`${fmt(parsedAmount)} sent to ${selectedBank}`);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setPin('');
    } catch {
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatInput = (val) => {
    const raw = val.replace(/\D/g, '');
    return raw ? parseInt(raw, 10).toLocaleString('en-NG') : '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-8">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-semibold">Savings Wallet</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Your net earnings after settlement</p>
        </div>
      </header>

      <div className="px-4 py-5 space-y-4">

        {/* Balance hero */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-6 border border-[var(--color-primary)]/20 shadow-[var(--shadow-glow)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[var(--color-primary)]/5 blur-3xl pointer-events-none" />
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Available Balance</p>
          <h2 className="text-5xl font-display font-bold text-white mb-1">{fmt(main.balance)}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            Last settlement: {fmtDate(main.lastSettlementDate)} · {fmt(main.lastSettlementNet)} added
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-2)]/60 rounded-[var(--radius-md)] p-3">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Lifetime Earned</p>
              <p className="font-display font-bold text-[var(--color-earnings)]">{fmt(main.totalLifetime)}</p>
            </div>
            <div className="bg-[var(--color-surface-2)]/60 rounded-[var(--radius-md)] p-3">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Last Settlement</p>
              <p className="font-display font-bold text-white">{fmt(main.lastSettlementNet)}</p>
            </div>
          </div>
        </div>

        {/* Withdraw button */}
        <button
          onClick={() => setShowWithdraw(true)}
          className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[var(--shadow-glow)]"
        >
          <Banknote size={20} /> Withdraw to Bank
        </button>

        {/* Recent withdrawals */}
        {mockWithdrawals.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-3">Recent Withdrawals</p>
            <div className="space-y-2">
              {mockWithdrawals.map(w => (
                <div key={w.id} className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 border border-[var(--color-surface-3)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center shrink-0">
                    <CheckCircle size={16} className="text-[var(--color-success)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{w.bank}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{w.account} · {fmtDate(w.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-[var(--color-error)]">−{fmt(w.amount)}</p>
                    <p className="text-[10px] text-[var(--color-success)]">Sent</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settlement history */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-[var(--color-text-secondary)]" />
            <p className="text-sm font-semibold">Midnight Settlements</p>
          </div>
          <div className="space-y-2">
            {mockSettlements.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSettlement(s)}
                className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 border border-[var(--color-surface-3)] active:scale-[0.99] transition-transform text-left"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{fmtDate(s.date)}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Gross {fmt(s.gross)}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-[var(--color-earnings)]">+{fmt(s.net)}</p>
                  <ChevronRight size={14} className="text-[var(--color-text-muted)] ml-auto" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* WITHDRAWAL BOTTOM SHEET */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowWithdraw(false)}>
          <div
            className="bg-[var(--color-surface-1)] w-full rounded-t-[var(--radius-xl)] p-6 pb-safe max-h-[90vh] overflow-y-auto"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-semibold">Withdraw to Bank</h3>
              <button onClick={() => setShowWithdraw(false)} className="p-2 bg-[var(--color-surface-2)] rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Available */}
            <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 flex justify-between items-center mb-5">
              <p className="text-sm text-[var(--color-text-secondary)]">Available</p>
              <p className="font-display font-bold text-[var(--color-earnings)]">{fmt(main.balance)}</p>
            </div>

            {/* Amount */}
            <div className="space-y-1.5 mb-4">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-semibold">₦</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(formatInput(e.target.value))}
                  placeholder="0"
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-14 pl-8 pr-4 text-white text-xl font-display font-bold focus:border-[var(--color-primary)] outline-none transition-colors placeholder-[var(--color-text-muted)]"
                />
              </div>
              {/* Quick amounts */}
              <div className="flex gap-2 mt-2">
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setWithdrawAmount(amt.toLocaleString('en-NG'))}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50 transition-colors"
                  >
                    {amt >= 1000 ? `₦${amt/1000}k` : `₦${amt}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank */}
            <div className="space-y-1.5 mb-4">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Bank</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <select
                  value={selectedBank}
                  onChange={e => setSelectedBank(e.target.value)}
                  className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-12 pl-10 pr-4 text-white focus:border-[var(--color-primary)] outline-none appearance-none"
                >
                  {BANKS.map(b => <option key={b} value={b} className="bg-[var(--color-surface-2)]">{b}</option>)}
                </select>
              </div>
            </div>

            {/* Account number */}
            <div className="space-y-1.5 mb-4">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-12 px-4 text-white focus:border-[var(--color-primary)] outline-none transition-colors"
              />
              {accountNumber.length === 10 && (
                <p className="text-xs text-[var(--color-success)] flex items-center gap-1">
                  <CheckCircle size={11} /> Michael Okon
                </p>
              )}
            </div>

            {/* PIN */}
            <div className="space-y-1.5 mb-6">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Transaction PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                placeholder="••••"
                className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-12 px-4 text-white text-center text-2xl tracking-[0.5em] focus:border-[var(--color-primary)] outline-none transition-colors placeholder-[var(--color-text-muted)]"
              />
            </div>

            {parsedAmount > main.balance && (
              <div className="flex items-center gap-2 bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-[var(--radius-md)] p-3 mb-4">
                <AlertCircle size={14} className="text-[var(--color-error)] shrink-0" />
                <p className="text-xs text-[var(--color-error)]">Amount exceeds available balance</p>
              </div>
            )}

            <button
              onClick={handleWithdraw}
              disabled={loading || parsedAmount < 100 || parsedAmount > main.balance || pin.length !== 4}
              className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all shadow-[var(--shadow-glow)]"
            >
              {loading ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Processing…</>
              ) : (
                <><Banknote size={20} /> Withdraw {parsedAmount > 0 ? fmt(parsedAmount) : ''}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SETTLEMENT DETAIL SHEET */}
      {selectedSettlement && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setSelectedSettlement(null)}>
          <div
            className="bg-[var(--color-surface-1)] w-full rounded-t-[var(--radius-xl)] p-6 pb-safe"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-semibold">Settlement · {fmtDate(selectedSettlement.date)}</h3>
              <button onClick={() => setSelectedSettlement(null)} className="p-2 bg-[var(--color-surface-2)] rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Gross Working Balance</span><span>{fmt(selectedSettlement.gross)}</span></div>
              <div className="flex justify-between text-[var(--color-error)]"><span>− Platform Commission (15%)</span><span>−{fmt(selectedSettlement.commission)}</span></div>
              <div className="flex justify-between text-[var(--color-error)]"><span>− Keke Usage Fee</span><span>−{fmt(selectedSettlement.kekeFee)}</span></div>
              <div className="h-px bg-[var(--color-surface-3)]" />
              <div className="flex justify-between font-semibold"><span>Net Earnings</span><span>{fmt(selectedSettlement.gross - selectedSettlement.commission - selectedSettlement.kekeFee)}</span></div>
              <div className="flex justify-between text-[var(--color-warning)]"><span>− Maintenance Savings (5%)</span><span>−{fmt(selectedSettlement.maintenance)}</span></div>
              <div className="h-px bg-[var(--color-surface-3)]" />
              <div className="flex justify-between font-bold text-base"><span>→ Added to Savings</span><span className="text-[var(--color-earnings)]">+{fmt(selectedSettlement.net)}</span></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
