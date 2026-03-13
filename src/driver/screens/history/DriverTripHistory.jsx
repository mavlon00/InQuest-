import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import DriverNavBar from '../../app/components/DriverNavBar';
import {
  ArrowLeft, Search, X, CheckCircle, XCircle, Wifi, WifiOff,
  MapPin, Clock, AlertTriangle, ChevronRight, Star
} from 'lucide-react';

const PAGE_SIZE = 10;

const fmt = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

const fmtDate = (date) =>
  new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDuration = (min) => `${min} min`;

// ── Mock history data (30 trips) ─────────────────────────────────
const ROUTES = [
  ['Lekki Phase 1', 'Victoria Island'],
  ['Ajah', 'Sangotedo'],
  ['Yaba', 'Surulere'],
  ['Oshodi', 'Ikeja'],
  ['Maryland', 'Yaba'],
  ['Ikeja', 'Lagos Island'],
  ['Lekki Phase 1', 'Chevron'],
  ['Surulere', 'Mushin'],
  ['Victoria Island', 'Ikoyi'],
  ['Apapa', 'Orile'],
];
const METHODS  = ['WALLET', 'CASH', 'CARD'];
const NAMES    = ['Amaka', 'Emeka', 'Ngozi', 'Bola', 'Chidi', 'Tunde', 'Sola', 'Kemi'];

const MOCK_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const [pickup, destination] = ROUTES[i % ROUTES.length];
  const status = i % 6 === 0 ? 'CANCELLED' : 'COMPLETED';
  const daysAgo = Math.floor(i / 4);
  const hoursAgo = (i % 4) * 6;
  const date = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);
  return {
    id:          `hist_${i + 1}`,
    timestamp:   date,
    pickup,
    destination,
    fare:        status === 'CANCELLED' ? 0 : 400 + (i * 73) % 900,
    duration:    15 + (i * 7) % 40,
    paymentMethod: METHODS[i % 3],
    status,
    iotVerified: status === 'COMPLETED' && i % 7 !== 0,
    passengerName: NAMES[i % NAMES.length],
    passengerRating: status === 'COMPLETED' ? 3 + (i % 3) : null,
    cancelReason: status === 'CANCELLED' ? 'Passenger no-show' : null,
  };
});

const methodColors = {
  WALLET: 'var(--color-info)',
  CASH:   'var(--color-warning)',
  CARD:   'var(--color-success)',
};

// 48-hour dispute window check
const withinDisputeWindow = (date) =>
  Date.now() - new Date(date).getTime() < 48 * 60 * 60 * 1000;

// ── Mini Map placeholder ─────────────────────────────────────────
function MiniMapPlaceholder({ pickup, destination }) {
  return (
    <div className="relative h-[140px] bg-[var(--color-surface-2)] rounded-[var(--radius-md)] overflow-hidden flex items-center justify-center border border-[var(--color-surface-3)]">
      {/* Simulated road lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 140" preserveAspectRatio="none">
        <path d="M0 70 Q50 30 100 70 T200 70" stroke="#7FFF00" strokeWidth="3" fill="none" />
        <path d="M0 90 Q70 50 140 80 T200 80" stroke="#7FFF00" strokeWidth="1.5" fill="none" />
        <path d="M20 0 L30 140" stroke="#555" strokeWidth="1" fill="none" />
        <path d="M80 0 L90 140" stroke="#555" strokeWidth="1" fill="none" />
        <path d="M150 0 L160 140" stroke="#555" strokeWidth="1" fill="none" />
      </svg>
      <div className="flex items-center gap-6 z-10">
        <div className="flex flex-col items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[var(--color-success)] border-2 border-white" />
          <p className="text-[10px] text-[var(--color-text-secondary)] text-center max-w-[60px]">{pickup}</p>
        </div>
        <div className="w-12 h-px bg-[var(--color-primary)]/40" style={{ backgroundImage: 'repeating-linear-gradient(90deg,var(--color-primary) 0,var(--color-primary) 4px,transparent 4px,transparent 10px)' }} />
        <div className="flex flex-col items-center gap-1">
          <MapPin size={14} className="text-[var(--color-error)]" />
          <p className="text-[10px] text-[var(--color-text-secondary)] text-center max-w-[60px]">{destination}</p>
        </div>
      </div>
      <p className="absolute bottom-2 right-2 text-[9px] text-[var(--color-text-muted)]">Route map</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function DriverTripHistory() {
  const navigate = useNavigate();

  const [filter,       setFilter]       = useState('ALL');   // ALL | COMPLETED | CANCELLED
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDispute,  setShowDispute]  = useState(false);
  const [disputeText,  setDisputeText]  = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [disputeSent,  setDisputeSent]  = useState(false);

  const filtered = useMemo(() => {
    let list = MOCK_HISTORY;
    if (filter !== 'ALL') list = list.filter(t => t.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(t =>
        t.pickup.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        fmtDate(t.timestamp).toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search]);

  const visible  = filtered.slice(0, page * PAGE_SIZE);
  const hasMore  = visible.length < filtered.length;

  const openDetail = (trip) => {
    setSelectedTrip(trip);
    setShowDispute(false);
    setDisputeText('');
    setDisputeSent(false);
  };

  const handleDispute = async () => {
    if (!disputeText.trim()) return;
    setDisputeLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setDisputeSent(true);
    } finally {
      setDisputeLoading(false);
    }
  };

  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-display font-semibold flex-1">Trip History</h1>
      </header>

      <div className="px-4 py-4 space-y-4">

        {/* Filter tabs */}
        <div className="flex bg-[var(--color-surface-2)] rounded-[var(--radius-pill)] p-1">
          {['ALL', 'COMPLETED', 'CANCELLED'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-[var(--radius-pill)] transition-all ${filter === f ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by area or date…"
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] h-12 pl-11 pr-10 text-white placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary)] outline-none transition-colors text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              <X size={16} className="text-[var(--color-text-muted)]" />
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-xs text-[var(--color-text-muted)]">
          {filtered.length} {filtered.length === 1 ? 'trip' : 'trips'} found
        </p>

        {/* Trip list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--color-text-muted)] text-sm">No trips found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map(trip => (
              <button
                key={trip.id}
                onClick={() => openDetail(trip)}
                className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-md)] px-4 py-3.5 border border-[var(--color-surface-3)] flex items-start gap-3 active:scale-[0.99] transition-transform text-left"
              >
                {/* Status dot */}
                <div className="mt-1 shrink-0">
                  {trip.status === 'COMPLETED'
                    ? <CheckCircle size={16} className="text-[var(--color-success)]" />
                    : <XCircle    size={16} className="text-[var(--color-error)]"   />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-[var(--color-text-muted)]">{fmtDate(trip.timestamp)} · {fmtTime(trip.timestamp)}</p>
                    {trip.status === 'CANCELLED' && (
                      <span className="text-[10px] font-bold text-[var(--color-error)] bg-[var(--color-error)]/10 px-1.5 py-0.5 rounded-sm">CANCELLED</span>
                    )}
                  </div>
                  <p className="text-sm font-medium truncate">
                    {trip.pickup} → {trip.destination}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[var(--color-text-muted)]">{fmtDuration(trip.duration)}</span>
                    {trip.status === 'COMPLETED' && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                        style={{ color: methodColors[trip.paymentMethod], backgroundColor: `${methodColors[trip.paymentMethod]}1A` }}
                      >
                        {trip.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {trip.status === 'COMPLETED' ? (
                    <>
                      <p className="font-display font-bold text-[var(--color-earnings)]">{fmt(trip.fare)}</p>
                      {trip.iotVerified
                        ? <p className="text-[10px] text-[var(--color-success)]">IoT ✓</p>
                        : <p className="text-[10px] text-[var(--color-warning)]">Pending</p>
                      }
                    </>
                  ) : (
                    <p className="text-[10px] text-[var(--color-error)]">{trip.cancelReason}</p>
                  )}
                  <ChevronRight size={14} className="text-[var(--color-text-muted)] ml-auto mt-1" />
                </div>
              </button>
            ))}

            {hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-full mt-2 h-12 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                Load More ({filtered.length - visible.length} remaining)
              </button>
            )}
          </div>
        )}
      </div>

      {/* TRIP DETAIL SHEET */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setSelectedTrip(null)}>
          <div
            className="bg-[var(--color-surface-1)] w-full rounded-t-[var(--radius-xl)] max-h-[90vh] overflow-y-auto pb-safe"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet header */}
            <div className="flex justify-between items-center p-6 pb-4 sticky top-0 bg-[var(--color-surface-1)] z-10 border-b border-[var(--color-surface-3)]">
              <div>
                <h3 className="text-xl font-display font-semibold">Trip Detail</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{fmtDate(selectedTrip.timestamp)} · {fmtTime(selectedTrip.timestamp)}</p>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="p-2 bg-[var(--color-surface-2)] rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Mini map */}
              <MiniMapPlaceholder pickup={selectedTrip.pickup} destination={selectedTrip.destination} />

              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${selectedTrip.status === 'COMPLETED' ? 'text-[var(--color-success)] bg-[var(--color-success)]/15' : 'text-[var(--color-error)] bg-[var(--color-error)]/15'}`}>
                  {selectedTrip.status}
                </span>
                {selectedTrip.status === 'COMPLETED' && (
                  <>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ color: methodColors[selectedTrip.paymentMethod], backgroundColor: `${methodColors[selectedTrip.paymentMethod]}20` }}>
                      {selectedTrip.paymentMethod}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${selectedTrip.iotVerified ? 'text-[var(--color-success)] bg-[var(--color-success)]/15' : 'text-[var(--color-warning)] bg-[var(--color-warning)]/15'}`}>
                      {selectedTrip.iotVerified ? <><Wifi size={10} /> IoT Verified</> : <><WifiOff size={10} /> Pending</>}
                    </span>
                  </>
                )}
              </div>

              {/* Route + stats */}
              <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Pickup</span>
                  <span className="font-medium text-right">{selectedTrip.pickup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Destination</span>
                  <span className="font-medium text-right">{selectedTrip.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Duration</span>
                  <span className="font-medium">{fmtDuration(selectedTrip.duration)}</span>
                </div>
                {selectedTrip.status === 'COMPLETED' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Passenger</span>
                      <span className="font-medium">{selectedTrip.passengerName}</span>
                    </div>
                    {selectedTrip.passengerRating && (
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-secondary)]">Your rating</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} className={i < selectedTrip.passengerRating ? 'text-[var(--color-warning)] fill-[var(--color-warning)]' : 'text-[var(--color-surface-3)]'} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="h-px bg-[var(--color-surface-3)]" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Fare</span>
                      <span className="text-[var(--color-earnings)]">{fmt(selectedTrip.fare)}</span>
                    </div>
                  </>
                )}
                {selectedTrip.status === 'CANCELLED' && selectedTrip.cancelReason && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Cancel Reason</span>
                    <span className="text-[var(--color-error)] font-medium text-right max-w-[60%]">{selectedTrip.cancelReason}</span>
                  </div>
                )}
              </div>

              {/* Dispute button — COMPLETED trips only, within 48h */}
              {selectedTrip.status === 'COMPLETED' && withinDisputeWindow(selectedTrip.timestamp) && !showDispute && !disputeSent && (
                <button
                  onClick={() => setShowDispute(true)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-[var(--radius-pill)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)] text-sm font-semibold transition-colors active:scale-[0.98]"
                >
                  <AlertTriangle size={16} /> Dispute This Trip
                </button>
              )}

              {selectedTrip.status === 'COMPLETED' && !withinDisputeWindow(selectedTrip.timestamp) && (
                <p className="text-xs text-[var(--color-text-muted)] text-center">
                  Dispute window closed (48 hours have passed).
                </p>
              )}

              {/* Dispute form */}
              {showDispute && !disputeSent && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[var(--color-warning)]">File a Dispute</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Describe the issue. Our team will review within 24 hours.</p>
                  <textarea
                    value={disputeText}
                    onChange={e => setDisputeText(e.target.value)}
                    placeholder="Describe the issue with this trip…"
                    rows={4}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] p-4 text-white focus:border-[var(--color-warning)] outline-none resize-none text-sm placeholder-[var(--color-text-muted)] transition-colors"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDispute(false)}
                      className="flex-1 h-11 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDispute}
                      disabled={!disputeText.trim() || disputeLoading}
                      className="flex-[2] h-11 rounded-[var(--radius-pill)] bg-[var(--color-warning)] text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      {disputeLoading ? <Spinner /> : 'Submit Dispute'}
                    </button>
                  </div>
                </div>
              )}

              {/* Dispute confirmation */}
              {disputeSent && (
                <div className="bg-[var(--color-success)]/10 border border-[var(--color-success)]/25 rounded-[var(--radius-md)] p-4 flex items-center gap-3">
                  <CheckCircle size={18} className="text-[var(--color-success)] shrink-0" />
                  <p className="text-sm text-[var(--color-success)] font-medium">Dispute submitted. We'll review within 24 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DriverNavBar />

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
}
