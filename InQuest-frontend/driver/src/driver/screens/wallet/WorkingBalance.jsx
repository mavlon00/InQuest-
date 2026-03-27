import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import { ArrowLeft, Shield, Wifi, WifiOff, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

const fmtTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Mock trip credits for today
const mockTripCredits = [
  { id: 't11', time: '14:30', route: 'Lekki Ph1 → VI',       amount: 1050, verified: true,  method: 'WALLET' },
  { id: 't10', time: '13:50', route: 'Ajah → Sangotedo',      amount:  750, verified: true,  method: 'CASH'   },
  { id: 't9',  time: '12:15', route: 'Yaba → Surulere',       amount:  800, verified: true,  method: 'CASH'   },
  { id: 't8',  time: '11:40', route: 'VI → Ikoyi',            amount: 1200, verified: true,  method: 'CARD'   },
  { id: 't7',  time: '10:55', route: 'Oshodi → Ikeja',        amount:  900, verified: true,  method: 'CASH'   },
  { id: 't6',  time: '10:10', route: 'Maryland → Yaba',       amount:  680, verified: true,  method: 'WALLET' },
  { id: 't5',  time: '09:30', route: 'Ikeja → Lagos Island',  amount: 1400, verified: true,  method: 'CARD'   },
  { id: 't4',  time: '09:05', route: 'Surulere → Mushin',     amount:  590, verified: true,  method: 'CASH'   },
  { id: 't3',  time: '08:40', route: 'Ajegunle → Mile 2',     amount:  620, verified: true,  method: 'CASH'   },
  { id: 't2',  time: '08:10', route: 'Lekki Ph1 → Chevron',   amount:  800, verified: true,  method: 'WALLET' },
  { id: 't1',  time: '07:45', route: 'Lekki Ph1 → Ajah',      amount:  460, verified: false, method: 'CASH'   },
];

const methodColors = {
  WALLET: 'var(--color-info)',
  CASH:   'var(--color-warning)',
  CARD:   'var(--color-success)',
};

export default function WorkingBalance() {
  const navigate  = useNavigate();
  const { wallets, iotDevice } = useDriverStore();
  const { working } = wallets;

  // Settlement preview
  const gross      = working.grossToday;
  const commission = Math.round(gross * 0.15);
  const kekeFee    = 3500;
  const netEarned  = gross - commission - kekeFee;
  const maint      = Math.round(netEarned * 0.05);
  const toMain     = netEarned - maint;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-8">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-semibold">Working Balance</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Resets at midnight settlement</p>
        </div>
        {/* IoT badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${iotDevice.isConnected ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/30 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 border-[var(--color-error)]/30 text-[var(--color-error)]'}`}>
          {iotDevice.isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
          IoT {iotDevice.isConnected ? 'ON' : 'OFF'}
        </div>
      </header>

      <div className="px-4 py-5 space-y-4">

        {/* Balance hero */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-6 border border-[var(--color-primary)]/20 shadow-[var(--shadow-glow)] relative overflow-hidden">
          {/* Glow blob */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[var(--color-primary)]/5 blur-3xl pointer-events-none" />

          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Today's Working Balance</p>
          <h2 className="text-5xl font-display font-bold text-[var(--color-earnings)] mb-1">
            {fmt(working.balance)}
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            {working.tripCount} trips completed · last credit {fmtTime(working.lastCreditedAt)}
          </p>

          {working.pendingVerification > 0 && (
            <div className="flex items-center gap-2 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/25 rounded-[var(--radius-md)] px-3 py-2 mb-4">
              <AlertCircle size={14} className="text-[var(--color-warning)] shrink-0" />
              <p className="text-xs text-[var(--color-warning)]">
                {fmt(working.pendingVerification)} pending IoT verification
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Shield size={12} className="text-[var(--color-primary)]" />
            Cannot be withdrawn directly — settles to Savings at midnight
          </div>
        </div>

        {/* Last credit flash */}
        {working.lastCreditAmount > 0 && (
          <div className="flex items-center gap-3 bg-[var(--color-surface-2)] border border-[var(--color-primary)]/20 rounded-[var(--radius-md)] px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-[var(--color-primary)]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--color-text-secondary)]">Last trip credit</p>
              <p className="font-display font-bold text-[var(--color-earnings)]">{fmt(working.lastCreditAmount)}</p>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{fmtTime(working.lastCreditedAt)}</p>
          </div>
        )}

        {/* Tonight's settlement preview */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] overflow-hidden border border-[var(--color-surface-3)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-surface-3)]">
            <Clock size={14} className="text-[var(--color-text-secondary)]" />
            <p className="text-sm font-semibold">Tonight's Settlement Preview</p>
            <span className="ml-auto text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Auto at midnight</span>
          </div>

          <div className="p-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Gross Working Balance</span>
              <span className="font-medium">{fmt(gross)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-error)]">
              <span>− Platform Commission (15%)</span>
              <span>−{fmt(commission)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-error)]">
              <span>− Keke Usage Fee (daily)</span>
              <span>−{fmt(kekeFee)}</span>
            </div>
            <div className="h-px bg-[var(--color-surface-3)] my-1" />
            <div className="flex justify-between font-semibold">
              <span>Net Earnings</span>
              <span className="text-white">{fmt(netEarned)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-warning)]">
              <span>− Maintenance Savings (5%)</span>
              <span>−{fmt(maint)}</span>
            </div>
            <div className="h-px bg-[var(--color-surface-3)] my-1" />
            <div className="flex justify-between font-bold text-base">
              <span>→ Transfer to Savings</span>
              <span className="text-[var(--color-earnings)]">{fmt(toMain)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>→ Transfer to Maintenance</span>
              <span className="text-[var(--color-text-secondary)]">{fmt(maint)}</span>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 flex items-center gap-2">
              <Clock size={14} className="text-[var(--color-text-muted)] shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)]">
                Settlement is automatic at midnight. You cannot trigger it early.
              </p>
            </div>
          </div>
        </div>

        {/* Trip-by-trip credits */}
        <div>
          <p className="text-sm font-semibold mb-3">Today's Trip Credits</p>
          <div className="space-y-2">
            {mockTripCredits.map(trip => (
              <div key={trip.id} className="bg-[var(--color-surface-1)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 border border-[var(--color-surface-3)]">
                <div className="shrink-0">
                  {trip.verified
                    ? <CheckCircle size={16} className="text-[var(--color-success)]" />
                    : <AlertCircle size={16} className="text-[var(--color-warning)]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-text-muted)]">{trip.time}</p>
                  <p className="text-sm font-medium truncate">{trip.route}</p>
                  {!trip.verified && (
                    <p className="text-[10px] text-[var(--color-warning)]">Pending IoT verification</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-sm" style={{ color: trip.verified ? 'var(--color-earnings)' : 'var(--color-warning)' }}>
                    +{fmt(trip.amount)}
                  </p>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                    style={{ color: methodColors[trip.method], backgroundColor: `${methodColors[trip.method]}20` }}
                  >
                    {trip.method}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
