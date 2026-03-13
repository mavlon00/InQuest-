import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap, Polyline, Popup } from 'react-leaflet';
import { Search, Navigation, User, Star, MapPin, CheckCircle, X, ChevronLeft, ArrowRight, PersonStanding } from 'lucide-react';
import { useStore } from '../../store';
import L from 'leaflet';
import MapControls from '../../components/MapControls';
import DestinationAlarm from '../../components/DestinationAlarm';

// Custom icons
const customMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--color-primary); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--color-glow);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const kekeIcon = (filled, total) => new L.DivIcon({
  className: 'keke-icon keke-pulse',
  html: `
    <div style="position: relative; width: 32px; height: 32px; background-color: var(--color-surface-2); border-radius: 8px; border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border-radius: 8px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
      <div style="position: absolute; top: -6px; right: -6px; background-color: var(--color-primary); color: var(--color-primary-text); font-size: 10px; font-weight: bold; padding: 2px 4px; border-radius: 4px; border: 1px solid var(--color-bg); transition: all 0.3s ease;">${filled}/${total}</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const generateMockKekes = (passengerLat, passengerLng) => {
  const kekes = [];
  const count = Math.floor(Math.random() * 5) + 4;

  for (let i = 0; i < count; i++) {
    const minOffset = 0.001;
    const maxOffset = 0.008;
    const offsetLat = (Math.random() - 0.5) * maxOffset;
    const offsetLng = (Math.random() - 0.5) * maxOffset;

    const finalLat = passengerLat + (Math.abs(offsetLat) < minOffset
      ? minOffset * Math.sign(offsetLat || 1)
      : offsetLat);
    const finalLng = passengerLng + (Math.abs(offsetLng) < minOffset
      ? minOffset * Math.sign(offsetLng || 1)
      : offsetLng);

    kekes.push({
      id: `keke-${i}-${Date.now()}`,
      lat: finalLat,
      lng: finalLng,
      filled: Math.floor(Math.random() * 4),
      total: 4,
      driverName: ['Emmanuel Okafor', 'Chukwudi Eze', 'Amara Uche', 'Biodun Adeyemi', 'Musa Ibrahim'][i % 5],
      driverPhoto: null,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      trips: Math.floor(Math.random() * 400) + 50,
      plate: `ABA-${Math.floor(Math.random() * 900) + 100}-KE`,
      isEV: Math.random() > 0.7,
      destination: ['Maryland Mall', 'Aba Main Market', 'ABSU Junction', 'Ariaria Market', 'Aba Station'][i % 5],
      heading: Math.random() * 360,
      passengerLat,
      passengerLng
    });
  }
  return kekes;
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function OnSpotBooking() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { theme, booking, updateBooking, setCancelModalOpen } = useStore();
  const [location, setLocation] = useState(null);
  const [selectedKeke, setSelectedKeke] = useState(null);
  const [bookingState, setBookingState] = useState('PREVIEW');
  const [countdown, setCountdown] = useState(30);
  const [kekePositions, setKekePositions] = useState([]);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null);

  const updateKekeDistances = useCallback((kekes, userLat, userLng) => {
    return kekes.map(keke => {
      const distance = getDistanceMeters(userLat, userLng, keke.lat, keke.lng);
      return {
        ...keke,
        distanceMeters: distance,
        distanceText: distance < 1000 ? `${distance}m away` : `${(distance / 1000).toFixed(1)}km away`,
        withinGeofence: distance <= 500
      };
    });
  }, []);

  useEffect(() => {
    // Real Geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLoc = [latitude, longitude];
        setLocation(userLoc);

        const initialKekes = generateMockKekes(latitude, longitude);
        setKekePositions(updateKekeDistances(initialKekes, latitude, longitude));
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Fallback
        const initialLocation = [6.5244, 3.3792];
        setLocation(initialLocation);
        const initialKekes = generateMockKekes(initialLocation[0], initialLocation[1]);
        setKekePositions(updateKekeDistances(initialKekes, initialLocation[0], initialLocation[1]));
      }
    );

    if (routerLocation.state?.selectedKeke) {
      setSelectedKeke(routerLocation.state.selectedKeke);
    }
  }, [routerLocation.state, updateKekeDistances]);

  // Simulate vehicle movement
  useEffect(() => {
    if (kekePositions.length === 0 || !location) return;

    const interval = setInterval(() => {
      setKekePositions(prev => {
        const nextKekes = prev.map(keke => {
          if (Math.random() > 0.7) {
            return {
              ...keke,
              lat: keke.lat + (Math.random() - 0.5) * 0.0002,
              lng: keke.lng + (Math.random() - 0.5) * 0.0002
            };
          }
          return keke;
        });
        return updateKekeDistances(nextKekes, location[0], location[1]);
      });
    }, 5000); // Updated to 5 seconds as requested

    return () => clearInterval(interval);
  }, [kekePositions.length, location, updateKekeDistances]);

  useEffect(() => {
    if (bookingState === 'REQUESTED') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const delay = Math.floor(Math.random() * 10000) + 5000;
      const acceptTimer = setTimeout(() => {
        setBookingState('ACCEPTED');
        updateBooking({
          status: 'ACCEPTED',
          tripId: 'TRP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          driver: {
            name: selectedKeke?.driverName || 'Emmanuel Okafor',
            rating: selectedKeke?.rating || 4.8,
            trips: selectedKeke?.trips || 342,
            plate: selectedKeke?.plate || 'ABA-123-KE',
            vehicle: 'Keke NAPEP',
            lat: selectedKeke?.lat || 6.5264,
            lng: selectedKeke?.lng || 3.3812
          },
          eta: Math.floor(Math.random() * 8) + 3,
          type: 'ON_SPOT',
          acceptedAt: Date.now()
        });

        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }, delay);

      return () => {
        clearInterval(timer);
        clearTimeout(acceptTimer);
      };
    }
  }, [bookingState, updateBooking, navigate, selectedKeke]);

  const handleBook = () => {
    if (selectedKeke && selectedKeke.withinGeofence) {
      updateBooking({ status: 'REQUESTED' });
      setBookingState('REQUESTED');
    }
  };

  const handleCancel = () => {
    if (bookingState === 'REQUESTED') {
      setCancelModalOpen(true);
    } else {
      updateBooking({ status: 'IDLE' });
      setBookingState('PREVIEW');
      setSelectedKeke(null);
    }
  };

  const nearbyCount = kekePositions.filter(k => k.withinGeofence).length;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Layer 1 - Map Layer (Base) */}
      <div className="absolute inset-0 z-1">
        {location ? (
          <MapContainer center={location} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
            />
            {location && typeof location[0] === 'number' && (
              <Marker position={location} icon={customMarkerIcon} />
            )}

            {/* Dynamic Kekes */}
            {kekePositions.map(keke => (
              typeof keke.lat === 'number' && typeof keke.lng === 'number' && (
                <Marker
                  key={keke.id}
                  position={[keke.lat, keke.lng]}
                  icon={kekeIcon(keke.filled, keke.total)}
                  eventHandlers={{
                    click: () => setSelectedKeke(keke)
                  }}
                >
                  {selectedKeke?.id === keke.id && (
                    <Popup offset={[0, -20]} closeButton={false} autoPan={false}>
                      <div className="bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/20">
                        {keke.distanceText}
                      </div>
                    </Popup>
                  )}
                </Marker>
              )
            ))}

            {selectedKeke && !selectedKeke.withinGeofence && location && typeof selectedKeke.lat === 'number' && (
              <Polyline
                positions={[location, [selectedKeke.lat, selectedKeke.lng]]}
                color="#ADFF2F"
                weight={3}
                dashArray="8, 12"
                opacity={0.8}
              />
            )}

            <MapController center={location} />
            <MapControls
              userLocation={location}
              onAlarmClick={() => setIsAlarmModalOpen(true)}
              isAlarmActive={!!activeAlarm}
            />
          </MapContainer>
        ) : (
          <div className="h-full w-full bg-[var(--color-surface-1)] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <Navigation size={32} className="text-[var(--color-primary)] mb-4 animate-bounce" />
              <p className="text-[var(--color-text-secondary)] font-medium">Getting your position...</p>
            </div>
          </div>
        )}
      </div>

      {/* Layer 2 - UI Overlays (z-index 100+) */}

      {/* Top Overlay */}
      <div className="fixed top-0 inset-x-0 z-[100] p-6 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] bg-[var(--color-surface-1)] shadow-md">
            <ChevronLeft size={24} />
          </button>

          <div className="flex-1 bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-full py-3 px-5 flex items-center gap-3 shadow-md">
            <Search size={20} className="text-[var(--color-primary)]" />
            <span className="text-[var(--color-text-primary)] font-medium text-base truncate">
              {booking.destinationName || 'Select destination...'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pointer-events-auto">
          <div className={`px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 transition-colors ${nearbyCount > 0 ? 'bg-[var(--color-surface-1)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)]' : 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-warning)]'}`}>
            <div className={`w-2 h-2 rounded-full ${nearbyCount > 0 ? 'bg-[var(--color-success)] animate-pulse' : 'bg-[var(--color-warning)]'}`} />
            <span className="text-sm font-bold tracking-tight">
              {nearbyCount > 0 ? `${nearbyCount} nearby kekes` : 'No kekes nearby'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {selectedKeke && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 inset-x-0 z-[100] bg-[var(--color-surface-1)] rounded-t-[40px] border-t border-[var(--color-border-subtle)] shadow-[0_-12px_40px_rgba(0,0,0,0.3)] pb-safe"
          >
            <div className="w-12 h-1.5 bg-[var(--color-border-subtle)] rounded-full mx-auto mt-4 mb-6" />

            <div className="px-7 pb-8">
              {bookingState === 'PREVIEW' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Driver Info */}
                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center border border-[var(--color-border)] overflow-hidden">
                        {selectedKeke.driverPhoto ? (
                          <img src={selectedKeke.driverPhoto} alt={selectedKeke.driverName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-[var(--color-text-muted)]" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface-1)] flex items-center justify-center shadow-sm">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-xl">{selectedKeke.driverName}</h3>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Professional Inquest Driver</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-amber-500 mb-1">
                        <Star size={16} className="fill-current" />
                        <span className="font-bold text-base text-[var(--color-text-primary)]">{selectedKeke.rating}</span>
                      </div>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest">{selectedKeke.trips} trips</p>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[var(--color-surface-2)] rounded-[24px] p-5 border border-[var(--color-border-subtle)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold mb-3">Vehicle Details</p>
                      <p className="font-display font-semibold text-sm mb-1">{selectedKeke.plate}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] font-medium">{selectedKeke.isEV ? 'Electric' : 'Eco'} Keke NAPEP</p>
                    </div>
                    <div className="bg-[var(--color-surface-2)] rounded-[24px] p-5 border border-[var(--color-border-subtle)]">
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold mb-3">Occupancy</p>
                      <div className="flex gap-1.5 mb-2">
                        {[...Array(selectedKeke.total)].map((_, i) => (
                          <User
                            key={i}
                            size={16}
                            className={i < selectedKeke.filled ? 'text-[var(--color-primary)] fill-current' : 'text-[var(--color-text-muted)]'}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] font-medium">{selectedKeke.filled} of {selectedKeke.total} seats taken</p>
                    </div>
                  </div>

                  {/* Distance Info (Real-time update) */}
                  <div className="flex items-center gap-4 p-5 bg-[var(--color-surface-2)] rounded-[24px] border border-[var(--color-border-subtle)] mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                      <PersonStanding size={24} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">Walking distance</p>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium font-display leading-tight">
                        Walk approximately {selectedKeke.distanceText} to board
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <button
                      onClick={handleBook}
                      disabled={!booking.destinationName || !selectedKeke.withinGeofence}
                      className={`w-full py-5 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${selectedKeke.withinGeofence
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-[var(--shadow-glow)] hover:brightness-110'
                        : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] cursor-not-allowed grayscale shadow-none'
                        }`}
                    >
                      {selectedKeke.withinGeofence ? 'Book This Keke' : 'Out of Range'}
                    </button>
                    {!selectedKeke.withinGeofence && (
                      <div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)] text-[11px] font-bold uppercase tracking-widest mt-1">
                        <ArrowRight size={14} className="-rotate-45 text-[var(--color-primary)]" />
                        Move closer to book — {selectedKeke.distanceMeters}m away
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedKeke(null)}
                      className="w-full bg-transparent text-[var(--color-text-secondary)] py-4 rounded-2xl font-bold text-base hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}

              {/* REQUESTED and ACCEPTED states remain similar but use selectedKeke data */}
              {bookingState === 'REQUESTED' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <div className="relative w-36 h-36 flex items-center justify-center mb-10">
                    <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    <div className="absolute inset-6 rounded-full border-2 border-[var(--color-primary)] opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />

                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="72" cy="72" r="68" fill="none" stroke="var(--color-surface-2)" strokeWidth="4" />
                      <circle
                        cx="72" cy="72" r="68" fill="none" stroke="var(--color-primary)" strokeWidth="4"
                        strokeDasharray="427"
                        strokeDashoffset={427 - (427 * countdown) / 30}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>

                    <div className="w-20 h-20 rounded-3xl bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden z-10 border-2 border-[var(--color-border)] shadow-xl">
                      <User size={32} className="text-[var(--color-text-muted)]" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-display font-bold mb-3">Requesting Keke...</h2>
                  <p className="text-[var(--color-text-muted)] mb-12 font-medium">Emmanuel will receive your request shortly</p>

                  <button
                    onClick={handleCancel}
                    className="w-full bg-[var(--color-surface-2)] text-[var(--color-error)] py-5 rounded-2xl font-bold text-lg hover:bg-[var(--color-surface-3)] transition-colors border border-[var(--color-error)]/20"
                  >
                    Cancel Request
                  </button>
                </motion.div>
              )}

              {bookingState === 'ACCEPTED' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-10 text-center"
                >
                  <div className="w-24 h-24 rounded-[32px] bg-[var(--color-success)]/20 flex items-center justify-center mb-8 shadow-[0_12px_32px_rgba(16,185,129,0.2)]">
                    <CheckCircle size={56} className="text-[var(--color-success)]" />
                  </div>

                  <h2 className="text-3xl font-display font-bold text-[var(--color-success)] mb-4">Confirmed!</h2>
                  <p className="text-[var(--color-text-secondary)] text-xl font-medium mb-2">{selectedKeke.driverName} is expecting you.</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Walk to the pickup point now.</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DestinationAlarm
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        onSetAlarm={(data) => setActiveAlarm(data)}
      />
    </div>
  );
}

