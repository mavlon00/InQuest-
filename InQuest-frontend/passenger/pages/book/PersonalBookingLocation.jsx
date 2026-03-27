import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MapPin, Navigation, Plus, X, Home, Briefcase,
  Star, Clock, User, Users, Phone, Loader2, Search, AlertCircle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBookingStore } from '../../store/bookingStore';

// ─── Map icons ─────────────────────────────────────────────────────────────────
const makeIcon = (color, size = 14) =>
  new L.DivIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const pickupIcon = makeIcon('#7FFF00', 16);
const destinationIcon = makeIcon('#EF4444', 16);
const stopIcon = makeIcon('#8A9E9A', 12);
const pulseDot = new L.DivIcon({
  className: '',
  html: `<div class="keke-pulse" style="width:14px;height:14px;background:#7FFF00;border-radius:50%;border:2px solid white;box-shadow:0 0 12px rgba(127,255,0,0.6);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// ─── Map camera controller ──────────────────────────────────────────────────────
function MapFitter({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [80, 80], animate: true });
  }, [JSON.stringify(positions)]);
  return null;
}

// ─── Geocode helpers (mock) ────────────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    if (!res.ok) return 'Unknown Location';
    const data = await res.json();
    return data.display_name || 'Selected Location';
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return 'Unknown Location';
  }
}

// ─── Address autocomplete suggestions (mock + Nominatim) ─────────────────────
async function searchPlaces(query) {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(item => ({
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error('Search places error:', error);
    return [];
  }
}

// ─── Toggle switch component ──────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)]'}`}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

// ─── Address input field ───────────────────────────────────────────────────────
function AddressField({ label, value, placeholder, icon, iconColor, onChange, onSelect, onClear }) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value?.address || '');
  }, [value?.address]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    onChange(q);
    clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchPlaces(q);
      setSuggestions(results);
      setLoading(false);
    }, 400);
  };

  const handleSelect = (place) => {
    setQuery(place.address);
    setSuggestions([]);
    setFocused(false);
    onSelect(place);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    onChange('');
    onClear && onClear();
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <p className="text-[11px] font-semibold tracking-widest text-[var(--color-text-muted)] mb-1.5 px-1 uppercase">
        {label}
      </p>
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all ${
          focused
            ? 'border-[var(--color-primary)] bg-[var(--color-surface-2)] shadow-[0_0_0_1px_var(--color-primary)]'
            : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-2)]'
        }`}
      >
        <span style={{ color: iconColor }} className="flex-shrink-0">{icon}</span>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-semibold outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        />
        {loading && <Loader2 size={16} className="text-[var(--color-text-muted)] animate-spin flex-shrink-0" />}
        {query && !loading && (
          <button onClick={handleClear} className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-[var(--color-surface-1)] rounded-xl border border-[var(--color-border-subtle)] shadow-lg overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onMouseDown={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <MapPin size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
                <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {s.address}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PersonalBookingLocation() {
  const navigate = useNavigate();
  const {
    pickup, destination, stops, guest,
    setPickup, setDestination, addStop, removeStop, setGuest, resetBooking,
  } = useBookingStore();

  const [mapCenter, setMapCenter] = useState([6.5244, 3.3792]);
  const [gpsStatus, setGpsStatus] = useState('detecting'); // detecting | ready | error
  const [bookingForOther, setBookingForOther] = useState(!!guest);
  const [guestName, setGuestName] = useState(guest?.name || '');
  const [guestPhone, setGuestPhone] = useState(guest?.phone || '');
  const [stopInputs, setStopInputs] = useState(stops);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [showLocationError, setShowLocationError] = useState(false);

  // ── GPS detection on mount ───────────────────────────────────────────────────
  useEffect(() => {
    resetBooking();
    // Load mock saved places & recent trips
    setSavedPlaces([]);
    setRecentTrips([]);

    if (!navigator.geolocation) {
      setGpsStatus('error');
      setShowLocationError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMapCenter([lat, lng]);
        const address = await reverseGeocode(lat, lng);
        const pickupData = { lat, lng, address };
        setPickup(pickupData);
        setGpsStatus('ready');
      },
      () => {
        // Fall back securely to a simulated location if GPS is denied/unavailable
        const fallback = { lat: 6.5244, lng: 3.3792, address: 'Current Location (Simulated)' };
        setPickup(fallback);
        setMapCenter([fallback.lat, fallback.lng]);
        setGpsStatus('ready');
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // ── Sync stop inputs with store ──────────────────────────────────────────────
  useEffect(() => {
    setStopInputs(stops);
  }, [stops]);

  // ── Map positions for camera fitting ─────────────────────────────────────────
  const mapPositions = [
    pickup ? [pickup.lat, pickup.lng] : null,
    ...stopInputs.filter(Boolean).map((s) => s ? [s.lat, s.lng] : null),
    destination ? [destination.lat, destination.lng] : null,
  ].filter(Boolean);

  // ── Polyline positions ───────────────────────────────────────────────────────
  const polylinePositions = [
    pickup ? [pickup.lat, pickup.lng] : null,
    ...stopInputs.filter(Boolean).map((s) => [s.lat, s.lng]),
    destination ? [destination.lat, destination.lng] : null,
  ].filter(Boolean);

  // ── Add stop ─────────────────────────────────────────────────────────────────
  const handleAddStop = () => {
    if (stopInputs.length >= 3) return;
    const newStop = null;
    setStopInputs((prev) => [...prev, newStop]);
  };

  const handleRemoveStop = (index) => {
    setStopInputs((prev) => prev.filter((_, i) => i !== index));
    removeStop(index);
  };

  const handleStopSelect = (index, place) => {
    const updated = [...stopInputs];
    updated[index] = place;
    setStopInputs(updated);
    // Sync to store
    updated.forEach((s, i) => {
      if (s && i === index) addStop(s);
    });
  };

  // ── Guest toggle ──────────────────────────────────────────────────────────────
  const handleGuestToggle = (enabled) => {
    setBookingForOther(enabled);
    if (!enabled) setGuest(null);
  };

  // ── Proceed to estimate ───────────────────────────────────────────────────────
  const handleContinue = () => {
    if (!destination) return;
    // Sync guest if booking for other
    if (bookingForOther && guestName && guestPhone) {
      setGuest({ name: guestName, phone: `+234${guestPhone.replace(/^0/, '')}` });
    }
    navigate('/book/personal/estimate');
  };

  const canContinue = !!pickup && !!destination;

  // ── Location error sheet ───────────────────────────────────────────────────
  if (showLocationError && gpsStatus !== 'ready') {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center p-8 z-50">
        <AlertCircle size={56} className="text-[var(--color-warning)] mb-4" />
        <h2 className="text-xl font-display font-semibold text-center mb-2">Location access needed</h2>
        <p className="text-sm text-[var(--color-text-muted)] text-center mb-8">
          Please enable location access so we can set your pickup automatically. You can also enter your address manually.
        </p>
        <button
          onClick={() => { setShowLocationError(false); setGpsStatus('ready'); }}
          className="w-full py-4 bg-[var(--color-primary)] text-black font-semibold rounded-xl mb-3"
        >
          Enter address manually
        </button>
        <button onClick={() => navigate(-1)} className="text-sm text-[var(--color-text-muted)]">
          Go back
        </button>
      </div>
    );
  }

  if (gpsStatus === 'detecting') {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-[var(--color-primary)] animate-spin mb-4" />
        <p className="text-sm text-[var(--color-text-muted)]">Finding your location…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--color-bg)]">
      {/* ── Map Background ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapFitter positions={mapPositions} />

          {/* Pickup marker */}
          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pulseDot} />
          )}

          {/* Stop markers */}
          {stopInputs.filter(Boolean).map((s, i) => (
            <Marker key={i} position={[s.lat, s.lng]} icon={stopIcon} />
          ))}

          {/* Destination marker */}
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
          )}

          {/* Route polyline */}
          {polylinePositions.length >= 2 && (
            <Polyline positions={polylinePositions} color="#7FFF00" weight={4} />
          )}
        </MapContainer>
      </div>

      {/* ── Map gradient overlay ────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          zIndex: 2,
          height: '60%',
          background: 'linear-gradient(to top, rgba(26,36,33,0.98) 60%, transparent)',
        }}
      />

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 flex items-center gap-3 px-4 pt-10 pb-4" style={{ zIndex: 10 }}>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft size={22} className="text-white" />
        </button>
        <h1 className="font-display text-xl font-semibold text-white">Where to?</h1>
      </div>

      {/* ── Bottom Sheet ─────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 overflow-y-auto"
        style={{ zIndex: 10, maxHeight: '70vh' }}
      >
        <div className="bg-[var(--color-surface-1)] rounded-t-[28px] px-5 pt-5 pb-8 space-y-5 min-h-[55vh]">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-[var(--color-surface-3)] rounded-full mx-auto mb-1" />

          {/* ── Pickup field ─────────────────────────────────────────────────── */}
          <AddressField
            label="Pickup"
            value={pickup}
            placeholder="Your pickup location"
            icon={<div style={{ width: 10, height: 10, background: '#7FFF00', borderRadius: '50%' }} />}
            iconColor="#7FFF00"
            onChange={() => {}}
            onSelect={(place) => {
              setPickup(place);
              setMapCenter([place.lat, place.lng]);
            }}
            onClear={() => setPickup(null)}
          />

          {/* ── Stop fields ──────────────────────────────────────────────────── */}
          <AnimatePresence>
            {stopInputs.map((stop, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative">
                  <AddressField
                    label={`Stop ${index + 1}`}
                    value={stop}
                    placeholder={`Enter stop ${index + 1}`}
                    icon={
                      <div style={{
                        width: 10, height: 10, background: '#8A9E9A',
                        borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)'
                      }} />
                    }
                    iconColor="#8A9E9A"
                    onChange={() => {}}
                    onSelect={(place) => handleStopSelect(index, place)}
                    onClear={() => handleRemoveStop(index)}
                  />
                  <button
                    onClick={() => handleRemoveStop(index)}
                    className="absolute right-3 top-[38px] w-6 h-6 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-text-muted)]"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* ── Destination field ─────────────────────────────────────────────── */}
          <AddressField
            label="Destination"
            value={destination}
            placeholder="Where are you going?"
            icon={<MapPin size={14} />}
            iconColor="#EF4444"
            onChange={() => {}}
            onSelect={(place) => {
              setDestination(place);
            }}
            onClear={() => setDestination(null)}
          />

          {/* ── Add stop ──────────────────────────────────────────────────────── */}
          {stopInputs.length < 3 && (
            <button
              onClick={handleAddStop}
              className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary)] pl-1"
            >
              <Plus size={14} />
              Add a stop
            </button>
          )}

          {/* ── Saved places ─────────────────────────────────────────────────── */}
          {savedPlaces.length > 0 && (
            <div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {savedPlaces.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => setDestination({ lat: place.location.lat, lng: place.location.lng, address: place.address })}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border-subtle)]"
                  >
                    {place.label === 'HOME' && <Home size={14} className="text-[var(--color-primary)]" />}
                    {place.label === 'WORK' && <Briefcase size={14} className="text-[var(--color-primary)]" />}
                    {!['HOME', 'WORK'].includes(place.label) && <Star size={14} className="text-[var(--color-primary)]" />}
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">{place.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Recent trips ──────────────────────────────────────────────────── */}
          {recentTrips.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">Recent</p>
              <div className="space-y-1">
                {recentTrips.map((trip, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setDestination({
                        lat: trip.destination.lat,
                        lng: trip.destination.lng,
                        address: trip.destination.address,
                      })
                    }
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors text-left"
                  >
                    <Clock size={14} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    <span className="text-sm text-[var(--color-text-secondary)] truncate">
                      {trip.destination.address}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Book for someone else ─────────────────────────────────────────── */}
          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[var(--color-text-muted)]" />
                <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                  Booking for someone else
                </span>
              </div>
              <Toggle value={bookingForOther} onChange={handleGuestToggle} />
            </div>

            <AnimatePresence>
              {bookingForOther && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)]">
                      <User size={16} className="text-[var(--color-text-muted)]" />
                      <input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Guest name"
                        className="flex-1 bg-transparent text-sm font-semibold outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                    <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)]">
                      <Phone size={16} className="text-[var(--color-text-muted)]" />
                      <span className="text-sm font-semibold text-[var(--color-text-muted)]">+234</span>
                      <input
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="8012345678"
                        type="tel"
                        className="flex-1 bg-transparent text-sm font-semibold outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── CTA ──────────────────────────────────────────────────────────── */}
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
              canContinue
                ? 'bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)] active:scale-[0.98]'
                : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] cursor-not-allowed'
            }`}
          >
            See fare estimate →
          </button>
        </div>
      </div>
    </div>
  );
}
