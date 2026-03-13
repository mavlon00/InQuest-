import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import DriverNavBar from '../../app/components/DriverNavBar';
import { ArrowLeft, X, CheckCircle, Wifi } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const fmt = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

const PAGE_SIZE = 10;

// ── Mock data ─────────────────────────────────────────────────────
const generateTrips = () => {
  const methods  = ['WALLET', 'CASH', 'CARD'];
  const routes   = [
    'Lekki Ph1 → Victoria Island',
    'Ajah → Sangotedo',
    'Yaba → Surulere',
    'Oshodi → Ikeja',
    'Maryland → Yaba',
    'Ikeja → Lagos Island',
    'Lekki Ph1 → Chevron',
    'Surulere → Mushin',
    'VI → Ikoyi',
    'Apapa → Orile',
  ];
  const now = Date.now();
  return Array.from({ length: 42 }, (_, i) => ({
    id:     `t_${i + 1}`,
    time:   new Date(now - i * 28 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date:   new Date(now - i * 28 * 60 * 1000),
    route:  routes[i % routes.length],
    fare:   400 + Math.floor(Math.random() * 900),
    method: methods[i % 3],
    iotVerified: i % 8 !== 0,
    waitingFee:  i % 5 === 0 ? 90 : 0,
    insurance:   i % 4 === 0,
  }));
};

const ALL_TRIPS = generateTrips();

const weekChartData = [
  { name: 'Mon', net: 10200 },
  { name: 'Tue', net: 14700 },
  { name: 'Wed', net: 8900  },
  { name: 'Thu', net: 18400 },
  { name: 'Fri', net: 21000 },
  { name: 'Sat', net: 24600 },
  { name: 'Sun', net: 14200 },
];

const monthChartData = Array.from({ length: 30 }, (_, i) => ({
  name: `${i + 1}`,
  net: 4000 + Math.floor(Math.random() * 18000),
}));

const PERIOD_SUMMARY = {
  TODAY: {
    gross: 14200, commission: 2130, kekeFee: 3500, net: 8570, maintenance: 429,
    toMain: 8141, trips: 11, hours: 6.5, avgPerTrip: 1290,
  },
  'THIS WEEK': {
    gross: 87400, commission: 13110, kekeFee: 24500, net: 49790, maintenance: 2490,
    toMain: 47300, trips: 68, hours: 41, avgPerTrip: 1285,
  },
  'THIS MONTH': {
    gross: 312000, commission: 46800, kekeFee: 87500, net: 177700, maintenance: 8885,
    toMain: 168815, trips: 247, hours: 162, avgPerTrip: 1263,
  },
};

const methodColors = {
  WALLET: 'var(--color-info)',
  CASH:   'var(--color-warning)',
  CARD:   'var(--color-success)',
};

// ── Custom Bar Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--color-surface-0)] border border-[var(--color-surface-3)] rounded-lg px-3 py-2 text-xs">
      <p className="text-[var(--color-text-muted)] mb-0.5">{label}</p>
      <p className="font-display font-bold text-[var(--color-earnings)]">{fmt(payload[0].value)}</p>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export default function DriverEarnings() {
  const navigate = useNavigate();
  const [period, setPeriod]               = useState('TODAY');
  const [page, setPage]                   = useState(1);
  const [selectedTrip, setSelectedTrip]   = useState(null);

  const summary = PERIOD_SUMMARY[period];
  const chartData = period === 'THIS MONTH' ? monthChartData : weekChartData;

  // Filter trips by period (simplified: all trips for demo)
  const visibleTrips = useMemo(() => ALL_TRIPS.slice(0, page * PAGE_SIZE), [page]);
  const hasMore = page * PAGE_SIZE < ALL_TRIPS.length;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-display font-semibold flex-1">Earnings</h1>
      </header>

      <div className="px-4 py-4 space-y-5">

        {/* Period tabs */}
        <div className="flex bg-[var(--color-surface-2)] rounded-[var(--radius-pill)] p-1">
          {['TODAY', 'THIS WEEK', 'THIS MONTH'].map(p => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setPage(1); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-[var(--radius-pill)] transition-all ${period === p ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Summary hero card */}
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-5 border border-[var(--color-primary)]/20 shadow-[var(--shadow-glow)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[var(--color-primary)]/5 blur-3xl pointer-events-none" />

          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Net Earnings</p>
          <h2 className="text-4xl font-display font-bold text-[var(--color-earnings)] mb-4">{fmt(summary.toMain)}</h2>

          {/* Stat row */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-[var(--color-surface-2)]/70 rounded-[var(--radius-md)] p-2.5 text-center">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Trips</p>
              <p className="font-display font-bold text-sm">{summary.trips}</p>
            </div>
            <div className="flex-1 bg-[var(--color-surface-2)]/70 rounded-[var(--radius-md)] p-2.5 text-center">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Hours</p>
              <p className="font-display font-bold text-sm">{summary.hours}h</p>
            </div>
            <div className="flex-1 bg-[var(--color-surface-2)]/70 rounded-[var(--radius-md)] p-2.5 text-center">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Avg/Trip</p>
              <p className="font-display font-bold text-sm">₦{summary.avgPerTrip.toLocaleString()}</p>
            </div>
          </div>

          {/* Deduction breakdown */}
          <div className="space-y-2 text-sm border-t border-[var(--color-surface-3)] pt-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Gross Earnings</span>
              <span className="font-medium">{fmt(summary.gross)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-error)]">
              <span>− Platform Commission (15%)</span>
              <span>−{fmt(summary.commission)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-error)]">
              <span>− Keke Usage Fee</span>
              <span>−{fmt(summary.kekeFee)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-warning)]">
              <span>− Maintenance Savings (5%)</span>
              <span>−{fmt(summary.maintenance)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1 border-t border-[var(--color-surface-3)]">
              <span>Net to Savings</span>
              <span className="text-[var(--color-earnings)]">{fmt(summary.toMain)}</span>
            </div>
          </div>
        </div>

        {/* Bar Chart (week / month only) */}
        {period !== 'TODAY' && (
          <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-surface-3)]">
            <p className="text-sm font-semibold mb-4 text-[var(--color-text-secondary)]">Daily Net Earnings</p>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="net" radius={[5, 5, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.name === (period === 'THIS WEEK' ? 'Sun' : `${new Date().getDate()}`) ? 'var(--color-primary)' : 'var(--color-primary)'}
                        opacity={i === chartData.length - 1 ? 1 : 0.55}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Trip list */}
        <div>
          <p className="text-sm font-semibold mb-3">Trip History ({ALL_TRIPS.length} trips)</p>
          <div className="space-y-2">
            {visibleTrips.map(trip => (
              <button
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-md)] px-4 py-3 border border-[var(--color-surface-3)] flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
              >
                {/* IoT badge */}
                <div className={`w-1.5 h-10 rounded-full shrink-0 ${trip.iotVerified ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{trip.time}</p>
                  <p className="text-sm font-medium truncate">{trip.route}</p>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm mt-0.5 inline-block"
                    style={{ color: methodColors[trip.method], backgroundColor: `${methodColors[trip.method]}1A` }}
                  >
                    {trip.method}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-[var(--color-earnings)]">{fmt(trip.fare)}</p>
                  {trip.iotVerified
                    ? <p className="text-[10px] text-[var(--color-success)]">IoT ✓</p>
                    : <p className="text-[10px] text-[var(--color-warning)]">Pending</p>
                  }
                </div>
              </button>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full mt-4 h-12 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-white transition-colors"
            >
              Load More ({ALL_TRIPS.length - visibleTrips.length} remaining)
            </button>
          )}
        </div>
      </div>

      {/* TRIP DETAIL SHEET */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setSelectedTrip(null)}>
          <div
            className="bg-[var(--color-surface-1)] w-full rounded-t-[var(--radius-xl)] p-6 pb-safe"
            style={{ animation: 'slideUp 0.3s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-xl font-display font-semibold">Trip Detail</h3>
                <p className="text-xs text-[var(--color-text-muted)]">{selectedTrip.time} · {selectedTrip.date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
              </div>
              <button onClick={() => setSelectedTrip(null)} className="p-2 bg-[var(--color-surface-2)] rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Route */}
            <div className="bg-[var(--color-surface-2)] rounded-[var(--radius-md)] p-4 mb-4">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Route</p>
              <p className="font-medium">{selectedTrip.route}</p>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-5">
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ color: methodColors[selectedTrip.method], backgroundColor: `${methodColors[selectedTrip.method]}20` }}
              >
                {selectedTrip.method}
              </span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${selectedTrip.iotVerified ? 'text-[var(--color-success)] bg-[var(--color-success)]/15' : 'text-[var(--color-warning)] bg-[var(--color-warning)]/15'}`}>
                {selectedTrip.iotVerified ? <><CheckCircle size={11} /> IoT Verified</> : <><Wifi size={11} /> Pending</>}
              </span>
            </div>

            {/* Fare breakdown */}
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Base Fare</span>
                <span className="font-medium">{fmt(selectedTrip.fare - selectedTrip.waitingFee)}</span>
              </div>
              {selectedTrip.waitingFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Waiting Fee</span>
                  <span className="font-medium">{fmt(selectedTrip.waitingFee)}</span>
                </div>
              )}
              {selectedTrip.insurance && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Insurance</span>
                  <span className="font-medium">{fmt(50)}</span>
                </div>
              )}
              <div className="h-px bg-[var(--color-surface-3)]" />
              <div className="flex justify-between font-bold text-base">
                <span>Total Fare</span>
                <span className="text-[var(--color-earnings)]">{fmt(selectedTrip.fare + (selectedTrip.insurance ? 50 : 0))}</span>
              </div>
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
