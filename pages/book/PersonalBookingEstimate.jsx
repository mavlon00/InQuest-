import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Shield, Calendar, Clock, ChevronRight,
  MapPin, Navigation, Loader2, Zap,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBookingStore, mockFareEstimate } from '../../store/bookingStore';
import useSubscriptionStore from '../../store/subscriptionStore';
import { format, addDays, addMinutes, startOfHour, isBefore } from 'date-fns';

// ─── Map icons ──────────────────────────────────────────────────────────────
const makeIcon = (color, size = 14) =>
  new L.DivIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const pickupIcon = makeIcon('#7FFF00', 14);
const destinationIcon = makeIcon('#EF4444', 14);

function MapFitter({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions || positions.length === 0) return;
    if (positions.length === 1) { map.setView(positions[0], 15, { animate: true }); return; }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [80, 60], animate: true });
  }, [JSON.stringify(positions)]);
  return null;
}

// ─── Toggle ─────────────────────────────────────────────────────────────────
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

// ─── Fare loading skeleton ───────────────────────────────────────────────────
function FareSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-3 bg-[var(--color-surface-3)] rounded w-28" />
          <div className="h-3 bg-[var(--color-surface-3)] rounded w-16" />
        </div>
      ))}
      <div className="border-t border-[var(--color-border-subtle)] pt-3">
        <div className="h-8 bg-[var(--color-surface-3)] rounded w-36 ml-auto" />
      </div>
    </div>
  );
}

// ─── Generate schedule time slots ────────────────────────────────────────────
function getScheduleDays() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = addDays(now, i);
    days.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(d, 'EEE d'),
      date: d,
    });
  }
  return days;
}

function getTimeSlots(selectedDate) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selDay = new Date(selectedDate);
  selDay.setHours(0, 0, 0, 0);
  const isToday = selDay.getTime() === today.getTime();

  const slots = [];
  const startHour = 6; // 6 AM
  const endHour = 23; // 11 PM

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      const slot = new Date(selectedDate);
      slot.setHours(h, m, 0, 0);
      // Min 30 minutes from now if today
      if (isToday && isBefore(slot, addMinutes(now, 30))) continue;
      slots.push(slot);
    }
  }
  return slots;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PersonalBookingEstimate() {
  const navigate = useNavigate();
  const {
    pickup, destination, stops,
    fareEstimate, insurance, scheduledTime, isScheduled,
    setFareEstimate, setInsurance, setScheduledTime, clearSchedule,
  } = useBookingStore();
  const { subscription, isSubscriptionUsable, fetchActiveSubscription } = useSubscriptionStore();

  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState(null);
  const [insuranceOn, setInsuranceOn] = useState(insurance);
  const [scheduleOn, setScheduleOn] = useState(isScheduled);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  const days = getScheduleDays();
  const timeSlots = getTimeSlots(selectedDay);

  // ── Redirect if missing location ─────────────────────────────────────────
  useEffect(() => {
    if (!pickup || !destination) {
      navigate('/book/personal', { replace: true });
    }
  }, []);

  // ── Fetch fare estimate ───────────────────────────────────────────────────
  const fetchEstimate = async (withInsurance = false) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise((r) => setTimeout(r, 900));
      const est = {
        ...mockFareEstimate,
        insuranceFee: withInsurance ? 100 : 0,
        totalFare: mockFareEstimate.baseFare +
          mockFareEstimate.deadMileageFee +
          (stops.length > 0 ? stops.length * 50 : 0) +
          (withInsurance ? 100 : 0),
        stopFees: stops.length > 0 ? stops.length * 50 : 0,
      };
      setEstimate(est);
      setFareEstimate(est);
    } catch {
      // fallback
      setEstimate(mockFareEstimate);
      setFareEstimate(mockFareEstimate);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSubscription();
    fetchEstimate(insuranceOn);
  }, []);

  // ── Insurance toggle ──────────────────────────────────────────────────────
  const handleInsuranceToggle = (val) => {
    setInsuranceOn(val);
    setInsurance(val);
    fetchEstimate(val);
  };

  // ── Schedule toggle ───────────────────────────────────────────────────────
  const handleScheduleToggle = (val) => {
    setScheduleOn(val);
    if (!val) {
      clearSchedule();
      setSelectedTime(null);
    }
  };

  // ── When time is selected ─────────────────────────────────────────────────
  useEffect(() => {
    if (scheduleOn && selectedDay && selectedTime) {
      const dt = new Date(selectedDay);
      dt.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setScheduledTime(dt.toISOString());
    } else if (!scheduleOn) {
      clearSchedule();
    }
  }, [selectedDay, selectedTime, scheduleOn]);

  // ── Map positions ─────────────────────────────────────────────────────────
  const mapPositions = [
    pickup ? [pickup.lat, pickup.lng] : null,
    ...stops.filter(Boolean).map((s) => [s.lat, s.lng]),
    destination ? [destination.lat, destination.lng] : null,
  ].filter(Boolean);

  const displayScheduled = scheduleOn && selectedDay && selectedTime;
  const scheduledLabel = displayScheduled
    ? `${format(selectedDay, 'EEEE d MMMM')} at ${format(selectedTime, 'HH:mm')}`
    : null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--color-bg)]">
      {/* ── Map ──────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <MapContainer
          center={pickup ? [pickup.lat, pickup.lng] : [6.5244, 3.3792]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapFitter positions={mapPositions} />

          {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
          {stops.filter(Boolean).map((s, i) => (
            <Marker key={i} position={[s.lat, s.lng]} icon={makeIcon('#8A9E9A', 11)} />
          ))}
          {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}
          {mapPositions.length >= 2 && (
            <Polyline positions={mapPositions} color="#7FFF00" weight={4} />
          )}
        </MapContainer>
      </div>

      {/* ── Background gradient ───────────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          zIndex: 2,
          height: '65%',
          background: 'linear-gradient(to top, rgba(26,36,33,1) 50%, transparent)',
        }}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 flex items-center gap-3 px-4 pt-10 pb-4" style={{ zIndex: 10 }}>
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft size={22} className="text-white" />
        </button>
        <h1 className="font-display text-xl font-semibold text-white">Fare Estimate</h1>
      </div>

      {/* ── Bottom Sheet ──────────────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 overflow-y-auto" style={{ zIndex: 10, maxHeight: '72vh' }}>
        <div className="bg-[var(--color-surface-1)] rounded-t-[28px] px-5 pt-5 pb-8 space-y-5">
          {/* Handle */}
          <div className="w-10 h-1 bg-[var(--color-surface-3)] rounded-full mx-auto mb-1" />

          {/* ── Route summary ──────────────────────────────────────────────── */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div style={{ width: 8, height: 8, background: '#7FFF00', borderRadius: '50%' }} />
              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />
              <MapPin size={10} className="text-[var(--color-error)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {pickup?.address || '—'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-3 truncate">
                {destination?.address || '—'}
              </p>
            </div>
            {!loading && estimate && (
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[var(--color-text-muted)]">{estimate.distanceKm} km</p>
                <p className="text-xs text-[var(--color-text-muted)]">{estimate.durationMins} min</p>
              </div>
            )}
          </div>

          {/* ── Fare breakdown card ────────────────────────────────────────── */}
          <div className="bg-[var(--color-surface-2)] rounded-xl p-4 border border-[var(--color-border-subtle)] space-y-3 relative overflow-hidden">
            {loading ? (
              <FareSkeleton />
            ) : estimate ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Base fare</span>
                  <span className="font-semibold">NGN {estimate.baseFare.toLocaleString()}</span>
                </div>
                {estimate.deadMileageFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Dead mileage</span>
                    <span className="font-semibold">NGN {estimate.deadMileageFee.toLocaleString()}</span>
                  </div>
                )/* Logic for Subscription Display */}
                {estimate.stopFees > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Stop fees</span>
                    <span className="font-semibold">NGN {estimate.stopFees.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Insurance</span>
                  <span className="font-semibold">NGN {insuranceOn ? '100' : '0'}</span>
                </div>

                <div className="border-t border-[var(--color-border-subtle)] pt-3">
                   {isSubscriptionUsable() ? (
                      <div className="flex justify-between items-baseline">
                         <div className="flex flex-col">
                            <span className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Subscribed Price</span>
                            <span className="text-[10px] text-[var(--color-primary)] font-bold">Split: Wallet + {estimate.distanceKm}km</span>
                         </div>
                         <div className="text-right">
                            <div className="text-2xl font-display font-semibold text-[var(--color-primary)]">NGN {(estimate.totalFare - (estimate.distanceKm * 120)).toLocaleString()}</div>
                            <div className="text-[10px] text-white/30 font-medium">Standard: NGN {estimate.totalFare.toLocaleString()}</div>
                         </div>
                      </div>
                   ) : (
                      <div className="flex justify-between items-baseline">
                         <span className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Total</span>
                         <span className="text-2xl font-display font-semibold text-[var(--color-primary)]">NGN {estimate.totalFare.toLocaleString()}</span>
                      </div>
                   )}
                </div>

                {/* Savings Banner for non-subscribers */}
                {!isSubscriptionUsable() && (
                  <div className="mt-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg p-3 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Zap size={14} className="text-[var(--color-primary)]" />
                        <span className="text-[10px] font-bold text-white/80">Save ~NGN {Math.round(estimate.distanceKm * 20).toLocaleString()} with Gold</span>
                     </div>
                     <button 
                       onClick={() => navigate('/subscription')}
                       className="text-[10px] font-black uppercase tracking-tight text-[var(--color-primary)] hover:underline"
                     >
                       Upgrade
                     </button>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* ── Insurance toggle ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-[var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Trip Insurance</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Coverage for accidents • NGN 100
                </p>
              </div>
            </div>
            <Toggle value={insuranceOn} onChange={handleInsuranceToggle} />
          </div>

          {/* ── Schedule toggle ────────────────────────────────────────────── */}
          <div className="border-t border-[var(--color-border-subtle)] pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-[var(--color-primary)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">Schedule for later</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Book for a future date & time</p>
                </div>
              </div>
              <Toggle value={scheduleOn} onChange={handleScheduleToggle} />
            </div>

            <AnimatePresence>
              {scheduleOn && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3">
                    {/* Day chips */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {days.map((day, i) => {
                        const active =
                          format(day.date, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
                        return (
                          <button
                            key={i}
                            onClick={() => { setSelectedDay(day.date); setSelectedTime(null); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                              active
                                ? 'bg-[var(--color-primary)] text-black'
                                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]'
                            }`}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Time slots */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {timeSlots.map((slot, i) => {
                        const active =
                          selectedTime && slot.getTime() === selectedTime.getTime();
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedTime(slot)}
                            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                              active
                                ? 'bg-[var(--color-primary)] text-black'
                                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]'
                            }`}
                          >
                            <Clock size={10} />
                            {format(slot, 'HH:mm')}
                          </button>
                        );
                      })}
                    </div>

                    {/* Confirmation label */}
                    <AnimatePresence>
                      {displayScheduled && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-semibold text-center py-2"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          📅 Scheduled for {scheduledLabel}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Booking type pill ──────────────────────────────────────────── */}
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                scheduleOn && scheduledLabel
                  ? 'border-[var(--color-primary)]/30 text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-[var(--color-border-subtle)] text-[var(--color-text-muted)] bg-[var(--color-surface-2)]'
              }`}
            >
              {scheduleOn && scheduledLabel ? (
                <>📅 {scheduledLabel}</>
              ) : (
                <><Zap size={12} /> Instant pickup</>
              )}
            </span>
          </div>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <button
            onClick={() => navigate('/book/personal/options')}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-base transition-all bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
