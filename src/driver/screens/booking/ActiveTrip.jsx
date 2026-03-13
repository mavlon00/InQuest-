import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import {
  Phone, MessageSquare, Navigation, ShieldAlert, Star,
  Wallet, Banknote, WifiOff, X, AlertCircle, CheckCircle
} from 'lucide-react';
import DriverMap from '../../app/components/DriverMap';
import toast from 'react-hot-toast';

const CANCEL_REASONS = [
  'Passenger no-show',
  'Passenger is being difficult',
  'Safety concern',
  'Wrong pickup location',
  'Other',
];

const Spinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export default function ActiveTrip() {
  const navigate  = useNavigate();
  const { tripId } = useParams();
  const {
    activeTrip, tripStatus, setTripStatus,
    setActiveTrip, iotDevice, activeCashTrip, creditWorkingWallet,
  } = useDriverStore();

  // Timers
  const [waitingTime, setWaitingTime]   = useState(300);
  const [waitingFee,  setWaitingFee]    = useState(0);
  const [tripTime,    setTripTime]      = useState(0);

  // UI state
  const [rating,          setRating]          = useState(0);
  const [cashCollected,   setCashCollected]   = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [selectedReason,  setSelectedReason]  = useState('');
  const [cancelLoading,   setCancelLoading]   = useState(false);
  const [cancelError,     setCancelError]     = useState('');

  // Per-button loading states
  const [arrivedLoading, setArrivedLoading] = useState(false);
  const [startLoading,   setStartLoading]   = useState(false);
  const [endLoading,     setEndLoading]     = useState(false);
  const [doneLoading,    setDoneLoading]    = useState(false);

  // Redirect if no active trip
  useEffect(() => {
    if (!activeTrip) navigate('/home');
  }, [activeTrip, navigate]);

  // Auto-transition: EN_ROUTE → ARRIVING
  useEffect(() => {
    if (!activeTrip || tripStatus !== 'EN_ROUTE') return;
    const t = setTimeout(() => {
      setTripStatus('ARRIVING');
      toast.success('Almost at pickup!');
    }, 4000);
    return () => clearTimeout(t);
  }, [tripStatus, activeTrip, setTripStatus]);

  // Auto-transition: IN_PROGRESS → COMPLETING
  useEffect(() => {
    if (!activeTrip || tripStatus !== 'IN_PROGRESS') return;
    const t = setTimeout(() => {
      setTripStatus('COMPLETING');
      toast.success('Almost at destination!');
    }, 6000);
    return () => clearTimeout(t);
  }, [tripStatus, activeTrip, setTripStatus]);

  // Waiting countdown (5 min free)
  useEffect(() => {
    if (tripStatus !== 'ARRIVED') return;
    const t = setInterval(() => {
      setWaitingTime(prev => {
        if (prev <= 1) { setTripStatus('WAITING'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [tripStatus, setTripStatus]);

  // Waiting fee accrual
  useEffect(() => {
    if (tripStatus !== 'WAITING') return;
    const t = setInterval(() => setWaitingFee(prev => prev + 30), 2000);
    return () => clearInterval(t);
  }, [tripStatus]);

  // Trip timer
  useEffect(() => {
    if (tripStatus !== 'IN_PROGRESS' && tripStatus !== 'COMPLETING') return;
    const t = setInterval(() => setTripTime(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, [tripStatus]);

  if (!activeTrip) return null;

  const isCash   = activeTrip.paymentMethod === 'CASH';
  const iotOn    = iotDevice.isConnected;
  const totalFare = isCash && iotOn
    ? activeCashTrip.iotCurrentFare
    : activeTrip.estimatedFare + waitingFee;

  const fmtTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ── Button handlers ──────────────────────────────────────────────

  const handleArrived = async () => {
    setArrivedLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // mock API PATCH /trips/:id/arrived
      setTripStatus('ARRIVED');
    } finally {
      setArrivedLoading(false);
    }
  };

  const handleStartTrip = async () => {
    setStartLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600)); // mock API PATCH /trips/:id/start
      setTripStatus('IN_PROGRESS');
    } finally {
      setStartLoading(false);
    }
  };

  const handleEndTrip = async () => {
    setEndLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // mock API PATCH /trips/:id/end
      setTripStatus('COMPLETED');
    } finally {
      setEndLoading(false);
    }
  };

  const handleCashCollected = async () => {
    try {
      await new Promise(r => setTimeout(r, 400)); // mock API POST /trips/:id/cash-confirmed
      setCashCollected(true);
      toast.success('Cash collection confirmed');
    } catch {
      toast.error('Could not confirm. Try again.');
    }
  };

  const handleDone = async () => {
    if (rating === 0) { toast.error('Please rate the passenger'); return; }
    if (isCash && !cashCollected) { toast.error('Confirm cash collection first'); return; }
    setDoneLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // mock API POST /trips/:id/rate
      creditWorkingWallet(totalFare);
      setActiveTrip(null);
      setTripStatus(null);
      navigate('/home');
      toast.success('Trip completed! Earnings added to working balance.');
    } catch {
      toast.error('Could not complete. Try again.');
    } finally {
      setDoneLoading(false);
    }
  };

  // ── Cancel flow ───────────────────────────────────────────────────

  const openCancelSheet = () => {
    setSelectedReason('');
    setCancelError('');
    setShowCancelSheet(true);
  };

  const handleConfirmCancel = useCallback(async () => {
    if (!selectedReason) { setCancelError('Please select a reason.'); return; }
    setCancelLoading(true);
    setCancelError('');
    try {
      // POST /api/v1/driver/trips/:id/cancel
      await new Promise(r => setTimeout(r, 1200));
      setShowCancelSheet(false);
      setActiveTrip(null);
      setTripStatus(null);
      navigate('/home');
      toast('Trip cancelled.', { icon: '✕' });
    } catch {
      setCancelError('Cancel failed. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  }, [selectedReason, setActiveTrip, setTripStatus, navigate]);

  const handleSOS = () => {
    if (window.confirm('Send SOS alert? Your location will be shared with emergency contacts.')) {
      toast.error('🚨 SOS SENT', { duration: 5000 });
    }
  };

  // ── Sub-renders ───────────────────────────────────────────────────

  const renderNavCard = () => {
    if (tripStatus === 'COMPLETED') return null;
    let instruction = 'Turn right onto Adeola Odeku';
    let eta = '4 min';  let dist = '1.2 km';
    if (tripStatus === 'ARRIVING') { instruction = 'Arriving at pickup'; eta = '1 min'; dist = '100 m'; }
    if (tripStatus === 'IN_PROGRESS' || tripStatus === 'COMPLETING') {
      instruction = 'Continue on Ozumba Mbadiwe'; eta = '12 min'; dist = '4.5 km';
    }
    return (
      <div className="absolute top-0 left-0 right-0 z-10 pt-safe px-4 mt-4 flex flex-col gap-2 pointer-events-none">
        {isCash && !iotOn && (
          <div className="bg-[var(--color-warning)]/90 backdrop-blur-md rounded-[var(--radius-md)] p-3 flex items-center gap-3 border border-[var(--color-warning)] pointer-events-auto">
            <WifiOff size={18} className="text-black shrink-0" />
            <p className="text-black text-xs font-semibold">IoT disconnected — fare calculated from app GPS</p>
          </div>
        )}
        <div className="bg-[var(--color-surface-0)]/95 backdrop-blur-md rounded-[var(--radius-md)] p-4 shadow-[var(--shadow-card)] border border-[var(--color-surface-3)] flex items-center gap-4 pointer-events-auto">
          <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0">
            <Navigation size={22} className="text-[var(--color-primary)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{instruction}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              <span className="text-[var(--color-info)] font-medium">{eta}</span>
              <span className="mx-2 text-[var(--color-surface-3)]">·</span>
              {dist}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderPassengerBar = () => {
    if (tripStatus === 'COMPLETED') return null;
    return (
      <div className="absolute bottom-[188px] left-4 right-4 z-10">
        <div className="bg-[var(--color-surface-0)]/95 backdrop-blur-md rounded-[var(--radius-md)] p-3 border border-[var(--color-surface-3)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center font-display font-bold shrink-0">
              {activeTrip.passenger.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm">{activeTrip.passenger.name}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <span className="bg-[var(--color-surface-2)] px-2 py-0.5 rounded-sm">{activeTrip.paymentMethod}</span>
                <span className="font-display font-bold text-[var(--color-earnings)]">₦{activeTrip.estimatedFare.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-info)]">
              <Phone size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-info)]">
              <MessageSquare size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBottomPanel = () => {
    if (tripStatus === 'COMPLETED') return null;
    return (
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-[var(--color-surface-1)] rounded-t-[var(--radius-xl)] shadow-[var(--shadow-modal)] pb-safe">
        {tripStatus === 'ARRIVING' && (
          <div className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-center py-2 text-sm font-semibold rounded-t-[var(--radius-xl)]">
            Almost at pickup!
          </div>
        )}
        {tripStatus === 'COMPLETING' && (
          <div className="bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-center py-2 text-sm font-semibold rounded-t-[var(--radius-xl)]">
            Almost at destination!
          </div>
        )}

        <div className="p-5">
          {/* EN_ROUTE / ARRIVING */}
          {(tripStatus === 'EN_ROUTE' || tripStatus === 'ARRIVING') && (
            <>
              <h3 className="text-xl font-display font-semibold text-center mb-5">Head to Pickup</h3>
              <button
                onClick={handleArrived}
                disabled={arrivedLoading}
                className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.97] transition-all"
              >
                {arrivedLoading ? <Spinner /> : 'I Have Arrived'}
              </button>
            </>
          )}

          {/* ARRIVED / WAITING */}
          {(tripStatus === 'ARRIVED' || tripStatus === 'WAITING') && (
            <>
              <h3 className="text-xl font-display font-semibold text-center mb-3">Waiting for Passenger</h3>
              {tripStatus === 'ARRIVED' ? (
                <div className="text-center mb-5">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">Free waiting time remaining</p>
                  <p className="text-3xl font-display font-bold text-[var(--color-warning)]">{fmtTime(waitingTime)}</p>
                </div>
              ) : (
                <div className="text-center mb-5 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-[var(--radius-md)] p-3">
                  <p className="text-[var(--color-warning)] font-semibold text-sm mb-1">Waiting Fee Active</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    ₦30/min — accrued: <span className="text-[var(--color-warning)] font-bold">₦{waitingFee.toLocaleString()}</span>
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={openCancelSheet}
                  className="flex-[0.4] h-14 rounded-[var(--radius-pill)] bg-[var(--color-error)]/15 text-[var(--color-error)] border border-[var(--color-error)]/60 font-display font-semibold active:scale-[0.97] transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleStartTrip}
                  disabled={startLoading}
                  className="flex-[0.6] h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.97] transition-all"
                >
                  {startLoading ? <Spinner /> : 'START TRIP'}
                </button>
              </div>
            </>
          )}

          {/* IN_PROGRESS / COMPLETING */}
          {(tripStatus === 'IN_PROGRESS' || tripStatus === 'COMPLETING') && (
            <>
              <h3 className="text-xl font-display font-semibold text-center mb-3">Trip in Progress</h3>
              <div className="flex bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 mb-4 gap-4">
                <div className="text-center flex-1 border-r border-[var(--color-surface-3)]">
                  <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">TIME</p>
                  <p className="font-display font-bold text-lg">{fmtTime(tripTime)}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">FARE</p>
                  <p className="font-display font-bold text-lg text-[var(--color-earnings)]">
                    ₦{(activeTrip.estimatedFare + waitingFee).toLocaleString()}
                  </p>
                </div>
              </div>

              {isCash && (
                <div className="mb-4 text-center bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 border border-[var(--color-primary)]/20">
                  <p className="text-[11px] text-[var(--color-text-secondary)] tracking-wider uppercase mb-1">LIVE FARE (IoT)</p>
                  <p className="font-display font-bold text-3xl text-[var(--color-earnings)]">
                    ₦{(iotOn ? activeCashTrip.iotCurrentFare : activeTrip.estimatedFare + waitingFee).toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {iotOn ? `${activeCashTrip.iotDistanceKm.toFixed(1)} km via IoT` : 'App GPS — IoT offline'}
                  </p>
                </div>
              )}

              <button
                onClick={handleEndTrip}
                disabled={endLoading}
                className={`w-full rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.97] transition-all ${tripStatus === 'COMPLETING' ? 'h-16 text-xl shadow-[var(--shadow-glow)]' : 'h-14 text-lg'}`}
              >
                {endLoading ? <Spinner /> : 'END TRIP'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCompletedSheet = () => {
    if (tripStatus !== 'COMPLETED') return null;
    return (
      <div className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col" style={{ animation: 'slideUp 0.4s ease-out' }}>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-12">
            <h2 className="text-2xl font-display font-semibold text-center mb-8">Trip Completed</h2>

            <div className="text-center mb-8">
              {isCash ? (
                <>
                  <p className="text-[var(--color-warning)] text-xs font-bold tracking-widest uppercase mb-3">Collect from Passenger</p>
                  <h1 className="text-6xl font-display font-bold text-[var(--color-earnings)] mb-3">
                    ₦{totalFare.toLocaleString()}
                  </h1>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                    {iotOn ? `${activeCashTrip.iotDistanceKm.toFixed(1)} km (IoT measured)` : 'App GPS — IoT was unavailable'}
                  </p>
                  {!cashCollected ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleCashCollected}
                        className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-success)] text-white font-display font-semibold text-lg shadow-[0_0_16px_rgba(74,222,128,0.3)] active:scale-[0.98] transition-transform"
                      >
                        I Collected the Cash
                      </button>
                      <button className="text-[var(--color-error)] text-sm font-medium underline underline-offset-4">
                        Passenger Refused to Pay
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[var(--color-success)]/15 border border-[var(--color-success)]/30 rounded-[var(--radius-md)] p-4 inline-flex items-center gap-2">
                      <CheckCircle size={18} className="text-[var(--color-success)]" />
                      <p className="text-[var(--color-success)] font-bold">Cash Collected</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-2">Total Fare</p>
                  <h1 className="text-6xl font-display font-bold text-[var(--color-earnings)] mb-4">
                    ₦{totalFare.toLocaleString()}
                  </h1>
                  <div className="bg-[var(--color-info)]/15 border border-[var(--color-info)]/30 rounded-[var(--radius-md)] p-3 inline-flex items-center gap-2">
                    <Wallet size={16} className="text-[var(--color-info)]" />
                    <p className="text-[var(--color-info)] font-bold text-sm">{activeTrip.paymentMethod === 'WALLET' ? 'Paid via Wallet' : 'Paid via Card'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Fare breakdown */}
            <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-5 mb-6 border border-[var(--color-surface-3)]">
              <h3 className="font-semibold mb-4 pb-2 border-b border-[var(--color-surface-3)]">Fare Breakdown</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Base Fare</span>
                  <span>₦{activeTrip.estimatedFare.toLocaleString()}</span>
                </div>
                {waitingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Waiting Fee</span>
                    <span>₦{waitingFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-[var(--color-surface-3)] text-base">
                  <span>Total</span>
                  <span className="text-[var(--color-earnings)]">₦{totalFare.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="text-center mb-8">
              <h3 className="font-semibold mb-1">Rate Your Passenger</h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">Help keep the Inquest community safe</p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setRating(s)} className="p-1 transition-transform active:scale-90">
                    <Star
                      size={36}
                      className={s <= rating ? 'text-[var(--color-warning)] fill-[var(--color-warning)]' : 'text-[var(--color-surface-3)]'}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[var(--color-surface-3)] bg-[var(--color-surface-1)] pb-safe">
          {(isCash && !cashCollected) && (
            <div className="flex items-center gap-2 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/25 rounded-[var(--radius-md)] p-3 mb-3">
              <AlertCircle size={14} className="text-[var(--color-warning)] shrink-0" />
              <p className="text-xs text-[var(--color-warning)]">Confirm cash collection before completing.</p>
            </div>
          )}
          {rating === 0 && (
            <div className="flex items-center gap-2 bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-3 mb-3">
              <AlertCircle size={14} className="text-[var(--color-text-muted)] shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)]">Rate the passenger to continue.</p>
            </div>
          )}
          <button
            onClick={handleDone}
            disabled={doneLoading || rating === 0 || (isCash && !cashCollected)}
            className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all shadow-[var(--shadow-glow)]"
          >
            {doneLoading ? <Spinner /> : 'DONE'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="absolute inset-0 z-0"><DriverMap /></div>

      {renderNavCard()}
      {renderPassengerBar()}
      {renderBottomPanel()}
      {renderCompletedSheet()}

      {/* SOS */}
      {tripStatus !== 'COMPLETED' && (
        <button
          onClick={handleSOS}
          className="absolute bottom-[268px] right-5 z-20 w-14 h-14 rounded-full bg-[var(--color-sos)] flex items-center justify-center shadow-lg shadow-red-500/30"
        >
          <ShieldAlert size={24} className="text-white" />
        </button>
      )}

      {/* CANCEL REASON SHEET */}
      {showCancelSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => !cancelLoading && setShowCancelSheet(false)}>
          <div
            className="bg-[var(--color-surface-1)] w-full rounded-t-[var(--radius-xl)] p-6 pb-safe max-h-[70vh] flex flex-col"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2 shrink-0">
              <h3 className="text-xl font-display font-semibold">Why are you cancelling?</h3>
              {!cancelLoading && (
                <button onClick={() => setShowCancelSheet(false)} className="p-2 bg-[var(--color-surface-2)] rounded-full">
                  <X size={20} />
                </button>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5 shrink-0">
              Frequent cancellations lower your acceptance rate.
            </p>

            <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pb-4">
              {CANCEL_REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => { setSelectedReason(r); setCancelError(''); }}
                  className={`w-full text-left px-4 py-3.5 rounded-[var(--radius-md)] border text-sm font-medium transition-all ${selectedReason === r ? 'border-[var(--color-error)] bg-[var(--color-error)]/10 text-[var(--color-error)]' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {cancelError && (
              <div className="flex items-center gap-2 bg-[var(--color-error)]/10 border border-[var(--color-error)]/25 rounded-[var(--radius-md)] p-3 mb-3 shrink-0">
                <AlertCircle size={14} className="text-[var(--color-error)] shrink-0" />
                <p className="text-xs text-[var(--color-error)]">{cancelError}</p>
              </div>
            )}

            <button
              onClick={handleConfirmCancel}
              disabled={cancelLoading || !selectedReason}
              className="w-full h-14 rounded-[var(--radius-pill)] bg-[var(--color-error)] text-white font-display font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-all shrink-0 mt-2"
            >
              {cancelLoading ? <Spinner /> : 'CONFIRM CANCEL'}
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
