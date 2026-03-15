import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Search, User, Navigation, 
  Plus, X, Info, ArrowRight, Loader2, RefreshCw, 
  Camera, Map as MapIcon, Users, CreditCard, Wallet,
  Star, ChevronRight, Bell
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useOnSpotStore from '../../store/onSpotStore';
import { useStore } from '../../store';
import BalanceWarningSheet from '../../components/BalanceWarningSheet';

// --- Icons & Assets ---

// Redesigned Keke Icon (Top-down silhouette)
const kekeIcon = (keke, isSelected) => {
  const rotation = keke.heading || 0;
  const isAvailable = keke.status === 'AVAILABLE';
  const color = isAvailable ? '#7FFF00' : '#4B5563';
  const opacity = isAvailable ? 1 : 0.4;
  
  return L.divIcon({
    className: 'custom-keke-icon',
    html: `
      <div style="transform: rotate(${rotation}deg); width: 44px; height: 44px; display: flex; items-center; justify-center; opacity: ${opacity}">
        <!-- Shadow -->
        <div style="position: absolute; bottom: 4px; right: 4px; width: 32px; height: 32px; background: rgba(0,0,0,0.3); border-radius: 8px; filter: blur(4px);"></div>
        
        <!-- Selection Ring -->
        ${isSelected ? `<div style="position: absolute; width: 56px; height: 56px; border: 2px solid #7FFF00; border-radius: 50%; animation: pulse 2s infinite;"></div>` : ''}

        <!-- Vehicle Body -->
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="2" width="24" height="36" rx="6" fill="${color}" />
          <rect x="6" y="8" width="20" height="12" rx="2" fill="black" fill-opacity="0.8" />
          <rect x="8" y="4" width="16" height="2" rx="1" fill="white" fill-opacity="0.5" />
          <rect x="6" y="24" width="20" height="10" rx="2" fill="black" fill-opacity="0.6" />
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

const passengerIcon = L.divIcon({
  className: 'passenger-icon',
  html: `
    <div class="relative w-6 h-6">
      <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25"></div>
      <div class="relative w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// --- Map Controllers ---

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

function MapEventsHandler({ onMapClick }) {
  useMapEvents({
    click: () => onMapClick(),
  });
  return null;
}

// --- Main Page ---

export default function OnSpotHome() {
  const navigate = useNavigate();
  const { 
    nearbyKekes, setNearbyKekes, selectedDriver, setSelectedDriver,
    clearSelectedDriver, destination, setDestination, seats, setSeats, 
    paymentMethod, setPaymentMethod, mapEstimateKm, setMapEstimate,
    runBalanceCheck, balanceCheck, resetFlow
  } = useOnSpotStore();

  const { walletBalance, user } = useStore();

  // Local UI State
  const [gpsStatus, setGpsStatus] = useState('detecting');
  const [userCoords, setUserCoords] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);

  // --- 1. Simulation: Load Location & Mock Metadata ---
  useEffect(() => {
    let mockTimeout;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(coords);
          setGpsStatus('success');
          
          // Clear initial kekes so the empty state shows first
          setNearbyKekes([]);

          // Generate mock kekes around user after 5 seconds
          mockTimeout = setTimeout(() => {
            const mocks = [
              {
                driverId: 'drv_001',
                driverName: 'Michael Okon',
                driverPhoto: 'https://i.pravatar.cc/150?u=michael',
                driverRating: 4.9,
                trips: 1247,
                vehiclePlate: 'KJA-123XY',
                vehicleColor: 'Yellow',
                vehicleModel: 'Bajaj RE',
                location: { lat: pos.coords.latitude + 0.0012, lng: pos.coords.longitude + 0.0008, heading: 45 },
                status: 'AVAILABLE',
                distanceMeters: 180,
              },
              {
                driverId: 'drv_002',
                driverName: 'Emeka Nwosu',
                driverPhoto: 'https://i.pravatar.cc/150?u=emeka',
                driverRating: 4.7,
                trips: 842,
                vehiclePlate: 'KJA-456AB',
                vehicleColor: 'Green',
                vehicleModel: 'TVS King',
                location: { lat: pos.coords.latitude - 0.0015, lng: pos.coords.longitude + 0.0021, heading: 220 },
                status: 'AVAILABLE',
                distanceMeters: 320,
              },
              {
                driverId: 'drv_003',
                driverName: 'Taiwo Adeyemi',
                driverPhoto: 'https://i.pravatar.cc/150?u=taiwo',
                driverRating: 4.5,
                trips: 2105,
                vehiclePlate: 'KJA-789CD',
                vehicleColor: 'Yellow',
                vehicleModel: 'Bajaj RE',
                location: { lat: pos.coords.latitude + 0.0022, lng: pos.coords.longitude - 0.0011, heading: 90 },
                status: 'BUSY',
                distanceMeters: 410,
              },
            ];
            
            // Re-fetch coords inside timeout to ensure fresh state, or fallback to initially detected pos
            setNearbyKekes(mocks);
          }, 5000); // 5 seconds instead of 30 for faster testing
        },
        () => {
          setGpsStatus('error');
          // Default to Lagos Island
          setUserCoords([6.4550, 3.3941]);
        }
      );
    }

    return () => {
      if (mockTimeout) clearTimeout(mockTimeout);
    };
  }, []);

  // --- 2. Estimate Calculation Simulation ---
  useEffect(() => {
    if (destination && selectedDriver) {
      setIsEstimating(true);
      const timer = setTimeout(() => {
        const km = (Math.random() * 5 + 2).toFixed(1);
        const fare = 100 + (km * 120 * seats);
        setMapEstimate(parseFloat(km), fare);
        setIsEstimating(false);
        
        // Run balance check
        runBalanceCheck(
          paymentMethod || 'WALLET',
          walletBalance,
          null, // No active sub mock here
          parseFloat(km),
          seats
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [destination, selectedDriver, seats, paymentMethod]);

  const handleBooking = () => {
    if (balanceCheck?.level === 'LOW' || balanceCheck?.level === 'CRITICAL') {
      setShowBalanceSheet(true);
    } else if (balanceCheck?.level === 'BLOCKED') {
      setShowBalanceSheet(true);
    } else {
      proceedToBooking();
    }
  };

  const proceedToBooking = () => {
    // In real app: POST /api/v1/bookings/onspot
    navigate(`/book/onspot/tracking/bk_onspot_${Date.now()}`);
  };

  const availableCount = nearbyKekes.filter(k => k.status === 'AVAILABLE').length;

  if (gpsStatus === 'detecting') {
    return (
      <div className="fixed inset-0 bg-[#1A2421] flex flex-col items-center justify-center z-[1000]">
        <Loader2 size={48} className="text-[#7FFF00] animate-spin mb-4" />
        <p className="text-white/60 font-jakarta uppercase tracking-widest text-xs">Calibrating Map...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#1A2421]">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={userCoords}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          className="grayscale-filter dark-map"
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          <MapEventsHandler onMapClick={() => clearSelectedDriver()} />
          <MapController center={selectedDriver ? [selectedDriver.location.lat - 0.002, selectedDriver.location.lng] : userCoords} />

          {/* 500m Matching Radius */}
          <Circle 
            center={userCoords} 
            radius={500} 
            pathOptions={{ color: '#7FFF00', weight: 2, opacity: 0.4, fillColor: '#7FFF00', fillOpacity: 0.05 }} 
          />

          <Marker position={userCoords} icon={passengerIcon} />

          {nearbyKekes.map((keke) => (
            <Marker 
              key={keke.driverId}
              position={[keke.location.lat, keke.location.lng]}
              icon={kekeIcon(keke, selectedDriver?.driverId === keke.driverId)}
              eventHandlers={{
                click: () => {
                  if (keke.status === 'AVAILABLE') setSelectedDriver(keke);
                }
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Header UI */}
      <header className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => navigate('/home')}
          className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="px-5 py-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 pointer-events-auto">
          <div className={`w-2 h-2 rounded-full ${availableCount > 0 ? 'bg-[#7FFF00] animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">
            {availableCount > 0 ? `${availableCount} Nearby` : 'No kekes nearby'}
          </span>
        </div>
      </header>

      {/* No Kekes Empty State Overlay */}
      {availableCount === 0 && !selectedDriver && (
        <div className="absolute top-28 left-6 right-6 z-10">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-[#1A2421]/90 backdrop-blur-xl p-6 rounded-[32px] border border-red-500/20 shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <Navigation size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-2">No kekes nearby right now</h3>
            <p className="text-xs text-white/50 mb-6 leading-relaxed">
              Try again in a few minutes or use the walk-up option to scan a keke you can see.
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[#7FFF00]"
              >
                Refresh
              </button>
              <button 
                onClick={() => navigate('/book/onspot/walkup')}
                className="flex-1 py-4 bg-[#7FFF00] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-black"
              >
                Walk-up booking
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Sheets */}
      <AnimatePresence>
        {!selectedDriver ? (
          /* Default State: Summary & Walk-up Link */
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 inset-x-0 bg-[#1A2421] rounded-t-[40px] border-t border-white/5 shadow-3xl p-8 z-20"
          >
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-8" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-white">Nearby kekes</h2>
              <div className="px-4 py-2 bg-[#7FFF00]/10 rounded-full text-[10px] font-bold text-[#7FFF00] uppercase tracking-widest">
                {availableCount} Available
              </div>
            </div>

            <button 
              onClick={() => navigate('/book/onspot/walkup')}
              className="w-full bg-[#1A2421] p-6 rounded-[32px] border border-white/10 flex items-center justify-between shadow-xl active:scale-[0.98] transition-transform"
            >
              <div className="text-left">
                <h3 className="text-lg font-bold text-white mb-1">Already with a keke?</h3>
                <p className="text-xs text-white/50">Scan the QR code or enter driver code</p>
              </div>
              <div className="w-14 h-14 bg-[#7FFF00]/10 rounded-2xl flex items-center justify-center">
                <Camera size={28} className="text-[#7FFF00]" />
              </div>
            </button>
          </motion.div>
        ) : (
          /* Driver Selection State */
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute bottom-0 inset-x-0 h-[70%] bg-[#1A2421] rounded-t-[40px] border-t border-white/5 shadow-3xl flex flex-col z-20"
          >
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto my-6 shrink-0" />
            
            <div className="flex-1 overflow-y-auto px-8 space-y-8 pb-32">
              {/* Driver Card */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={selectedDriver.driverPhoto} className="w-18 h-18 rounded-[24px] border border-white/10" alt="" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#7FFF00] rounded-full border-4 border-[#1A2421]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-white">{selectedDriver.driverName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[#7FFF00] text-sm font-bold">
                      <Star size={14} fill="currentColor" /> {selectedDriver.driverRating}
                    </span>
                    <span className="text-white/30 text-xs">({selectedDriver.trips} trips)</span>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">{selectedDriver.vehiclePlate}</div>
                    <span>{selectedDriver.vehicleColor} · {selectedDriver.vehicleModel}</span>
                  </div>
                </div>
                <button 
                  onClick={() => clearSelectedDriver()}
                  className="p-3 bg-white/5 rounded-full text-white/40"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Distance Info */}
              <div className="flex items-center gap-3 px-5 py-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#7FFF00]/10 flex items-center justify-center">
                  <Navigation size={20} className="text-[#7FFF00]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7FFF00] uppercase tracking-widest">Approaching</p>
                  <p className="text-sm font-bold text-white">{selectedDriver.distanceMeters} metres away from you</p>
                </div>
              </div>

              {/* Destination Field */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Where are you heading?</p>
                <div className="flex items-center gap-4 bg-[#1A2421] border border-white/10 p-5 rounded-[24px] focus-within:border-[#7FFF00]/50 transition-all shadow-inner">
                  <Search size={20} className="text-gray-500" />
                  <input 
                    placeholder="Search destination" 
                    value={destination?.address || ''}
                    onChange={(e) => setDestination({ address: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-white text-base"
                  />
                  {destination && <X size={20} className="text-gray-500" onClick={() => setDestination(null)} />}
                </div>
              </div>

              {/* Seats & Payment */}
              {destination && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">How many seats?</p>
                      <div className="flex gap-2 mt-3">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setSeats(n)}
                            className={`w-11 h-11 rounded-full font-bold transition-all ${seats === n ? 'bg-[#7FFF00] text-black scale-110' : 'bg-white/5 text-white/60 text-sm'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Estimate</p>
                      <div className="flex flex-col items-end">
                        {isEstimating ? (
                          <div className="h-8 w-24 bg-white/5 rounded-lg animate-pulse" />
                        ) : (
                          <>
                            <span className="text-2xl font-display font-bold text-[#7FFF00]">₦{mapEstimateKm ? (100 + mapEstimateKm * 120 * seats).toFixed(0) : '0'}</span>
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">~{mapEstimateKm} km (map)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Payment Method</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      <button 
                        onClick={() => setPaymentMethod('WALLET')}
                        className={`px-6 py-4 rounded-2xl flex items-center gap-3 whitespace-nowrap transition-all border ${paymentMethod === 'WALLET' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}
                      >
                        <Wallet size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest">Wallet · ₦{walletBalance}</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('CASH')}
                        className={`px-6 py-4 rounded-2xl flex items-center gap-3 whitespace-nowrap transition-all border ${paymentMethod === 'CASH' ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}
                      >
                        <CreditCard size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest">Cash</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Button Area */}
            {destination && (
              <div className="absolute bottom-0 inset-x-0 p-8 pt-4 bg-[#1A2421] border-t border-white/5">
                {/* Inline Balance Warning */}
                {balanceCheck && balanceCheck.level !== 'SUFFICIENT' && (
                  <div className="mb-4 flex items-center justify-between px-5 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="text-amber-500" size={16} />
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Low wallet balance</span>
                    </div>
                    <button onClick={() => setShowBalanceSheet(true)} className="text-[10px] font-bold text-[#7FFF00] uppercase tracking-widest">Top Up →</button>
                  </div>
                )}

                <button 
                  onClick={handleBooking}
                  disabled={isEstimating || !paymentMethod}
                  className="w-full h-16 bg-[#7FFF00] rounded-[24px] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_12px_32px_rgba(127,255,0,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  Book this keke
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reusable Balance Warning Sheet */}
      <BalanceWarningSheet
        isOpen={showBalanceSheet}
        onClose={() => setShowBalanceSheet(false)}
        onContinue={() => {
          setShowBalanceSheet(false);
          proceedToBooking();
        }}
      />
    </div>
  );
}
