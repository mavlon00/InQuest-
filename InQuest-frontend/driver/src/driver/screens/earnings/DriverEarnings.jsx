import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import DriverNavBar from '../../app/components/DriverNavBar';
import { ArrowLeft, X, CheckCircle, Wifi, AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../../utils/api';

const fmt = (n) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(n);

const PAGE_SIZE = 10;

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

export default function DriverEarnings() {
  const navigate = useNavigate();
  const { walletBalance, tripHistory } = useDriverStore();
  const [period, setPeriod] = useState('TODAY');
  const [page, setPage] = useState(1);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/wallet/balance');
        if (response.data.status === 'success') {
          setEarningsData({
            gross: tripHistory.reduce((acc, t) => acc + (t.fare || 0), 0),
            trips: tripHistory.length,
            net: response.data.data.balance || walletBalance
          });
        }
      } catch (err) {
        setEarningsData({
          gross: tripHistory.reduce((acc, t) => acc + (t.fare || 0), 0),
          trips: tripHistory.length,
          net: walletBalance
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, [tripHistory, walletBalance]);

  const summary = useMemo(() => {
    if (!earningsData) return { gross: 0, commission: 0, net: 0, trips: 0, hours: 0, avgPerTrip: 0 };
    const gross = earningsData.gross;
    const commission = gross * 0.15;
    const net = gross - commission;
    return {
       gross,
       commission,
       kekeFee: 0,
       maintenance: gross * 0.05,
       toMain: walletBalance,
       trips: earningsData.trips,
       hours: (earningsData.trips * 0.5).toFixed(1), // estimate
       avgPerTrip: earningsData.trips > 0 ? (gross / earningsData.trips) : 0
    };
  }, [earningsData, walletBalance]);

  const visibleTrips = useMemo(() => tripHistory.slice(0, page * PAGE_SIZE), [tripHistory, page]);
  const hasMore = page * PAGE_SIZE < tripHistory.length;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-24">
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-display font-semibold flex-1">Earnings</h1>
      </header>

      <div className="px-4 py-4 space-y-5">
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

        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-5 border border-[var(--color-primary)]/20 shadow-[var(--shadow-glow)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[var(--color-primary)]/5 blur-3xl pointer-events-none" />
          <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Current Balance</p>
          <h2 className="text-4xl font-display font-bold text-[var(--color-earnings)] mb-4">{fmt(walletBalance)}</h2>
          
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
              <p className="font-display font-bold text-sm">₦{Math.round(summary.avgPerTrip).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm border-t border-[var(--color-surface-3)] pt-3">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Total Gross</span>
              <span className="font-medium">{fmt(summary.gross)}</span>
            </div>
            {summary.gross > 0 && (
              <div className="flex justify-between text-[var(--color-error)] text-[10px] italic">
                <span>Calculated from available trip history data.</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-1 border-t border-[var(--color-surface-3)]">
              <span>Withdrawable</span>
              <span className="text-[var(--color-earnings)]">{fmt(walletBalance)}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3">Trip History ({tripHistory.length} trips)</p>
          {tripHistory.length > 0 ? (
            <div className="space-y-2">
              {visibleTrips.map(trip => (
                <button
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-md)] px-4 py-3 border border-[var(--color-surface-3)] flex items-center gap-3 active:scale-[0.99] transition-transform text-left"
                >
                  <div className={`w-1.5 h-10 rounded-full shrink-0 ${trip.status === 'Completed' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--color-text-muted)] mb-0.5">{trip.date}</p>
                    <p className="text-sm font-medium truncate">{trip.dropoff || 'On-Spot Trip'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-[var(--color-earnings)]">{fmt(trip.fare)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center px-8 border border-dashed border-[var(--color-surface-3)] rounded-[var(--radius-xl)] bg-[var(--color-surface-1)]/50">
              <AlertCircle size={32} className="text-[var(--color-text-muted)] mb-3 opacity-20" />
              <p className="text-[var(--color-text-secondary)] font-medium mb-1">No trip data available</p>
              <p className="text-[var(--color-text-muted)] text-xs">When you complete rides, your earnings breakdown will appear here.</p>
            </div>
          )}

          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full mt-4 h-12 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] border border-[var(--color-surface-3)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-white transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      </div>

      <DriverNavBar />
    </div>
  );
}
