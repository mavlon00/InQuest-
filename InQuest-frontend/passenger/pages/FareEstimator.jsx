import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, MapPin, Search, X, ArrowUpDown, 
  Info, Sparkles, Map as MapIcon, Loader2, ArrowRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store';
import useSubscriptionStore from '../store/subscriptionStore';

// ─── MAP ICONS ───────────────────────────────────────────────────────────────
const makeIcon = (color, size = 14) =>
  new L.DivIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const pickupIcon = makeIcon('#7FFF00', 16);
const destinationIcon = makeIcon('#EF4444', 16);

// ─── MAP CONTROLS ────────────────────────────────────────────────────────────
function MapUpdater({ pickup, destination }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && destination) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lng], [destination.lat, destination.lng]);
      map.fitBounds(bounds, { padding: [60, 60], animate: true });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 15, { animate: true });
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 15, { animate: true });
    }
  }, [pickup, destination, map]);
  return null;
}

// ─── MOCK GEOSPATIAL DATA ─────────────────────────────────────────────────────
const mockPlaces = [
  { address: 'Ikeja City Mall, Alausa, Ikeja, Lagos', lat: 6.6018, lng: 3.3515 },
  { address: 'Eko Atlantic City, Victoria Island, Lagos', lat: 6.4281, lng: 3.4219 },
  { address: 'Lekki Phase 1, Lagos', lat: 6.4698, lng: 3.5852 },
  { address: 'Murtala Muhammed Airport, Ikeja, Lagos', lat: 6.5774, lng: 3.3212 },
  { address: 'National Stadium, Surulere, Lagos', lat: 6.5068, lng: 3.3605 },
  { address: 'Lagos Island General Hospital, Lagos', lat: 6.4537, lng: 3.4205 },
  { address: 'Blenco Supermarket, Lekki, Lagos', lat: 6.4479, lng: 3.5006 },
  { address: 'Shoprite, Palms Mall, Lekki, Lagos', lat: 6.4357, lng: 3.4920 },
  { address: 'Victoria Island, Lagos', lat: 6.4323, lng: 3.4180 },
  { address: 'Yaba, Lagos', lat: 6.5161, lng: 3.3733 },
];

// ─── FARE ESTIMATOR COMPONENT ─────────────────────────────────────────────────
export default function FareEstimator() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useStore();
  const { subscription, isSubscriptionUsable } = useSubscriptionStore();

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [mapCenter, setMapCenter] = useState([6.4550, 3.3841]); // Default Lagos Island
  const [zoom, setZoom] = useState(13);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  // Search states
  const [pickupQuery, setPickupQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [focusedField, setFocusedField] = useState(null); // 'pickup' | 'destination'

  // GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setMapCenter([lat, lng]);
          setZoom(15);
          setPickup({ lat, lng, address: 'Current Location' });
          setPickupQuery('Current Location');
        },
        () => {
          // Denied, stay on Lagos Island
        }
      );
    }
  }, []);

  // Calculate fare when both set
  useEffect(() => {
    if (pickup && destination) {
      calculateFare();
    } else {
      setShowResults(false);
    }
  }, [pickup, destination]);

  const calculateFare = async () => {
    setIsCalculating(true);
    setShowResults(false);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));
    
    // Simple Euclidean distance for mock (approx degrees to km)
    const d = Math.sqrt(
      Math.pow(pickup.lat - destination.lat, 2) + 
      Math.pow(pickup.lng - destination.lng, 2)
    ) * 111; // 1 degree ~ 111km
    
    setDistance(parseFloat(d.toFixed(1)));
    setDuration(Math.round(d * 3)); // Assume 3 min per km for Lagos traffic
    setIsCalculating(false);
    setShowResults(true);
  };

  const handleSwap = () => {
    const tempP = pickup;
    const tempPQ = pickupQuery;
    setPickup(destination);
    setPickupQuery(destQuery);
    setDestination(tempP);
    setDestQuery(tempPQ);
  };

  const handleSelectPlace = (place) => {
    if (focusedField === 'pickup') {
      setPickup(place);
      setPickupQuery(place.address);
    } else {
      setDestination(place);
      setDestQuery(place.address);
    }
    setFocusedField(null);
  };

  const filteredPlaces = mockPlaces.filter(p => {
    const q = focusedField === 'pickup' ? pickupQuery : destQuery;
    return p.address.toLowerCase().includes(q.toLowerCase());
  });

  const getStandardFare = (dist) => Math.round(100 + (dist * 120));
  const getSubFare = (dist, rate) => Math.round(100 + (dist * rate));

  const standardFare = getStandardFare(distance);

  return (
    <div className="fixed inset-0 bg-[#1A2421] overflow-hidden">
      {/* ─── MAP BACKGROUND ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapUpdater pickup={pickup} destination={destination} />
          
          {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
          {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}
          
          {pickup && destination && (
            <Polyline 
              positions={[[pickup.lat, pickup.lng], [destination.lat, destination.lng]]} 
              color="#7FFF00" 
              weight={4} 
            />
          )}
        </MapContainer>
      </div>

      {/* Map Decoration Overlay */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#1A2421] to-transparent pointer-events-none" style={{ zIndex: 2 }} />

      {/* ─── BACK BUTTON ─────────────────────────────────────────────────────── */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-12 left-5 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white"
        style={{ zIndex: 20 }}
      >
        <ChevronLeft size={24} />
      </button>

      {/* ─── BOTTOM SHEET ─────────────────────────────────────────────────────── */}
      <div 
        className="absolute inset-x-0 bottom-0 pointer-events-auto"
        style={{ zIndex: 10 }}
      >
        <motion.div 
          initial={{ y: '55%' }}
          animate={{ y: focusedField ? '0%' : '0%' }}
          className="bg-[var(--color-surface-1)] rounded-t-[32px] shadow-[0_-8px_40px_rgba(0,0,0,0.5)] border-t border-white/5 flex flex-col max-h-[90vh]"
        >
          {/* DRAG HANDLE */}
          <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto my-4 flex-shrink-0" />

          {/* CONTENT CONTAINER */}
          <div className="px-5 pb-8 overflow-y-auto custom-scrollbar">
            <h2 className="font-display text-2xl font-semibold text-white mb-6">Fare Estimator</h2>

            {/* ─── INPUTS ─────────────────────────────────────────────────── */}
            <div className="relative space-y-3 mb-6">
              {/* Vertical Route Line */}
              <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#7FFF00] to-[#EF4444] opacity-30" />

              {/* Pickup */}
              <div className={`flex items-center gap-4 bg-[var(--color-surface-2)] rounded-2xl p-4 border transition-all ${focusedField === 'pickup' ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : 'border-white/5'}`}>
                <div className="w-4 h-4 rounded-full bg-[#7FFF00] ring-4 ring-[#7FFF00]/20 flex-shrink-0" />
                <input 
                  value={pickupQuery}
                  onChange={(e) => {setPickupQuery(e.target.value); setPickup(null);}}
                  onFocus={() => setFocusedField('pickup')}
                  placeholder="Where from?"
                  className="bg-transparent border-none outline-none text-white font-medium flex-1 placeholder:text-white/30"
                />
                {pickupQuery && (
                  <button onClick={() => {setPickupQuery(''); setPickup(null);}}>
                    <X size={18} className="text-white/30" />
                  </button>
                )}
              </div>

              {/* SWAP BUTTON */}
              <button 
                onClick={handleSwap}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--color-surface-3)] rounded-full border border-white/10 flex items-center justify-center text-white z-10 hover:scale-110 transition-transform shadow-lg"
              >
                <ArrowUpDown size={14} />
              </button>

              {/* Destination */}
              <div className={`flex items-center gap-4 bg-[var(--color-surface-2)] rounded-2xl p-4 border transition-all ${focusedField === 'destination' ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : 'border-white/5'}`}>
                <MapPin size={20} className="text-[#EF4444] flex-shrink-0" />
                <input 
                  value={destQuery}
                  onChange={(e) => {setDestQuery(e.target.value); setDestination(null);}}
                  onFocus={() => setFocusedField('destination')}
                  placeholder="Where to?"
                  className="bg-transparent border-none outline-none text-white font-medium flex-1 placeholder:text-white/30"
                />
                {destQuery && (
                  <button onClick={() => {setDestQuery(''); setDestination(null);}}>
                    <X size={18} className="text-white/30" />
                  </button>
                )}
              </div>
            </div>

            {/* ─── AUTOCOMPLETE LIST ────────────────────────────────────────── */}
            <AnimatePresence>
              {focusedField && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--color-surface-2)] rounded-2xl border border-white/5 overflow-hidden mb-6"
                >
                  {filteredPlaces.length > 0 ? (
                    filteredPlaces.map((place, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSelectPlace(place)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                      >
                        <Search size={18} className="text-white/30" />
                        <span className="text-white/80 font-medium truncate">{place.address}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-white/30 text-sm italic">
                      No results found for {focusedField === 'pickup' ? pickupQuery : destQuery}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── LOADING STATE ───────────────────────────────────────────── */}
            {isCalculating && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                <p className="text-white/50 text-sm font-medium">Calculating the best route...</p>
              </div>
            )}

            {/* ─── RESULTS ─────────────────────────────────────────────────── */}
            <AnimatePresence>
              {showResults && !focusedField && !isCalculating && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="space-y-5"
                >
                  {/* ROUTE SUMMARY */}
                  <div className="flex items-center gap-3 text-sm font-medium text-white/50 bg-white/5 p-3 rounded-xl border border-white/5">
                    <MapIcon size={16} />
                    <span>{distance} km · approximately {duration} minutes</span>
                  </div>
                  <p className="text-[11px] text-white/30 italic -mt-4 pl-1">Via actual roads — map estimate only</p>

                  {/* STANDARD FARE CARD */}
                  <div className="bg-[var(--color-surface-2)] rounded-[24px] p-5 border border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white/50 text-sm font-medium uppercase tracking-wider">Standard fare</span>
                      <button 
                        onClick={() => setBreakdownOpen(!breakdownOpen)}
                        className="text-[var(--color-primary)] text-xs font-semibold hover:underline"
                      >
                        {breakdownOpen ? 'Hide breakdown' : 'See breakdown'}
                      </button>
                    </div>

                    <div className="font-display text-4xl font-bold text-[var(--color-primary)] mb-2">
                      NGN {standardFare.toLocaleString()}
                    </div>

                    <AnimatePresence>
                      {breakdownOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-white/5 mt-3 pt-3 space-y-2 text-sm"
                        >
                          <div className="flex justify-between text-white/50">
                            <span>Flag fall</span>
                            <span>NGN 100</span>
                          </div>
                          <div className="flex justify-between text-white/50">
                            <span>{distance}km × NGN 120/km</span>
                            <span>NGN {(distance * 120).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-white border-t border-white/10 pt-2 font-bold">
                            <span>Total estimate</span>
                            <span>NGN {standardFare.toLocaleString()}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-[11px] text-white/30 italic mt-3 leading-relaxed">
                      Actual fare calculated from IoT-measured distance after your trip. Map estimate shown for planning only.
                    </p>
                  </div>

                  {/* SUBSCRIPTION COMPARISON */}
                  <div className="bg-[#1A2421] border border-[#7FFF00]/30 rounded-[24px] p-5 shadow-2xl relative">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#7FFF00] animate-pulse" />
                        <span className="text-white font-semibold">With a subscription</span>
                      </div>
                      <Link to="/subscription" className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                        See plans <ArrowRight size={12} />
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: 'Starter', rate: 110, id: 'starter' },
                        { name: 'Commuter', rate: 100, id: 'commuter' },
                        { name: 'Premium', rate: 90, id: 'premium' },
                        { name: 'Unlimited', rate: 80, id: 'unlimited' }
                      ].map((tier) => {
                        const tierFare = getSubFare(distance, tier.rate);
                        const savings = standardFare - tierFare;
                        const isCurrent = subscription?.tierId === tier.id && isSubscriptionUsable();

                        return (
                          <div 
                            key={tier.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isCurrent ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/50' : 'bg-white/5 border-white/5'}`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{tier.name}</span>
                                {isCurrent && <span className="text-[10px] bg-[var(--color-primary)] text-black px-1.5 py-0.5 rounded-full font-bold uppercase">Your plan</span>}
                              </div>
                              <span className="text-white/40 text-[10px]">NGN {tier.rate}/km</span>
                            </div>
                            <div className="text-right">
                              <div className="text-[#7FFF00] font-bold">NGN {tierFare.toLocaleString()}</div>
                              <div className="text-white/30 text-[10px]">Save NGN {savings}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40 bg-white/5 p-2 rounded-lg">
                      <Info size={12} />
                      <span>+ NGN 100 flag fall per trip (not covered by subscription)</span>
                    </div>

                    {subscription && isSubscriptionUsable() && (
                      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Your estimated deduction:</span>
                          <span className="text-[var(--color-primary)] font-bold">~{distance}km</span>
                        </div>
                        <div className="flex justify-between text-xs text-white/60">
                          <span>Balance after this trip:</span>
                          <span>~{(subscription.remainingKm - distance).toFixed(1)}km</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ─── CTA BUTTONS ─────────────────────────────────────────── */}
                  <div className="pt-4 space-y-3">
                    {!isAuthenticated ? (
                      <>
                        <button 
                          onClick={() => navigate('/register', { state: { pickup, destination } })}
                          className="w-full h-14 bg-[var(--color-primary)] text-black font-bold rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                        >
                          Book this trip
                        </button>
                        <div className="text-center text-sm text-white/50">
                          Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-bold">Login</Link>
                        </div>
                      </>
                    ) : !isSubscriptionUsable() ? (
                      <>
                        <button 
                          onClick={() => navigate('/book/personal', { state: { pickup, destination } })}
                          className="w-full h-14 bg-[var(--color-primary)] text-black font-bold rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                        >
                          Book now
                        </button>
                        <button 
                          onClick={() => navigate('/subscription')}
                          className="w-full h-14 bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded-2xl flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
                        >
                          Get a subscription first <ArrowRight size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => navigate('/book/personal', { state: { pickup, destination, paymentMethod: 'SUBSCRIPTION' } })}
                          className="w-full h-14 bg-[var(--color-primary)] text-black font-bold rounded-2xl shadow-[var(--shadow-glow)] flex flex-col items-center justify-center transform active:scale-[0.98] transition-all"
                        >
                          <span>Book with subscription</span>
                          <span className="text-[10px] font-medium opacity-70">~{distance}km from your {subscription.remainingKm}km balance</span>
                        </button>
                        <button 
                          onClick={() => navigate('/book/personal', { state: { pickup, destination } })}
                          className="w-full h-14 bg-transparent text-white/50 font-bold rounded-2xl flex items-center justify-center gap-2 hover:text-white transition-colors"
                        >
                          Book without subscription
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tap instruction */}
            {!showResults && !focusedField && !isCalculating && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <Sparkles className="text-[var(--color-primary)]" size={32} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Enter a route</h3>
                  <p className="text-white/40 text-sm max-w-[200px] mx-auto uppercase tracking-widest">To see your exact fare estimate</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── TAP ON MAP INSTRUCTION ──────────────────────────────────────────── */}
      {!showResults && !focusedField && (
        <div className="absolute top-28 inset-x-0 flex justify-center pointer-events-none" style={{ zIndex: 5 }}>
          <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Or tap on the map</p>
          </div>
        </div>
      )}
    </div>
  );
}
