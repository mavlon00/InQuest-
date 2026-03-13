import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../driverStore';
import {
  Star, ShieldCheck, Wallet, Banknote, CreditCard, X, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const DECLINE_REASONS = [
  'Too far away',
  'Route has heavy traffic',
  'Area is unsafe',
  'Need a break',
  'Passenger rating too low',
  'Other',
];

const paymentColorMap = {
  WALLET: { text: 'var(--color-info)',    bg: 'rgba(99,179,237,0.15)' },
  CASH:   { text: 'var(--color-warning)', bg: 'rgba(250,204,21,0.15)' },
  CARD:   { text: 'var(--color-success)', bg: 'rgba(74,222,128,0.15)' },
};

const PaymentIcon = ({ method }) => {
  if (method === 'WALLET') return <Wallet    size={13} className="shrink-0" />;
  if (method === 'CASH')   return <Banknote  size={13} className="shrink-0" />;
  if (method === 'CARD')   return <CreditCard size={13} className="shrink-0" />;
  return null;
};

const Spinner = () => (
  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export default function TripRequestSheet() {
  const navigate = useNavigate();
  const {
    incomingRequest,
    requestCountdown,
    setRequestCountdown,
    setIncomingRequest,
    setActiveTrip,
    setTripStatus,
  } = useDriverStore();

  const [view,           setView]           = useState('main');   // 'main' | 'decline'
  const [selectedReason, setSelectedReason] = useState('');
  const [declineError,   setDeclineError]   = useState('');
  const [acceptLoading,  setAcceptLoading]  = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!incomingRequest) return;
    const timer = setInterval(() => {
      setRequestCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingRequest]);

  const handleTimeout = useCallback(() => {
    setIncomingRequest(null);
    toast('Request expired', { icon: '⏳' });
  }, [setIncomingRequest]);

  const handleAccept = async () => {
    setAcceptLoading(true);
    try {
      // POST /api/v1/driver/trips/:id/accept
      await new Promise(r => setTimeout(r, 900));
      setActiveTrip({ ...incomingRequest, status: 'EN_ROUTE' });
      setTripStatus('EN_ROUTE');
      setIncomingRequest(null);
      navigate(`/trip/${incomingRequest.tripId}`);
    } catch {
      toast.error('Failed to accept trip. Try again.');
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleConfirmDecline = useCallback(async () => {
    if (!selectedReason) { setDeclineError('Please select a reason.'); return; }
    setDeclineLoading(true);
    setDeclineError('');
    try {
      // POST /api/v1/driver/trips/:id/decline
      await new Promise(r => setTimeout(r, 800));
      setIncomingRequest(null);
      setView('main');
      toast('Trip declined.', { icon: '✕' });
    } catch {
      setDeclineError('Failed to decline. Try again.');
    } finally {
      setDeclineLoading(false);
    }
  }, [selectedReason, setIncomingRequest]);

  if (!incomingRequest) return null;

  const pct      = (requestCountdown / 25) * 100;
  const isUrgent = requestCountdown <= 5;
  const payColor = paymentColorMap[incomingRequest.paymentMethod] || paymentColorMap.CASH;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-[var(--color-surface-1)] rounded-t-[var(--radius-xl)] shadow-[var(--shadow-modal)]" style={{ animation: 'slideUp 0.35s ease-out' }}>

      {/* Countdown progress bar */}
      <div className="h-1.5 w-full bg-[var(--color-surface-3)] rounded-t-[var(--radius-xl)] overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ── MAIN VIEW ── */}
      {view === 'main' && (
        <div className="p-6 pb-[88px]">
          {/* Passenger + countdown */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center font-display font-bold text-xl text-[var(--color-text-secondary)] overflow-hidden">
                {incomingRequest.passenger.photoUrl
                  ? <img src={incomingRequest.passenger.photoUrl} alt="" className="w-full h-full object-cover" />
                  : incomingRequest.passenger.name.charAt(0)
                }
              </div>
              <div>
                <h3 className="font-semibold text-lg">{incomingRequest.passenger.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                  <Star size={12} className="text-[var(--color-warning)] fill-[var(--color-warning)]" />
                  <span>{incomingRequest.passenger.rating}</span>
                  <span className="text-[var(--color-surface-3)]">·</span>
                  <span>{incomingRequest.passenger.totalTrips} trips</span>
                </div>
              </div>
            </div>
            <span className={`text-4xl font-display font-bold tabular-nums ${isUrgent ? 'text-[var(--color-error)] animate-pulse' : 'text-[var(--color-primary)]'}`}>
              {requestCountdown}
            </span>
          </div>

          {/* Fare + distance */}
          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Estimated Fare</p>
              <h2 className="text-3xl font-display font-bold text-[var(--color-earnings)]">
                ₦{incomingRequest.estimatedFare.toLocaleString()}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Distance to pickup</p>
              <p className="font-semibold">{incomingRequest.distanceToPickup} km</p>
            </div>
          </div>

          {/* Route card */}
          <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 mb-5 relative">
            <div className="absolute left-[23px] top-8 bottom-8 w-[2px] bg-[var(--color-surface-3)]" />
            <div className="flex items-start gap-3 mb-4 relative z-10">
              <div className="w-4 h-4 rounded-full bg-[var(--color-success)] mt-0.5 shrink-0 border-2 border-[var(--color-surface-2)]" />
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Pickup</p>
                <p className="font-medium text-sm line-clamp-1">{incomingRequest.pickup.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-4 h-4 rounded-full bg-[var(--color-error)] mt-0.5 shrink-0 border-2 border-[var(--color-surface-2)]" />
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Drop-off</p>
                <p className="font-medium text-sm line-clamp-1">{incomingRequest.destination.address}</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-2 mb-5">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ color: payColor.text, backgroundColor: payColor.bg }}
            >
              <PaymentIcon method={incomingRequest.paymentMethod} />
              {incomingRequest.paymentMethod}
            </div>
            {incomingRequest.insurance && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success)]/12">
                <ShieldCheck size={12} /> Insured
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAccept}
              disabled={acceptLoading}
              className="w-full h-16 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-xl flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60 shadow-[var(--shadow-glow)]"
            >
              {acceptLoading ? <Spinner /> : 'ACCEPT'}
            </button>
            <button
              onClick={() => { setView('decline'); setSelectedReason(''); setDeclineError(''); }}
              className="w-full h-12 rounded-[var(--radius-pill)] bg-[var(--color-error)]/12 text-[var(--color-error)] border border-[var(--color-error)]/50 font-display font-semibold text-base active:scale-[0.97] transition-all"
            >
              DECLINE
            </button>
          </div>
        </div>
      )}

      {/* ── DECLINE REASON VIEW ── */}
      {view === 'decline' && (
        <div className="p-6 pb-[88px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-display font-semibold">Why are you declining?</h3>
            {!declineLoading && (
              <button onClick={() => setView('main')} className="p-2 bg-[var(--color-surface-2)] rounded-full">
                <X size={20} />
              </button>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">This helps us improve trip matching for everyone.</p>

          <div className="space-y-2 max-h-[38vh] overflow-y-auto no-scrollbar pb-2">
            {DECLINE_REASONS.map(r => (
              <button
                key={r}
                onClick={() => { setSelectedReason(r); setDeclineError(''); }}
                className={`w-full text-left px-4 py-3.5 rounded-[var(--radius-md)] border text-sm font-medium transition-all ${selectedReason === r ? 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
              >
                {r}
              </button>
            ))}
          </div>

          {declineError && (
            <div className="flex items-center gap-2 bg-[var(--color-error)]/10 border border-[var(--color-error)]/25 rounded-[var(--radius-md)] p-3 mt-3">
              <AlertCircle size={14} className="text-[var(--color-error)] shrink-0" />
              <p className="text-xs text-[var(--color-error)]">{declineError}</p>
            </div>
          )}

          <button
            onClick={handleConfirmDecline}
            disabled={declineLoading || !selectedReason}
            className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-error)] text-white font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all mt-4"
          >
            {declineLoading ? <Spinner /> : 'CONFIRM DECLINE'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
