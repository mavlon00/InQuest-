import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, Phone, MessageSquare, ShieldAlert, 
  MapPin, Clock, ArrowRight, Share2, ChevronUp,
  AlertTriangle, CheckCircle2, User, Loader2,
  ChevronLeft, Info, Star
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useOnSpotStore from '../../store/onSpotStore';
import { useStore } from '../../store';
import SOSSheet from '../../components/SOSSheet';
import TripChatOverlay from '../../components/TripChatOverlay';

// --- Icons ---
const kekeIcon = (rotation) => L.divIcon({
  className: 'keke-tracking-icon',
  html: `
    <div style="transform: rotate(${rotation}deg); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease-out;">
      <div style="position: absolute; width: 40px; height: 40px; background: rgba(127, 255, 0, 0.2); border-radius: 50%; filter: blur(8px);"></div>
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <rect x="4" y="2" width="24" height="36" rx="6" fill="#7FFF00" />
        <rect x="6" y="8" width="20" height="12" rx="2" fill="black" fill-opacity="0.8" />
        <rect x="6" y="24" width="20" height="10" rx="2" fill="black" fill-opacity="0.6" />
      </svg>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const passengerIcon = L.divIcon({
  className: 'passenger-icon',
  html: `
    <div class="relative w-6 h-6">
      <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30" style="animation-duration: 2s; animation-iteration-count: infinite;"></div>
      <div class="relative w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destinationIcon = L.divIcon({
  className: 'destination-icon',
  html: `<div class="w-8 h-8 bg-red-500 rounded-full border-4 border-[#1A2421] flex items-center justify-center shadow-lg"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// --- Map Controllers ---

function MapController({ driverLoc, passengerLoc, status }) {
  const map = useMap();
  const prevStatus = useRef(status);

  useEffect(() => {
    if (!driverLoc || !passengerLoc) return;

    if (status === 'ACCEPTED' || status === 'EN_ROUTE_TO_PICKUP') {
      if (prevStatus.current !== status) {
        map.fitBounds([
          [driverLoc.lat, driverLoc.lng],
          [passengerLoc.lat, passengerLoc.lng]
        ], { padding: [80, 80], animate: true });
      } else {
        // Pan if driver moves out of view
        const bounds = map.getBounds();
        if (!bounds.contains([driverLoc.lat, driverLoc.lng])) {
          map.panTo([(driverLoc.lat + passengerLoc.lat) / 2, (driverLoc.lng + passengerLoc.lng) / 2], { animate: true });
        }
      }
    } else if (status === 'ARRIVING') {
      map.setView([(driverLoc.lat + passengerLoc.lat) / 2, (driverLoc.lng + passengerLoc.lng) / 2], 17, { animate: true });
    } else if (status === 'ARRIVED') {
      map.setView([driverLoc.lat, driverLoc.lng], 18, { animate: true });
    }

    prevStatus.current = status;
  }, [driverLoc, passengerLoc, status, map]);

  return null;
}

export default function OnSpotTracking() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { 
    activeBooking, setActiveBooking, updateBookingStatus, 
    updateLiveFare, toggleSOS, toggleChat, sosActive, chatOpen
  } = useOnSpotStore();

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [waitingTimer, setWaitingTimer] = useState(300); // 5:00
  const [elapsed, setElapsed] = useState(0);
  const [displayLocation, setDisplayLocation] = useState(null);
  const [eta, setEta] = useState(5);
  const [distance, setDistance] = useState(0);
  const [initialDistance, setInitialDistance] = useState(null);

  // --- 1. Simulation: Initializing Active Trip ---
  useEffect(() => {
    if (!activeBooking) {
      const mockBooking = {
        bookingId: bookingId || 'bk_onspot_001',
        driverId: 'drv_001',
        driverName: 'Michael Okon',
        driverPhoto: 'https://i.pravatar.cc/150?u=michael',
        driverRating: 4.9,
        vehiclePlate: 'KJA-123XY',
        vehicleColor: 'Yellow',
        vehicleModel: 'Bajaj RE',
        pickup: { address: 'Current Location', lat: 6.4698, lng: 3.5852 },
        destination: { address: 'Eko Atlantic, Victoria Island', lat: 6.4281, lng: 3.4219 },
        seats: 1,
        paymentMethod: 'SUBSCRIPTION',
        status: 'ACCEPTED', 
        iotKm: 0,
        iotFare: 100,
        elapsedMinutes: 0,
        waitingFee: 0,
        subscriptionDeducted: 0,
        currentDriverLocation: { lat: 6.4750, lng: 3.5920, heading: 210 },
        method: bookingId?.includes('walkup') ? 'WALK_UP' : 'APP_SELECTION'
      };
      
      if (mockBooking.method === 'WALK_UP') {
        mockBooking.status = 'IN_PROGRESS';
      }
      setActiveBooking(mockBooking);
      setDisplayLocation(mockBooking.currentDriverLocation);
    }
  }, [bookingId]);

  // --- 2. Smooth Interpolation Logic ---
  const targetLocation = activeBooking?.currentDriverLocation;
  useEffect(() => {
    if (!targetLocation || !displayLocation) return;
    
    let startTime = null;
    const duration = 3000;
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

  // --- 3. Simulation: Trip Life Cycle ---
  useEffect(() => {
    if (!activeBooking) return;

    if (!initialDistance && activeBooking.status === 'ACCEPTED') {
      const d = L.latLng(activeBooking.currentDriverLocation.lat, activeBooking.currentDriverLocation.lng)
                .distanceTo(L.latLng(activeBooking.pickup.lat, activeBooking.pickup.lng));
      setInitialDistance(d);
    }

    const interval = setInterval(() => {
      const isApproaching = ['ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'ARRIVING'].includes(activeBooking.status);
      
      const newTarget = isApproaching 
        ? activeBooking.pickup 
        : activeBooking.destination;

      // Move toward target
      const moveFactor = 0.05;
      const nextLat = activeBooking.currentDriverLocation.lat - (activeBooking.currentDriverLocation.lat - newTarget.lat) * moveFactor;
      const nextLng = activeBooking.currentDriverLocation.lng - (activeBooking.currentDriverLocation.lng - newTarget.lng) * moveFactor;

      setActiveBooking({
        ...activeBooking,
        currentDriverLocation: {
          lat: nextLat,
          lng: nextLng,
          heading: (activeBooking.currentDriverLocation.heading + 5) % 360
        }
      });

      // Update ETA/Dist
      const dist = L.latLng(nextLat, nextLng).distanceTo(L.latLng(newTarget.lat, newTarget.lng));
      setDistance(Math.round(dist));
      setEta(Math.max(1, Math.ceil(dist / 200))); // Rough estimate

      // State transitions
      if (activeBooking.status === 'ACCEPTED') {
        updateBookingStatus('EN_ROUTE_TO_PICKUP');
      } else if (activeBooking.status === 'EN_ROUTE_TO_PICKUP' && dist < 150) {
        updateBookingStatus('ARRIVING');
      } else if (activeBooking.status === 'ARRIVING' && dist < 20) {
        updateBookingStatus('ARRIVED');
      } else if (activeBooking.status === 'IN_PROGRESS') {
        setElapsed(e => e + 1);
        const newKm = (activeBooking.iotKm + 0.05).toFixed(2);
        updateLiveFare(
          parseFloat(newKm),
          100 + (parseFloat(newKm) * 120),
          activeBooking.waitingFee,
          parseFloat(newKm)
        );
        
        if (parseFloat(newKm) > 3.0) {
          updateBookingStatus('COMPLETING');
          setTimeout(() => navigate(`/book/onspot/complete/${activeBooking.bookingId}`), 2000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  // Waiting Timer Logic
  useEffect(() => {
    let timer;
    if (activeBooking?.status === 'ARRIVED') {
      timer = setInterval(() => setWaitingTimer(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeBooking?.status]);

  if (!activeBooking || !displayLocation) {
    return (
      <div className="fixed inset-0 bg-[#1A2421] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#7FFF00]" size={40} />
      </div>
    );
  }

  const isArrived = activeBooking.status === 'ARRIVED';
  const isArriving = activeBooking.status === 'ARRIVING';
  const isInProgress = activeBooking.status === 'IN_PROGRESS';
  const isApproaching = ['ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'ARRIVING'].includes(activeBooking.status);

  // Progress calculation
  const progress = initialDistance ? Math.max(0, Math.min(1, 1 - (distance / initialDistance))) : 0;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#1A2421] font-jakarta">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[displayLocation.lat, displayLocation.lng]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          className="grayscale-filter dark-map shadow-inner"
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          <MapController 
            driverLoc={displayLocation} 
            passengerLoc={activeBooking.pickup} 
            status={activeBooking.status} 
          />

          {/* Dash Approach Line */}
          {isApproaching && (
            <>
              <Polyline 
                positions={[
                  [displayLocation.lat, displayLocation.lng],
                  [activeBooking.pickup.lat, activeBooking.pickup.lng]
                ]}
                color="#7FFF00"
                weight={3}
                opacity={0.8}
                dashArray="8, 6"
              />
              <Marker 
                position={[
                  (displayLocation.lat + activeBooking.pickup.lat) / 2,
                  (displayLocation.lng + activeBooking.pickup.lng) / 2
                ]}
                icon={L.divIcon({
                  className: 'eta-dist-label',
                  html: `
                    <div style="background: rgba(26, 36, 33, 0.9); border: 1px solid rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.4); transform: translate(-50%, -50%);">
                      <span style="font-size: 11px; font-weight: bold; color: white; white-space: nowrap;">${eta} min away</span>
                      <span style="font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 600;">${distance > 1000 ? (distance/1000).toFixed(1) + 'km' : distance + 'm'}</span>
                    </div>
                  `,
                  iconSize: [0, 0]
                })}
              />
            </>
          )}

          {/* Solid Trip Line */}
          {isInProgress && (
            <Polyline 
              positions={[
                [displayLocation.lat, displayLocation.lng],
                [activeBooking.destination.lat, activeBooking.destination.lng]
              ]}
              color="#7FFF00"
              weight={4}
            />
          )}

          {/* Markers */}
          <Marker position={[displayLocation.lat, displayLocation.lng]} icon={kekeIcon(displayLocation.heading)} />
          {isApproaching && <Marker position={[activeBooking.pickup.lat, activeBooking.pickup.lng]} icon={passengerIcon} />}
          {isInProgress && <Marker position={[activeBooking.destination.lat, activeBooking.destination.lng]} icon={destinationIcon} />}
        </MapContainer>
      </div>

      {/* Top HUD */}
      <header className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => navigate('/home')}
          className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="px-5 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 pointer-events-auto">
          <Navigation size={18} className="text-[#7FFF00]" />
          <span className="text-xs font-bold text-white tracking-tight uppercase">On-Spot Tracking</span>
        </div>

        <button 
          className="p-3 bg-black/60 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <Share2 size={20} />
        </button>
      </header>

      {/* SOS Button */}
      <div className="absolute bottom-[320px] right-6 z-10">
        <button 
          onClick={() => setIsSOSOpen(true)}
          className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center font-black text-xs shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 transition-transform animate-pulse"
        >
          SOS
        </button>
      </div>

      {/* Bottom Panel */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 300 }}
          animate={{ y: 0 }}
          className={`absolute bottom-0 inset-x-0 bg-[#1A2421] rounded-t-[40px] border-t border-white/5 shadow-3xl z-20 flex flex-col transition-all duration-500 overflow-hidden ${isArrived ? 'h-[55%]' : 'h-auto'}`}
        >
          <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto my-4 shrink-0" />

          <div className="px-8 pb-10 space-y-6">
            {/* Driver Card */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={activeBooking.driverPhoto} className="w-14 h-14 rounded-full border-2 border-white/10" alt="" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-3 border-[#1A2421]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-display font-bold text-white leading-tight font-syne truncate">{activeBooking.driverName}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Star size={12} fill="#7FFF00" className="text-[#7FFF00]" />
                  <span className="text-xs text-white/40 font-bold tracking-tight">{activeBooking.driverRating} ★</span>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[10px] font-bold text-[#7FFF00] uppercase tracking-widest">{activeBooking.vehiclePlate}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleChat(true)}
                  className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                >
                  <MessageSquare size={20} />
                </button>
                <button className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center active:scale-95 transition-transform">
                  <Phone size={20} />
                </button>
              </div>
            </div>

            {/* Main Status / ETA Row */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  {isArrived ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#7FFF00] rounded-full animate-pulse" />
                      <h2 className="text-3xl font-syne font-black text-white uppercase tracking-tight">Keke is here</h2>
                    </div>
                  ) : isArriving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#7FFF00] rounded-full animate-pulse" />
                      <h2 className="text-3xl font-syne font-black text-[#7FFF00] uppercase tracking-tight">Almost there!</h2>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-5xl font-syne font-black text-[#7FFF00] tracking-tighter">{eta} min</h2>
                      <p className="text-sm font-medium text-white/40 mt-1 uppercase tracking-widest">Driver is on the way</p>
                    </>
                  )}
                </div>
                {!isArrived && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Live distance</p>
                    <p className="text-lg font-bold text-white font-syne tracking-tight">📍 {distance > 1000 ? (distance/1000).toFixed(1) + 'km' : distance + 'm'}</p>
                  </div>
                )}
              </div>

              {/* Progress Bar (Approach only) */}
              {isApproaching && !isArrived && (
                <div className="space-y-2">
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      className="h-full bg-[#7FFF00] shadow-[0_0_10px_rgba(127,255,0,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <Navigation size={12} className="text-white/20" />
                    <User size={12} className="text-blue-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle Details Row */}
            <div className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform ${activeBooking.vehicleColor === 'Yellow' ? 'bg-amber-400' : 'bg-[#7FFF00]'}`}>
                  <div className="w-4 h-5 bg-black/80 rounded-sm" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest font-syne">
                    {activeBooking.vehicleColor} {activeBooking.vehicleModel}
                  </h4>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Look for this keke</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-[#7FFF00] uppercase tracking-widest">{activeBooking.vehiclePlate}</p>
              </div>
            </div>

            {/* Waiting Fee Countdown (Only when ARRIVED) */}
            {isArrived && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`p-6 rounded-[32px] flex items-center justify-between ${waitingTimer > 0 ? 'bg-white/5 border border-white/10' : 'bg-amber-500/10 border border-amber-500/20'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${waitingTimer > 0 ? 'bg-white/5' : 'bg-amber-500/20'}`}>
                    <Clock size={24} className={waitingTimer > 0 ? 'text-white/40' : 'text-amber-500'} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                      {waitingTimer > 0 ? 'Free waiting time' : 'Waiting fee running'}
                    </p>
                    <p className={`text-xl font-syne font-black ${waitingTimer > 0 ? 'text-white' : 'text-amber-500'}`}>
                      {waitingTimer > 0 
                        ? `${Math.floor(waitingTimer / 60)}:${(waitingTimer % 60).toString().padStart(2, '0')}`
                        : `NGN 30/min (₦${Math.abs(Math.floor(waitingTimer / 60)) * 30})`
                      }
                    </p>
                  </div>
                </div>
                {waitingTimer > 0 ? (
                  <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-white/20 uppercase tracking-tighter">5:00 limit</div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </motion.div>
            )}

            {/* Final Actions */}
            <div className="space-y-4 pt-4">
              {isArrived ? (
                <button 
                  onClick={() => updateBookingStatus('IN_PROGRESS')}
                  className="w-full h-16 bg-[#7FFF00] rounded-[24px] text-black font-extrabold text-lg uppercase tracking-widest shadow-[0_12px_32px_rgba(127,255,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  I'm in the keke
                </button>
              ) : (
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] py-2">
                  <div className="w-8 h-px bg-white/5" />
                  <span>Stay safe at pickup</span>
                  <div className="w-8 h-px bg-white/5" />
                </div>
              )}

              <button 
                onClick={() => {
                  if (window.confirm('Cancel this booking? A ₦150 cancellation fee will be deducted for drivers on their way.')) {
                    navigate('/home');
                  }
                }}
                className="w-full py-2 text-white/30 text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Cancel booking
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <SOSSheet isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
      <TripChatOverlay />
    </div>
  );
}
