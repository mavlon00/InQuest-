import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Phone, MessageSquare, ShieldAlert,
  Share2, MapPin, Navigation, User, Star, Loader2, Info
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBookingStore } from '../../store/bookingStore';

// ─── Icons ──────────────────────────────────────────────────────────────────
const makeIcon = (color, size = 16) =>
  new L.DivIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const pickupIcon = makeIcon('#7FFF00', 16);
const destinationIcon = makeIcon('#EF4444', 16);

// Rotating driver icon
const getDriverIcon = (heading = 0) =>
  new L.DivIcon({
    className: '',
    html: `
      <div style="width:36px;height:36px;background:var(--color-surface-1);border-radius:8px;border:2px solid var(--color-primary);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.5);transform:rotate(${heading}deg);transition:transform 0.3s ease;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-90deg);">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

// ─── Map Controllers ──────────────────────────────────────────────────────────

function MapController({ driverLoc, passengerLoc, status }) {
  const map = useMap();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (!driverLoc || !passengerLoc) return;

    if (status === 'ACCEPTED' || status === 'EN_ROUTE') {
      if (prevStatus.current !== status) {
        map.fitBounds([
          [driverLoc.lat, driverLoc.lng],
          [passengerLoc.lat, passengerLoc.lng]
        ], { padding: [80, 80], animate: true });
      } else {
        const bounds = map.getBounds();
        if (!bounds.contains([driverLoc.lat, driverLoc.lng])) {
          map.panTo([(driverLoc.lat + passengerLoc.lat) / 2, (driverLoc.lng + passengerLoc.lng) / 2], { animate: true });
        }
      }
    } else if (status === 'ARRIVING') {
      map.setView([(driverLoc.lat + passengerLoc.lat) / 2, (driverLoc.lng + passengerLoc.lng) / 2], 17, { animate: true });
    } else if (status === 'ARRIVED') {
      map.setView([driverLoc.lat, driverLoc.lng], 18, { animate: true });
    } else if (status === 'IN_PROGRESS' || status === 'COMPLETING') {
      // In progress -> fit bounds between driver and final destination
      if (prevStatus.current !== status) {
        map.fitBounds([
          [driverLoc.lat, driverLoc.lng],
          [passengerLoc.lat, passengerLoc.lng] // Passed as destination during IN_PROGRESS
        ], { padding: [80, 80], animate: true });
      }
    }

    prevStatus.current = status;
  }, [driverLoc, passengerLoc, status, map]);

  return null;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PersonalBookingTracking() {
  const navigate = useNavigate();
  const { bookingId: paramBookingId } = useParams();
  
  const {
    bookingId, bookingStatus, activeDriver, pickup, destination,
    waitingFeeActive, waitingFeeAmount, fareEstimate,
    updateBookingStatus, updateWaitingFee, startWaitingFee, resetBooking,
  } = useBookingStore();

  const [displayLocation, setDisplayLocation] = useState(
    activeDriver?.location || (pickup ? { lat: pickup.lat + 0.015, lng: pickup.lng + 0.015, heading: 45 } : null)
  );
  const [targetLocation, setTargetLocation] = useState(displayLocation);
  
  const [eta, setEta] = useState(activeDriver?.etaMins || 5);
  const [distanceKm, setDistanceKm] = useState(2.4);
  const [distanceMeters, setDistanceMeters] = useState(2400);
  const [initialDistance, setInitialDistance] = useState(null);
  
  const [tripDuration, setTripDuration] = useState(0); // seconds
  const [gracePeriod, setGracePeriod] = useState(300); // 5 mins
  const [showCancel, setShowCancel] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [bannerMsg, setBannerMsg] = useState(null);

  // Guards
  useEffect(() => {
    if (!pickup || !destination) {
      // navigate('/home', { replace: true });
    }
  }, [pickup, destination]);

  // ── Smooth Interpolation engine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!targetLocation || !displayLocation) return;
    
    let startTime = null;
    const duration = 2000;
    const startLoc = { ...displayLocation };

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      setDisplayLocation({
        lat: startLoc.lat + (targetLocation.lat - startLoc.lat) * progress,
        lng: startLoc.lng + (targetLocation.lng - startLoc.lng) * progress,
        heading: targetLocation.heading
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetLocation]);

  // ── Simulation engine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!pickup || !destination || !targetLocation) return;

    if (!initialDistance && (bookingStatus === 'ACCEPTED' || bookingStatus === 'EN_ROUTE')) {
      const d = L.latLng(targetLocation.lat, targetLocation.lng).distanceTo(L.latLng(pickup.lat, pickup.lng));
      setInitialDistance(d);
    }

    let moveInterval, waitingInterval, tripInterval;

    const moveDriver = (target, speedFactor) => {
      setTargetLocation(prev => {
        const dLat = target.lat - prev.lat;
        const dLng = target.lng - prev.lng;
        const nextLat = prev.lat + dLat * speedFactor;
        const nextLng = prev.lng + dLng * speedFactor;
        const heading = Math.atan2(dLng, dLat) * (180 / Math.PI) + 90; // Adjust for leaflet rotation

        return { lat: nextLat, lng: nextLng, heading };
      });
    };

    // 1. EN_ROUTE (moving to pickup)
    if (bookingStatus === 'ACCEPTED' || bookingStatus === 'EN_ROUTE') {
      if (bookingStatus === 'ACCEPTED') updateBookingStatus('EN_ROUTE');
      
      moveInterval = setInterval(() => {
        moveDriver(pickup, 0.05);
        
        // Check distance to pickup
        const distToPickup = L.latLng(targetLocation.lat, targetLocation.lng).distanceTo(L.latLng(pickup.lat, pickup.lng));
        setDistanceMeters(Math.round(distToPickup));
        setDistanceKm((distToPickup / 1000).toFixed(1));
        
        if (distToPickup < 150 && bookingStatus !== 'ARRIVING') {
          updateBookingStatus('ARRIVING');
          setBannerMsg({ type: 'warning', text: 'Driver is almost here!' });
          setTimeout(() => setBannerMsg(null), 5000);
        }
        
        if (distToPickup < 20) {
          updateBookingStatus('ARRIVED');
          setEta(0);
        } else {
          setEta(Math.max(1, Math.ceil(distToPickup / 200)));
        }
      }, 2000);
    }
    
    // 2. ARRIVED (waiting at pickup)
    else if (bookingStatus === 'ARRIVED') {
      waitingInterval = setInterval(() => {
        setGracePeriod(g => {
          if (g <= 1 && !waitingFeeActive) {
            startWaitingFee();
            return 0;
          }
          return Math.max(0, g - 1);
        });
        
        if (waitingFeeActive) {
          updateWaitingFee(waitingFeeAmount + 0.5); // Add 50 kobo per second -> NGN 30/min
        }
      }, 1000);
    }

    // 3. IN_PROGRESS (moving to destination)
    else if (bookingStatus === 'IN_PROGRESS') {
      tripInterval = setInterval(() => {
        setTripDuration(d => d + 1);
      }, 1000);

      moveInterval = setInterval(() => {
        moveDriver(destination, 0.05);
        
        const distToDest = L.latLng(targetLocation.lat, targetLocation.lng).distanceTo(L.latLng(destination.lat, destination.lng));
        setDistanceKm((distToDest / 1000).toFixed(1));
        
        if (distToDest < 300 && bookingStatus !== 'COMPLETING') {
          updateBookingStatus('COMPLETING');
          setBannerMsg({ type: 'info', text: 'Approaching destination. Prepare to alight.' });
          setTimeout(() => setBannerMsg(null), 8000);
        }
        
        if (distToDest < 20) {
          updateBookingStatus('COMPLETED');
          navigate(`/book/personal/complete/${bookingId}`, { replace: true });
        }
      }, 2000);
    }

    // 4. COMPLETING (almost at destination)
    else if (bookingStatus === 'COMPLETING') {
      tripInterval = setInterval(() => setTripDuration(d => d + 1), 1000);
      moveInterval = setInterval(() => {
        moveDriver(destination, 0.05);
        const distToDest = L.latLng(targetLocation.lat, targetLocation.lng).distanceTo(L.latLng(destination.lat, destination.lng));
        
        if (distToDest < 20) {
          updateBookingStatus('COMPLETED');
          navigate(`/book/personal/complete/${bookingId}`, { replace: true });
        }
      }, 2000);
    }

    return () => {
      clearInterval(moveInterval);
      clearInterval(waitingInterval);
      clearInterval(tripInterval);
    };
  }, [bookingStatus, targetLocation, pickup, destination, waitingFeeActive, waitingFeeAmount]);

  // Handle manual status changes for demo
  const handleStartTrip = () => updateBookingStatus('IN_PROGRESS');
  const handleArrived = () => updateBookingStatus('ARRIVED');
  const handleComplete = () => {
    updateBookingStatus('COMPLETED');
    navigate(`/book/personal/complete/${bookingId}`, { replace: true });
  };
  const handleCancel = () => {
    resetBooking();
    navigate('/home', { replace: true });
  };

  const handleShare = () => {
    alert("Trip details shared successfully!");
  };

  // ── UI Helpers ─────────────────────────────────────────────────────────────
  const fmtMinSec = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isEnRoute = ['ACCEPTED', 'EN_ROUTE', 'ARRIVING'].includes(bookingStatus);
  const isWaiting = bookingStatus === 'ARRIVED';
  const isActiveTrip = ['IN_PROGRESS', 'COMPLETING'].includes(bookingStatus);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--color-bg)]">
      {/* ── Map ────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {displayLocation && (
          <MapContainer
            center={[displayLocation.lat, displayLocation.lng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            attributionControl={false}
            className="grayscale-filter dark-map shadow-inner"
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            <MapController 
              driverLoc={displayLocation} 
              passengerLoc={isEnRoute || isWaiting ? pickup : destination} 
              status={bookingStatus} 
            />

            {/* Dash Approach Line */}
            {isEnRoute && pickup && (
              <>
                <Polyline 
                  positions={[
                    [displayLocation.lat, displayLocation.lng],
                    [pickup.lat, pickup.lng]
                  ]}
                  color="#7FFF00"
                  weight={3}
                  opacity={0.8}
                  dashArray="8, 6"
                />
                <Marker 
                  position={[
                    (displayLocation.lat + pickup.lat) / 2,
                    (displayLocation.lng + pickup.lng) / 2
                  ]}
                  icon={L.divIcon({
                    className: 'eta-dist-label',
                    html: `
                      <div style="background: rgba(26, 36, 33, 0.9); border: 1px solid rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.4); transform: translate(-50%, -50%);">
                        <span style="font-size: 11px; font-weight: bold; color: white; white-space: nowrap;">${eta} min away</span>
                        <span style="font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 600;">${distanceMeters > 1000 ? (distanceMeters/1000).toFixed(1) + 'km' : distanceMeters + 'm'}</span>
                      </div>
                    `,
                    iconSize: [0, 0]
                  })}
                />
              </>
            )}

            {/* Solid Trip Line */}
            {isActiveTrip && destination && (
              <Polyline 
                positions={[
                  [displayLocation.lat, displayLocation.lng],
                  [destination.lat, destination.lng]
                ]}
                color="#7FFF00"
                weight={4}
              />
            )}

            {/* Markers */}
            <Marker position={[displayLocation.lat, displayLocation.lng]} icon={getDriverIcon(displayLocation.heading)} />
            {isEnRoute && pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
            {isActiveTrip && destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}
          </MapContainer>
        )}
      </div>

      {/* ── Top Status Bar ─────────────────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 pt-10 pb-20 px-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between mt-2 pointer-events-auto">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center flex-shrink-0 active:scale-95"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <span className="text-sm font-semibold text-white tracking-wider">
              {isEnRoute && 'DRIVER ON THE WAY'}
              {isWaiting && 'DRIVER ARRIVED'}
              {isActiveTrip && 'TRIP IN PROGRESS'}
            </span>
          </div>

          <button 
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center flex-shrink-0 active:scale-95"
          >
            <Share2 size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── Banners (ARRIVING, WAITING FEE, CLOSE TO DEST) ────────────────────────────────── */}
      <div className="absolute top-28 inset-x-4 space-y-2 pointer-events-none" style={{ zIndex: 20 }}>
        <AnimatePresence>
          {bannerMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`p-4 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md ${
                bannerMsg.type === 'warning' ? 'bg-[var(--color-warning)]/20 border border-[var(--color-warning)]/50' : 'bg-[#7FFF00]/20 border border-[#7FFF00]/50'
              }`}
            >
              <Info size={20} className={bannerMsg.type === 'warning' ? 'text-[var(--color-warning)]' : 'text-[#7FFF00]'} />
              <p className="font-semibold text-sm text-white">{bannerMsg.text}</p>
            </motion.div>
          )}

          {waitingFeeActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[var(--color-warning)]/20 border border-[var(--color-warning)]/50 shadow-xl flex items-center justify-between backdrop-blur-md"
            >
              <div>
                <p className="text-sm font-bold text-[var(--color-warning)]">Waiting fee active</p>
                <p className="text-xs font-semibold text-white/70">NGN 30/min</p>
              </div>
              <p className="text-xl font-display font-bold text-[var(--color-warning)]">
                NGN {Math.floor(waitingFeeAmount)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── SOS Button (In progress) ───────────────────────────────────────── */}
      <AnimatePresence>
        {isActiveTrip && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-4 bottom-80 z-20 pointer-events-auto"
          >
            <button
              onClick={() => setSosActive(true)}
              className="w-14 h-14 rounded-full bg-[var(--color-error)] text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center border-2 border-white/20 active:scale-95 transition-transform animate-pulse"
            >
              <ShieldAlert size={20} className="mb-0.5" />
              <span className="text-[10px] font-bold">SOS</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom HUD ─────────────────────────────────────────────────────── */}

      <div className="absolute inset-x-0 bottom-0 flex flex-col pointer-events-auto" style={{ zIndex: 30 }}>
        
        {/* Status Panel */}
        <div className="bg-[var(--color-surface-1)] rounded-t-[32px] px-6 pt-6 pb-4 border-[var(--color-border-subtle)] border-t border-x shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex-shrink-0">
          
          <div className="w-12 h-1 bg-[var(--color-surface-3)] rounded-full mx-auto mb-6" />

          <AnimatePresence mode="wait">
            {/* EN ROUTE */}
            {isEnRoute && (
              <motion.div key="enroute" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-1 mb-6">
                <h2 className="text-2xl font-display font-bold text-white">
                  {bookingStatus === 'ARRIVING' ? 'Almost there' : 'Driver on the way'}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--color-primary)]">{eta} min away</span>
                  <span className="text-xs text-[var(--color-text-muted)]">• {distanceKm} km</span>
                </div>
              </motion.div>
            )}

            {/* ARRIVED */}
            {isWaiting && (
              <motion.div key="arrived" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-[var(--color-success)] mb-1">Driver arrived</h2>
                  <p className="text-sm text-[var(--color-text-muted)] truncate">Please meet driver at {pickup?.address}</p>
                </div>
                
                {!waitingFeeActive && (
                  <div className="bg-[var(--color-surface-2)] p-4 rounded-xl border border-[var(--color-border-subtle)] flex items-center justify-between">
                    <span className="text-sm font-semibold">Grace period</span>
                    <span className={`text-xl font-display font-bold ${gracePeriod < 60 ? 'text-[var(--color-warning)] animate-pulse' : 'text-[var(--color-text-primary)]'}`}>
                      {fmtMinSec(gracePeriod)}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* IN PROGRESS */}
            {isActiveTrip && (
              <motion.div key="progress" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 mb-6">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-1">
                    {bookingStatus === 'COMPLETING' ? 'Approaching destination' : 'Heading to destination'}
                  </h2>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)] truncate">
                    {destination?.address}
                  </p>
                </div>

                <div className="flex items-center gap-4 py-2 border-t border-white/5">
                  <div className="flex-1">
                    <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-lg font-bold">{fmtMinSec(tripDuration)}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-wider mb-1">Fare</p>
                    <p className="text-lg font-display font-bold text-[var(--color-primary)]">
                      NGN {fareEstimate?.totalFare?.toLocaleString() || '—'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Driver Card */}
          <div className="bg-[var(--color-surface-2)] rounded-2xl p-3 border border-[var(--color-border-subtle)] flex items-center gap-3">
            <div className="relative">
              <img src={activeDriver?.photoUrl || `https://ui-avatars.com/api/?name=${activeDriver?.name || 'D'}&background=random`} alt="Driver" className="w-14 h-14 rounded-xl border border-[var(--color-border-subtle)] object-cover bg-gray-800" />
              <div className="absolute -bottom-2 -right-2 bg-[var(--color-surface-1)] px-1.5 py-0.5 rounded-full border border-white/10 flex items-center shadow-lg">
                <Star size={10} className="text-amber-400 fill-amber-400 mr-0.5" />
                <span className="text-[10px] font-bold">{activeDriver?.rating || '4.9'}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="font-bold text-sm truncate">{activeDriver?.name || 'Driver'}</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] truncate mt-0.5">
                {activeDriver?.vehiclePlate || 'KJA-123XY'}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                {activeDriver?.vehicleColor || 'Yellow'} {activeDriver?.vehicleModel || 'Bajaj'}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-white active:scale-95 transition-transform">
                <MessageSquare size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center text-[var(--color-primary)] active:scale-95 transition-transform">
                <Phone size={18} />
              </button>
            </div>
          </div>

          {/* Cancel button (only EN_ROUTE or ARRIVED) */}
          {(isEnRoute || isWaiting) && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowCancel(true)}
                className="text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-4 py-2 rounded-full border border-white/5 active:bg-white/10"
              >
                Cancel ride
              </button>
            </div>
          )}

          {/* DEMO BUTTONS - REMOVE IN PROD */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 border-t border-red-500/30 pt-4">
            <span className="text-[10px] text-red-500 font-bold self-center mr-2">DEMO CONTROLS:</span>
            {isEnRoute && <button onClick={handleArrived} className="px-3 py-1 bg-white/10 border border-white/20 rounded text-[10px] whitespace-nowrap">Trigger Arrive</button>}
            {(isEnRoute || isWaiting) && <button onClick={handleStartTrip} className="px-3 py-1 bg-[#7FFF00] text-black border border-white/20 rounded text-[10px] font-bold whitespace-nowrap">Start Trip</button>}
            {isActiveTrip && <button onClick={handleComplete} className="px-3 py-1 bg-white/10 border border-white/20 rounded text-[10px] whitespace-nowrap">Complete Trip</button>}
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {/* Cancel Modal */}
        {showCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[var(--color-surface-1)] w-full max-w-sm rounded-[32px] p-6 border border-white/10">
              <h3 className="font-display text-xl font-bold text-white mb-2">Cancel Trip?</h3>
              {bookingStatus === 'ARRIVED' ? (
                <p className="text-sm text-[var(--color-text-muted)] mb-6">Your driver has already arrived. A cancellation fee of <strong className="text-white">NGN 150</strong> will be charged to your wallet.</p>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)] mb-6">Are you sure you want to cancel? The driver is already on their way.</p>
              )}
              <div className="space-y-3">
                <button onClick={handleCancel} className="w-full py-4 rounded-2xl font-bold bg-[var(--color-error)] text-white">Yes, Cancel</button>
                <button onClick={() => setShowCancel(false)} className="w-full py-4 rounded-2xl font-bold bg-[var(--color-surface-3)] text-white">Keep Ride</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* SOS Modal */}
        {sosActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-red-950/90 backdrop-blur z-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(239,68,68,0.8)] animate-pulse">
              <ShieldAlert size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-3">Emergency Menu</h2>
            <p className="text-red-200 mb-10 px-4">This will alert your emergency contacts and Inquest Security immediately.</p>
            <div className="w-full space-y-4 max-w-sm">
              <button className="w-full py-5 rounded-[24px] font-bold text-lg bg-red-600 text-white shadow-xl flex justify-center items-center gap-2">
                <Phone size={20} /> Call Police (112)
              </button>
              <button className="w-full py-5 rounded-[24px] font-bold text-lg bg-white text-black shadow-xl flex justify-center items-center gap-2">
                <ShieldAlert size={20} /> Alert Inquest Security
              </button>
              <button onClick={() => setSosActive(false)} className="w-full py-4 rounded-full font-bold text-red-300 mt-4">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
