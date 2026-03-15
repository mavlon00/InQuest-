import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  ChevronLeft, MapPin, Search, Clock, 
  Calendar, CheckCircle2, AlertCircle, Info,
  Loader2, ArrowRight, X, Sparkles, Zap, 
  ChevronRight, ArrowLeft, Map as MapIcon, Navigation
} from 'lucide-react';
import useRecurringStore from '../../store/recurringStore';
import useSubscriptionStore from '../../store/subscriptionStore';

// Nominatim geocoding helper
const searchNominatim = async (query) => {
  if (!query || query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ng&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  return res.json();
};

// Estimate fare: NGN 120/km base
const estimateFare = (distKm) => Math.round(distKm * 120);
const estimateDuration = (distKm) => Math.round(distKm * 3.5);
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Map click handler component
function MapClickHandler({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng); } });
  return null;
}

export default function RecurringBookingCreate() {
  const navigate = useNavigate();
  const { 
    draftSchedule, updateDraft, checkConflicts, 
    checkHolidays, createSchedule, resetDraft,
    setDraftRouteData 
  } = useRecurringStore();
  const { subscription } = useSubscriptionStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── STEP 1: ROUTE SELECTION ───────────────────────────────────────────────
  const RenderStep1 = () => {
    const [pickupQuery, setPickupQuery] = useState(draftSchedule.pickup?.address || '');
    const [destQuery, setDestQuery] = useState(draftSchedule.destination?.address || '');
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [destSuggestions, setDestSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null); // 'pickup' | 'destination'
    const [showMap, setShowMap] = useState(false);
    const [mapPickTarget, setMapPickTarget] = useState(null); // 'pickup' | 'destination'
    const [pickupLocation, setPickupLocation] = useState(draftSchedule.pickup);
    const [destLocation, setDestLocation] = useState(draftSchedule.destination);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeout = useRef(null);

    // Route summary computed from two confirmed points
    const routeSummary = pickupLocation && destLocation ? (() => {
      const distKm = haversineKm(pickupLocation.lat, pickupLocation.lng, destLocation.lat, destLocation.lng);
      return { distKm: distKm.toFixed(1), duration: estimateDuration(distKm), fare: estimateFare(distKm) };
    })() : null;

    const handleSearch = (query, field) => {
      if (field === 'pickup') setPickupQuery(query);
      else setDestQuery(query);

      clearTimeout(searchTimeout.current);
      if (query.length < 3) {
        if (field === 'pickup') setPickupSuggestions([]);
        else setDestSuggestions([]);
        return;
      }
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        const results = await searchNominatim(query);
        if (field === 'pickup') setPickupSuggestions(results);
        else setDestSuggestions(results);
        setIsSearching(false);
      }, 400);
    };

    const selectSuggestion = (result, field) => {
      const loc = { address: result.display_name.split(',').slice(0,2).join(','), lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
      if (field === 'pickup') { setPickupLocation(loc); setPickupQuery(loc.address); setPickupSuggestions([]); }
      else { setDestLocation(loc); setDestQuery(loc.address); setDestSuggestions([]); }
      setActiveField(null);
    };

    const handleMapPick = (latlng) => {
      // Reverse geocode
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(r => r.json())
        .then(data => {
          const loc = { address: data.display_name?.split(',').slice(0,2).join(',') || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`, lat: latlng.lat, lng: latlng.lng };
          if (mapPickTarget === 'pickup') { setPickupLocation(loc); setPickupQuery(loc.address); }
          else { setDestLocation(loc); setDestQuery(loc.address); }
          setShowMap(false);
        });
    };

    const handleConfirm = () => {
      if (!pickupLocation || !destLocation) return;
      const distKm = parseFloat(haversineKm(pickupLocation.lat, pickupLocation.lng, destLocation.lat, destLocation.lng).toFixed(1));
      setDraftRouteData(distKm, estimateDuration(distKm), estimateFare(distKm));
      updateDraft({ pickup: pickupLocation, destination: destLocation });
      setStep(2);
    };

    const customIcon = (color) => L.divIcon({
      className: '',
      html: `<div style="width:20px;height:20px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
      iconSize: [20, 20], iconAnchor: [10, 10]
    });

    if (showMap) return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">
            Pick {mapPickTarget === 'pickup' ? 'Pickup' : 'Destination'} on Map
          </h3>
          <button onClick={() => setShowMap(false)} className="p-2 rounded-full bg-white/10 text-white/60"><X size={18} /></button>
        </div>
        <p className="text-white/40 text-sm">Tap anywhere on the map to set your {mapPickTarget} location</p>
        <div className="rounded-[24px] overflow-hidden border border-white/10" style={{ height: '60vh' }}>
          <MapContainer
            center={[6.5244, 3.3792]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
            <MapClickHandler onPick={handleMapPick} />
            {pickupLocation && <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={customIcon('#7FFF00')} />}
            {destLocation && <Marker position={[destLocation.lat, destLocation.lng]} icon={customIcon('#EF4444')} />}
          </MapContainer>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-white font-display text-3xl font-bold">The Route</h2>
          <p className="text-white/40 text-sm">Where are you going every day?</p>
        </div>

        <div className="space-y-3">
          {/* PICKUP INPUT */}
          <div className="relative">
            <div className={`bg-[var(--color-surface-1)] border rounded-[20px] p-4 flex items-center gap-3 transition-all ${activeField === 'pickup' ? 'border-[var(--color-primary)]' : 'border-white/5'}`}>
              <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-white/30 font-black uppercase mb-0.5">Pickup</div>
                <input
                  type="text"
                  value={pickupQuery}
                  onChange={e => handleSearch(e.target.value, 'pickup')}
                  onFocus={() => setActiveField('pickup')}
                  placeholder="Search pickup location..."
                  className="w-full bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/20"
                />
              </div>
              {pickupQuery ? (
                <button onClick={() => { setPickupQuery(''); setPickupLocation(null); setPickupSuggestions([]); }} className="text-white/30">
                  <X size={14} />
                </button>
              ) : (
                <button onClick={() => { setMapPickTarget('pickup'); setShowMap(true); }} className="text-white/30 hover:text-[var(--color-primary)] transition-colors">
                  <MapIcon size={16} />
                </button>
              )}
            </div>
            {/* Pickup Suggestions */}
            <AnimatePresence>
              {activeField === 'pickup' && (pickupSuggestions.length > 0 || isSearching) && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-[#1D2A26] border border-white/10 rounded-[16px] overflow-hidden z-50 shadow-2xl">
                  {isSearching ? (
                    <div className="flex items-center gap-2 p-4 text-white/40 text-sm"><Loader2 size={14} className="animate-spin" /> Searching...</div>
                  ) : pickupSuggestions.map((r, i) => (
                    <button key={i} onMouseDown={() => selectSuggestion(r, 'pickup')}
                      className="w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors flex items-start gap-3">
                      <MapPin size={14} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                      <span className="text-white/80 text-sm leading-snug">{r.display_name?.split(',').slice(0, 3).join(', ')}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CONNECTOR */}
          <div className="flex justify-center">
            <div className="w-0.5 h-5 bg-white/10" />
          </div>

          {/* DESTINATION INPUT */}
          <div className="relative">
            <div className={`bg-[var(--color-surface-1)] border rounded-[20px] p-4 flex items-center gap-3 transition-all ${activeField === 'destination' ? 'border-red-500' : 'border-white/5'}`}>
              <MapPin size={16} className="text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-white/30 font-black uppercase mb-0.5">Destination</div>
                <input
                  type="text"
                  value={destQuery}
                  onChange={e => handleSearch(e.target.value, 'destination')}
                  onFocus={() => setActiveField('destination')}
                  placeholder="Search destination..."
                  className="w-full bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/20"
                />
              </div>
              {destQuery ? (
                <button onClick={() => { setDestQuery(''); setDestLocation(null); setDestSuggestions([]); }} className="text-white/30">
                  <X size={14} />
                </button>
              ) : (
                <button onClick={() => { setMapPickTarget('destination'); setShowMap(true); }} className="text-white/30 hover:text-red-500 transition-colors">
                  <MapIcon size={16} />
                </button>
              )}
            </div>
            {/* Destination Suggestions */}
            <AnimatePresence>
              {activeField === 'destination' && (destSuggestions.length > 0 || isSearching) && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-[#1D2A26] border border-white/10 rounded-[16px] overflow-hidden z-50 shadow-2xl">
                  {isSearching ? (
                    <div className="flex items-center gap-2 p-4 text-white/40 text-sm"><Loader2 size={14} className="animate-spin" /> Searching...</div>
                  ) : destSuggestions.map((r, i) => (
                    <button key={i} onMouseDown={() => selectSuggestion(r, 'destination')}
                      className="w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors flex items-start gap-3">
                      <MapPin size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <span className="text-white/80 text-sm leading-snug">{r.display_name?.split(',').slice(0, 3).join(', ')}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ROUTE SUMMARY */}
        {routeSummary && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 p-5 rounded-[24px] border border-white/5 grid grid-cols-3 gap-4">
            <div>
              <div className="text-white/30 text-[9px] font-black uppercase mb-1">Distance</div>
              <div className="text-white font-display text-xl font-bold">{routeSummary.distKm} km</div>
            </div>
            <div>
              <div className="text-white/30 text-[9px] font-black uppercase mb-1">Duration</div>
              <div className="text-white font-display text-xl font-bold">~{routeSummary.duration} min</div>
            </div>
            <div>
              <div className="text-white/30 text-[9px] font-black uppercase mb-1">Base Fare</div>
              <div className="text-[var(--color-primary)] font-display text-xl font-bold">₦{routeSummary.fare}</div>
            </div>
          </motion.div>
        )}

        <button 
          onClick={handleConfirm}
          disabled={!pickupLocation || !destLocation}
          className="w-full h-16 bg-[var(--color-primary)] disabled:opacity-30 disabled:shadow-none text-black font-bold rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          Confirm Route <ArrowRight size={20} />
        </button>
      </div>
    );
  };

  // ─── STEP 2: SCHEDULE LOGIC ───────────────────────────────────────────────
  const RenderStep2 = () => {
    const days = [
      { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' },
      { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' },
      { id: 7, label: 'Sun' }
    ];

    const toggleDay = (dayId) => {
      const current = draftSchedule.daysOfWeek;
      const next = current.includes(dayId) 
        ? current.filter(id => id !== dayId)
        : [...current, dayId].sort();
      updateDraft({ daysOfWeek: next });
    };

    const canContinue = draftSchedule.daysOfWeek.length > 0 && draftSchedule.time;

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-white font-display text-3xl font-bold">The Schedule</h2>
          <p className="text-white/40 text-sm">When do you want to travel?</p>
        </div>

        <div className="space-y-4">
           <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Repeat on</div>
           <div className="grid grid-cols-4 gap-3">
              {days.map(day => (
                <button 
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`h-14 rounded-2xl border font-bold text-xs transition-all ${
                    draftSchedule.daysOfWeek.includes(day.id)
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-black'
                      : 'bg-white/5 border-white/5 text-white/40'
                  }`}
                >
                  {day.label}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Pickup Time</div>
              <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                 <Clock size={16} className="text-white/30" />
                 <input 
                    type="time"
                    value={draftSchedule.time || ''}
                    onChange={(e) => updateDraft({ time: e.target.value })}
                    className="bg-transparent border-none outline-none text-white font-bold w-full"
                 />
              </div>
           </div>
           
           <div className="space-y-2">
              <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Start Date</div>
              <div className="bg-[var(--color-surface-1)] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                 <Calendar size={16} className="text-white/30" />
                 <input 
                    type="date"
                    value={draftSchedule.startDate || ''}
                    onChange={(e) => updateDraft({ startDate: e.target.value })}
                    className="bg-transparent border-none outline-none text-white font-bold w-full"
                 />
              </div>
           </div>
        </div>

        <div className="bg-[var(--color-surface-2)] rounded-[28px] p-6 border border-white/5">
           <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-bold">Return Trip?</h4>
              <button 
                onClick={() => updateDraft({ hasReturn: !draftSchedule.hasReturn })}
                className={`w-12 h-6 rounded-full relative transition-colors ${draftSchedule.hasReturn ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
              >
                <motion.div 
                  animate={{ x: draftSchedule.hasReturn ? 26 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                />
              </button>
           </div>
           <p className="text-[10px] text-white/40 mb-6">Same route but in reverse. Usually for evening commute.</p>
           
           <AnimatePresence>
              {draftSchedule.hasReturn && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 pt-4 border-t border-white/5"
                >
                   <div className="space-y-2">
                      <div className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-1">Return Pickup Time</div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                         <Clock size={16} className="text-white/30" />
                         <input 
                            type="time"
                            value={draftSchedule.returnTime || ''}
                            onChange={(e) => updateDraft({ returnTime: e.target.value })}
                            className="bg-transparent border-none outline-none text-white font-bold w-full"
                         />
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        <button 
           disabled={!canContinue}
           onClick={async () => {
             await checkConflicts(draftSchedule.daysOfWeek, draftSchedule.time);
             checkHolidays(draftSchedule.daysOfWeek, draftSchedule.startDate || new Date().toISOString().split('T')[0]);
             setStep(3);
           }}
           className={`w-full h-16 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
             canContinue ? 'bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)]' : 'bg-white/5 text-white/20'
           }`}
        >
           Next Flow <ArrowRight size={20} />
        </button>
      </div>
    );
  };

  // ─── STEP 3: PAYMENT & CONFIRM ─────────────────────────────────────────────
  const RenderStep3 = () => {
    const isUsable = isSubscriptionUsable();
    const hasConflict = draftSchedule.hasConflict;
    const hasHolidays = draftSchedule.upcomingHolidays.length > 0;

    const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        await createSchedule({
          ...draftSchedule,
          paymentMethod: isUsable ? 'SUBSCRIPTION' : 'WALLET'
        });
        resetDraft();
        navigate('/book/recurring');
      } catch (e) {
        console.error(e);
      }
      setIsSubmitting(false);
    };

    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-white font-display text-3xl font-bold">Almost set</h2>
          <p className="text-white/40 text-sm">Review details and confirm</p>
        </div>

        <div className="space-y-6">
           {/* PAYMENT STATUS & UPSELL */}
           <div className={`p-6 rounded-[32px] border-2 shadow-xl ${isUsable ? 'bg-[#1D2A26] border-[#7FFF00]/30 transition-all' : 'bg-[#1A1A1A] border-white/10'}`}>
              <div className="flex justify-between items-center mb-6">
                 <div className="text-[10px] font-black uppercase tracking-widest text-white/50">Payment Flow</div>
                 <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${isUsable ? 'bg-[var(--color-primary)] text-black' : 'bg-red-500/10 text-red-500'}`}>
                    {isUsable ? 'Subscription-First' : 'Subscription Required for Full Value'}
                 </div>
              </div>
              
              {isUsable ? (
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                      <Zap size={32} />
                   </div>
                   <div>
                      <h4 className="text-white font-bold text-lg">{subscription.tierName} Active</h4>
                      <p className="text-white/40 text-[10px] italic">
                         ~{draftSchedule.routeDistanceKm}km will be deducted automatically each ride.
                      </p>
                   </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="flex items-center gap-4 opacity-50">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20">
                         <CreditCard size={24} />
                      </div>
                      <div>
                         <h4 className="text-white/60 font-bold">No Active Pass</h4>
                         <p className="text-white/30 text-[10px]">Standard rates apply via wallet.</p>
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t border-white/5 space-y-4">
                      <div className="text-xs font-bold text-white/80">Recommended for this route:</div>
                      <div 
                        onClick={() => navigate('/subscription/checkout/starter')}
                        className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center text-[var(--color-primary)]">
                               <Zap size={20} />
                            </div>
                            <div>
                               <div className="text-white font-bold text-sm text-[var(--color-primary)]">Starter Pass</div>
                               <div className="text-[10px] text-white/40">50km • Save up to ₦2,500</div>
                            </div>
                         </div>
                         <ChevronRight size={18} className="text-white/20 group-hover:text-[var(--color-primary)]" />
                      </div>
                      <p className="text-[10px] text-white/30 leading-relaxed italic">
                        Buying a pass now will cover all rides in this schedule and save you ~25% overall.
                      </p>
                   </div>
                </div>
              )}
           </div>

           {/* CONFLICTS */}
           {hasConflict && (
              <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex gap-4">
                 <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                 <div>
                    <h4 className="text-red-400 font-bold text-sm mb-1">Time Conflict Detected</h4>
                    <p className="text-[11px] text-white/40 leading-relaxed">
                       You already have <span className="text-white font-bold">"{draftSchedule.conflictDetails?.name}"</span> scheduled at this time. Overlapping schedules might delay driver matching.
                    </p>
                 </div>
              </div>
           )}

           {/* HOLIDAYS */}
           <div className="bg-white/5 border border-white/5 rounded-[28px] p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-white/30" />
                    <h4 className="text-white font-bold text-sm">Holiday Awareness</h4>
                 </div>
                 <button 
                   onClick={() => updateDraft({ skipHolidays: !draftSchedule.skipHolidays })}
                   className={`w-12 h-6 rounded-full relative transition-colors ${draftSchedule.skipHolidays ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                 >
                   <motion.div 
                     animate={{ x: draftSchedule.skipHolidays ? 26 : 2 }}
                     className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" 
                   />
                 </button>
              </div>
              <p className="text-[10px] text-white/40 mb-4 italic">Automatically skip rides on Nigerian Public Holidays.</p>
              
              {draftSchedule.skipHolidays && hasHolidays && (
                 <div className="bg-[#1A2421] rounded-xl p-3 border border-white/5 space-y-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#7FFF00]">Upcoming skips</div>
                    {draftSchedule.upcomingHolidays.slice(0, 2).map((h, i) => (
                       <div key={i} className="flex justify-between items-center text-[10px]">
                          <span className="text-white/60">{h.name}</span>
                          <span className="text-white/30">{h.date}</span>
                       </div>
                    ))}
                 </div>
              )}
           </div>

           {/* NOTIFICATIONS */}
           <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Bell size={18} className="text-white/30" />
                 <span className="text-sm font-medium text-white/80">Prep Reminders</span>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => updateDraft({ notifications: { ...draftSchedule.notifications, oneHour: !draftSchedule.notifications.oneHour } })}
                   className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${draftSchedule.notifications.oneHour ? 'bg-[var(--color-primary)] text-black' : 'bg-white/5 text-white/40'}`}
                 >
                   1h
                 </button>
                 <button 
                   onClick={() => updateDraft({ notifications: { ...draftSchedule.notifications, fifteenMin: !draftSchedule.notifications.fifteenMin } })}
                   className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${draftSchedule.notifications.fifteenMin ? 'bg-[var(--color-primary)] text-black' : 'bg-white/5 text-white/40'}`}
                 >
                   15m
                 </button>
              </div>
           </div>
        </div>

        <div className="pt-4 space-y-3">
           <button 
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full h-16 bg-[var(--color-primary)] text-black font-bold text-lg rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
           >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Set Schedule'}
           </button>
           <button 
              onClick={() => setStep(2)}
              className="w-full h-14 bg-transparent text-white/30 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
           >
              <ArrowLeft size={16} /> Back to Schedule
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A2421] pb-10">
      <header className="pt-12 px-5 mb-8 flex items-center justify-between">
        <button 
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else navigate(-1);
          }}
          className="text-white/50"
        >
          <ChevronLeft size={28} />
        </button>
        
        {/* Progress Bar */}
        <div className="flex gap-2">
           {[1, 2, 3].map(s => (
             <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-[var(--color-primary)]' : 'w-4 bg-white/10'}`} />
           ))}
        </div>

        <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/30">
           <Zap size={20} />
        </div>
      </header>

      <div className="px-5">
         {step === 1 && <RenderStep1 />}
         {step === 2 && <RenderStep2 />}
         {step === 3 && <RenderStep3 />}
      </div>
    </div>
  );
}

function Bell({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function CreditCard({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
