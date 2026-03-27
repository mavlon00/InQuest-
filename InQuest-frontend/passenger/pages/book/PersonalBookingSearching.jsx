import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, X, AlertTriangle, RefreshCw, Home,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBookingStore } from '../../store/bookingStore';

// ─── Pulsing location icon ──────────────────────────────────────────────────
const pulseDot = new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:24px;height:24px;background:rgba(127,255,0,0.15);border-radius:50%;animation:marker-pulse 1.5s infinite;"></div>
      <div style="width:12px;height:12px;background:#7FFF00;border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(127,255,0,0.6);"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// ─── Format time mm:ss ───────────────────────────────────────────────────────
function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Cancel sheet ────────────────────────────────────────────────────────────
function CancelSheet({ onConfirm, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-end"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full bg-[var(--color-surface-1)] rounded-t-[28px] p-6 pb-10"
      >
        <h3 className="font-display text-lg font-semibold mb-2">Cancel search?</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          We'll stop searching for a driver and return you to home.
        </p>
        <button
          onClick={onConfirm}
          className="w-full py-4 rounded-2xl font-semibold bg-[var(--color-error)] text-white mb-3"
        >
          Yes, cancel
        </button>
        <button onClick={onClose} className="w-full py-3 text-sm text-[var(--color-text-muted)] font-semibold">
          Keep searching
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PersonalBookingSearching() {
  const navigate = useNavigate();
  const {
    bookingId, bookingStatus, pickup, destination, fareEstimate, isScheduled,
    setBooking, setActiveDriver, setETA, updateBookingStatus, resetBooking,
  } = useBookingStore();

  const TIMEOUT = 300; // 5 minutes
  const [countdown, setCountdown] = useState(TIMEOUT);
  const [noDriver, setNoDriver] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const pollingRef = useRef(null);
  const wsSimRef = useRef(null);

  const mapCenter = pickup ? [pickup.lat, pickup.lng] : [6.5244, 3.3792];

  useEffect(() => {
    // Guard
    if (!pickup || !destination) {
      navigate('/book/personal', { replace: true });
      return;
    }

    // Navigation on match - bookingStatus is updated by websocket.js
    if (bookingStatus === 'ACCEPTED') {
      navigate('/book/personal/matched', { replace: true });
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setNoDriver(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(pollingRef.current);
    };
  }, [bookingStatus, pickup, destination, navigate]);

  const handleCancel = async () => {
    try {
      const { cancelBooking } = useBookingStore.getState();
      await cancelBooking('User cancelled search');
      navigate('/home', { replace: true });
    } catch (e) {
      navigate('/home', { replace: true });
    }
  };

  const handleRetry = () => {
    setNoDriver(false);
    setCountdown(TIMEOUT);
    // Restart search is handled by createBooking which was already called before entering this page
    // We just wait for WS/Polling to find a driver
  };

  useEffect(() => {
    // Polling fallback every 6 seconds if WS is disconnected
    pollingRef.current = setInterval(async () => {
      if (bookingId && (bookingStatus === 'REQUESTED' || !bookingStatus)) {
        try {
          const api = (await import('../../utils/api')).default;
          const res = await api.get(`/rides/${bookingId}`);
          if (res.data.status === 'success' && res.data.data.status === 'CONFIRMED') {
            const ride = res.data.data;
            setBooking(ride.id, 'ACCEPTED');
            setActiveDriver({
              id: ride.driver_id,
              name: 'Driver Found',
              rating: 4.9,
              plate: 'KJA-123',
              photoUrl: null
            });
            navigate('/book/personal/matched', { replace: true });
          }
        } catch (e) { console.error("Poll error", e); }
      }
    }, 6000);

    return () => clearInterval(pollingRef.current);
  }, [bookingId, bookingStatus]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--color-bg)]">
      {/* Map */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {pickup && (
            <>
              <Marker position={mapCenter} icon={pulseDot} />
              {/* Animated search radius rings */}
              <Circle
                center={mapCenter}
                radius={500}
                pathOptions={{ color: '#7FFF00', fillColor: '#7FFF00', fillOpacity: 0.05, weight: 1 }}
              />
              <Circle
                center={mapCenter}
                radius={1000}
                pathOptions={{ color: '#7FFF00', fillColor: 'transparent', fillOpacity: 0, weight: 1, opacity: 0.3 }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Animated ring overlays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 2 }}>
        {[0, 0.8, 1.6].map((delay) => (
          <motion.div
            key={delay}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 4], opacity: [0, 0.4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay, ease: 'easeOut' }}
            className="absolute w-24 h-24 border-2 border-[var(--color-primary)] rounded-full"
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          zIndex: 3,
          height: '60%',
          background: 'linear-gradient(to top, rgba(26,36,33,1) 50%, transparent)',
        }}
      />

      {/* Back button */}
      <button
        onClick={() => setShowCancel(true)}
        className="absolute top-10 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <ChevronLeft size={22} className="text-white" />
      </button>

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 px-5 pb-10 space-y-5" style={{ zIndex: 10 }}>
        <div className="text-center">
          {/* Spinning keke icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'rgba(127,255,0,0.15)', border: '2px solid var(--color-primary)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                className="text-3xl"
              >
                🛺
              </motion.div>
            </div>
          </div>
          <h2 className="font-display text-2xl font-semibold mb-1">Finding your driver…</h2>
          <p className="text-sm text-[var(--color-text-muted)]">We are searching for kekes near you.</p>
        </div>

        {/* Countdown bar */}
        <div className="space-y-2">
          <div className="w-full h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-[var(--color-primary)] rounded-full"
            />
          </div>
          <p className="text-xs text-[var(--color-text-muted)] text-center">
            Search times out in {fmtTime(countdown)}
          </p>
        </div>

        {/* Trip summary */}
        {pickup && destination && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-text-muted)] truncate">{pickup.address}</p>
              <div className="w-px h-3 bg-white/20 ml-2 my-0.5" />
              <p className="text-xs font-semibold truncate">{destination.address}</p>
            </div>
            <p className="text-sm font-display font-semibold" style={{ color: 'var(--color-primary)' }}>
              NGN {fareEstimate?.totalFare?.toLocaleString() || '—'}
            </p>
          </div>
        )}

        {/* Cancel link */}
        <button
          onClick={() => setShowCancel(true)}
          className="w-full text-sm text-[var(--color-text-muted)] font-semibold text-center py-2"
        >
          Cancel search
        </button>
      </div>

      {/* Cancel sheet */}
      <AnimatePresence>
        {showCancel && (
          <CancelSheet onConfirm={handleCancel} onClose={() => setShowCancel(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
