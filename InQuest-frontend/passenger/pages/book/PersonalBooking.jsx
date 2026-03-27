import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MapPin, Search, User, Users, Phone, Navigation,
  Plus, X, Calendar, Clock, Shield, Wallet, Banknote, CreditCard,
  Info, ArrowRight, Loader2, AlertCircle, RefreshCw, CheckCircle,
  Star, PersonStanding, Bell, ShieldAlert, Share2, Timer
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../../store';

// --- Assets & Icons ---
const customMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--color-primary); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--color-glow);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const driverIcon = new L.DivIcon({
  className: 'driver-icon driver-pulse',
  html: `
    <div style="position: relative; width: 36px; height: 36px; background-color: var(--color-surface-1); border-radius: 10px; border: 2px solid var(--color-primary); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pickupPinIcon = new L.DivIcon({
  className: 'pickup-pin',
  html: `
    <div class="flex flex-col items-center">
      <div class="bg-[var(--color-primary)] text-black px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap mb-1">Your pickup point</div>
      <div class="w-2.5 h-2.5 bg-[var(--color-primary)] border-2 border-white rounded-full"></div>
    </div>
  `,
  iconSize: [100, 40],
  iconAnchor: [50, 40],
});

// --- Map Controller ---
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// --- Main Page ---
export default function PersonalBooking() {
  const navigate = useNavigate();
  const {
    booking, updateBooking, setToastMessage, walletBalance,
    resetBooking, paymentMethods, completeTrip
  } = useStore();

  const [gpsStatus, setGpsStatus] = useState('detecting');
  const [userCoords, setUserCoords] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('Detecting location...');

  // UI States
  const [step, setStep] = useState('SETUP'); // SETUP, FARE_SHEET, FINDING, CONFIRMED, EN_ROUTE, ARRIVING, ARRIVED, IN_PROGRESS, COMPLETE
  const [isForSelf, setIsForSelf] = useState(true);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');

  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [stops, setStops] = useState([]);

  const [scheduleMode, setScheduleMode] = useState('NOW'); // NOW, LATER
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isInsuranceToggled, setIsInsuranceToggled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wallet');

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdown, setCountdown] = useState(300); // 5 mins
  const [acceptanceTimer, setAcceptanceTimer] = useState(null);

  const [driverPos, setDriverPos] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [waitingTime, setWaitingTime] = useState(0);

  const [bannerVisible, setBannerVisible] = useState(false);

  // --- 1. GPS Loading Guard ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(coords);
          setGpsStatus('success');
          // Mock geocoding
          setPickupAddress("15 Aba-Owerri Road, Aba");
        },
        () => {
          setGpsStatus('error');
          setToastMessage('Could not resolve GPS location');
        }
      );
    }
  }, []);

  // --- Simulation Logic ---
  useEffect(() => {
    let interval;
    if (step === 'FINDING') {
      interval = setInterval(() => {
        setElapsedSeconds(s => s + 1);
        setCountdown(c => {
          if (c <= 1) {
            setStep('NO_DRIVER');
            return 0;
          }
          return c - 1;
        });
      }, 1000);

      // Auto-accept between 5-15s (simulated)
      const delay = Math.floor(Math.random() * 10000) + 5000;
      const t = setTimeout(() => {
        updateBooking({
          status: 'ACCEPTED',
          acceptanceTimestamp: Date.now(),
          driver: {
            name: 'Musa Ibrahim',
            photo: 'https://i.pravatar.cc/150?u=musa',
            rating: 4.8,
            trips: 1250,
            vehicle: 'Yellow Keke Napep',
            plate: 'LA 452-XB',
            phone: '08023456789'
          }
        });
        setStep('CONFIRMED');
        setDriverPos([userCoords[0] + 0.01, userCoords[1] + 0.01]);
      }, delay);
      setAcceptanceTimer(t);
    }
    return () => { clearInterval(interval); clearTimeout(acceptanceTimer); };
  }, [step]);

  // En Route Movement Simulation
  useEffect(() => {
    if (step === 'EN_ROUTE' || step === 'ARRIVING') {
      const interval = setInterval(() => {
        setDriverPos(prev => {
          const nextLat = prev[0] - (prev[0] - userCoords[0]) * 0.1;
          const nextLng = prev[1] - (prev[1] - userCoords[1]) * 0.1;

          // Check for ARRIVING state (within 100m - roughly 0.001 deg)
          const dist = Math.sqrt(Math.pow(nextLat - userCoords[0], 2) + Math.pow(nextLng - userCoords[1], 2));
          if (dist < 0.0009 && step === 'EN_ROUTE') {
            setStep('ARRIVING');
            setBannerVisible(true);
            setTimeout(() => setBannerVisible(false), 5000);
          }
          if (dist < 0.0001) {
            setStep('ARRIVED');
            updateBooking({ waitStartTime: Date.now() });
          }
          return [nextLat, nextLng];
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Waiting Fee Logic
  useEffect(() => {
    let interval;
    if (step === 'ARRIVED') {
      interval = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step]);

  const liveWaitingFee = waitingTime > 300 ? Math.floor((waitingTime - 300) / 60) * 30 : 0;

  // --- Destination Alarm (300m) ---
  useEffect(() => {
    if (step === 'IN_PROGRESS' && destinationCoords && driverPos && !booking.alarmFired) {
      const dist = Math.sqrt(
        Math.pow(driverPos[0] - destinationCoords[0], 2) +
        Math.pow(driverPos[1] - destinationCoords[1], 2)
      );
      // Roughly 300m = 0.0027 degrees
      if (dist < 0.0027) {
        updateBooking({ alarmFired: true });
        setStep('DESTINATION_ALARM');
      }
    }
  }, [driverPos, step, destinationCoords, booking.alarmFired]);

  const handleCancelTrip = () => {
    const now = Date.now();
    const acceptanceTime = booking.acceptanceTimestamp;
    const diff = (now - acceptanceTime) / 1000;

    if (diff > 180) { // 3 minutes
      setToastMessage('A ₦150 cancellation fee applied.');
      // Deduction logic would trigger here
    } else {
      setToastMessage('Cancelled within grace period. No fee.');
    }
    resetBooking();
    navigate('/home');
  };

  const calculateFare = () => {
    const base = 1200;
    const deadMileage = 250;
    const stopFees = stops.length * 300;
    const insurance = isInsuranceToggled ? 100 : 0;
    return { base, deadMileage, stopFees, insurance, total: base + deadMileage + stopFees + insurance };
  };

  const fare = calculateFare();

  // --- UI Components ---
  if (gpsStatus === 'detecting') {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center z-[1000]">
        <Loader2 size={48} className="text-[var(--color-primary)] animate-spin mb-4" />
        <p className="text-[var(--color-text-secondary)] font-jakarta">Finding your location...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Layer 1 - Map Layer (Base) */}
      <div className="absolute inset-0 z-1">
        <MapContainer
          center={userCoords}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {/* User / Pickup Pin */}
          <Marker position={userCoords} icon={step === 'CONFIRMED' || step === 'EN_ROUTE' ? pickupPinIcon : customMarkerIcon} />

          {/* Driver Markers */}
          {driverPos && (
            <>
              <Marker position={driverPos} icon={driverIcon} />
              {(step === 'CONFIRMED' || step === 'EN_ROUTE') && (
                <Polyline positions={[driverPos, userCoords]} color="var(--color-primary)" weight={3} dashArray="8, 12" />
              )}
            </>
          )}

          <MapController
            center={step === 'ARRIVING' ? userCoords : (driverPos || userCoords)}
            zoom={(step === 'CONFIRMED' || step === 'EN_ROUTE' || step === 'ARRIVING' || step === 'ARRIVED' || step === 'IN_PROGRESS') ? 16 : 15}
          />
        </MapContainer>
      </div>

      {/* Layer 2 - UI Overlays (z-index 100+) */}

      {/* BACK BUTTON */}
      <div className="fixed top-6 left-6 z-[100]">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full border border-white/10 shadow-lg active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* SETUP HUD */}
      {step === 'SETUP' && (
        <div className="fixed top-[84px] inset-x-4 z-[100] space-y-4">
          <div className="bg-[var(--color-surface-1)] rounded-[32px] shadow-2xl p-6 border border-[var(--color-border-subtle)] space-y-6">
            {/* For Me / Someone Else */}
            <div className="flex bg-[var(--color-surface-2)] p-1 rounded-full">
              <button onClick={() => setIsForSelf(true)} className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${isForSelf ? 'bg-[var(--color-primary)] text-black' : 'text-gray-400'}`}>For Me</button>
              <button onClick={() => setIsForSelf(false)} className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${!isForSelf ? 'bg-[var(--color-primary)] text-black' : 'text-gray-400'}`}>For Someone Else</button>
            </div>

            <AnimatePresence>
              {!isForSelf && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 pt-2">
                  <input placeholder="Who are you booking for?" value={passengerName} onChange={e => setPassengerName(e.target.value)} className="w-full bg-[var(--color-surface-2)] border-none px-5 py-3.5 rounded-2xl text-sm font-semibold" />
                  <div className="flex gap-3">
                    <div className="bg-[var(--color-surface-2)] px-4 py-3.5 rounded-2xl text-sm font-bold opacity-60">+234</div>
                    <input placeholder="10-digit phone" value={passengerPhone} onChange={e => setPassengerPhone(e.target.value)} className="flex-1 bg-[var(--color-surface-2)] border-none px-5 py-3.5 rounded-2xl text-sm font-semibold" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-[var(--color-surface-2)] p-4 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                <span className="flex-1 text-sm font-bold truncate">{pickupAddress}</span>
                <RefreshCw size={18} className="text-[var(--color-primary)] cursor-pointer" />
              </div>

              <div className="flex items-center gap-4 bg-[var(--color-surface-2)] p-4 rounded-2xl border border-transparent focus-within:border-[var(--color-primary)]/30 transition-colors">
                <div className="w-2.5 h-2.5 border-2 border-[#ADFF2F] rounded-sm" />
                <input
                  placeholder="Where to?"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none font-bold text-sm"
                />
                <Search size={20} className="text-gray-500" />
              </div>
              <button className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-primary)] pl-6"><Plus size={14} /> ADD STOP</button>
            </div>
          </div>

          <div className="bg-[var(--color-surface-1)] rounded-3xl p-5 border border-[var(--color-border-subtle)] shadow-xl space-y-4">
            <div className="flex bg-[var(--color-surface-2)] p-1 rounded-full">
              <button onClick={() => setScheduleMode('NOW')} className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${scheduleMode === 'NOW' ? 'bg-[var(--color-primary)] text-black' : 'text-gray-400'}`}>Now</button>
              <button onClick={() => setScheduleMode('LATER')} className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${scheduleMode === 'LATER' ? 'bg-[var(--color-primary)] text-black' : 'text-gray-400'}`}>Schedule</button>
            </div>
          </div>
        </div>
      )}


      {/* FOOTER BUTTONS: SETUP */}
      {step === 'SETUP' && (
        <div className="fixed bottom-10 inset-x-6 z-[100]">
          <button
            onClick={() => setStep('FARE_SHEET')}
            disabled={!destination}
            className={`w-full py-5 rounded-[24px] font-bold text-lg transition-all shadow-2xl ${destination ? 'bg-[var(--color-primary)] text-black active:scale-[0.98]' : 'bg-gray-800 text-gray-500 grayscale'}`}
          >
            {scheduleMode === 'NOW' ? 'Continue' : 'Schedule Ride'}
          </button>
        </div>
      )}

      {/* FARE SHEET (STEP 2) */}
      <AnimatePresence>
        {step === 'FARE_SHEET' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStep('SETUP')} className="absolute inset-0 bg-black/70 z-[100]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute bottom-0 inset-x-0 h-[65%] bg-[var(--color-surface-1)] rounded-t-[40px] z-[101] p-8 border-t border-white/5 shadow-3xl flex flex-col">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-8 shrink-0" />
              <div className="flex-1 overflow-y-auto space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-400"><div className="w-2 h-2 rounded-full bg-gray-500" />{pickupAddress}</div>
                  <div className="w-px h-4 bg-gray-700 ml-1" />
                  <div className="flex items-center gap-3 text-sm font-semibold"><div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />{destination}</div>
                </div>
                <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 space-y-3 font-jakarta">
                  <div className="flex justify-between text-sm"><span className="opacity-60">Base Fare</span><span className="font-bold">₦{fare.base}</span></div>
                  <div className="flex justify-between text-sm items-center"><span className="opacity-60 flex items-center gap-1.5 cursor-pointer" onClick={() => setShowTooltip(!showTooltip)}>Dead Mileage Fee <Info size={14} /></span><span className="font-bold">₦{fare.deadMileage}</span></div>
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-sm"><span className="flex items-center gap-3 font-bold"><Shield size={18} className="text-[#ADFF2F]" /> Insure Trip</span><button onClick={() => setIsInsuranceToggled(!isInsuranceToggled)} className={`w-12 h-7 rounded-full relative transition-all ${isInsuranceToggled ? 'bg-[#ADFF2F]' : 'bg-gray-700'}`}><motion.div animate={{ x: isInsuranceToggled ? 24 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full" /></button></div>
                </div>
                <div className="flex justify-between items-center px-4 border-l-4 border-[#ADFF2F]">
                  <div><p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Estimated Total</p><h2 className="text-3xl font-display font-bold text-[#ADFF2F]">₦{fare.total}</h2></div>
                </div>
              </div>
              <div className="pt-6 space-y-3">
                <button onClick={() => { updateBooking({ status: 'REQUESTED' }); setStep('FINDING'); }} className="w-full py-5 bg-[#ADFF2F] text-black font-bold text-lg rounded-[24px] shadow-2xl">Confirm & Find Driver</button>
                <button onClick={() => setStep('SETUP')} className="w-full py-4 text-gray-500 font-bold">Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FINDING (STEP 3) */}
      <AnimatePresence>
        {step === 'FINDING' && (
          <div className="absolute inset-0 z-[150] flex flex-col">
            <div className="flex-1 flex items-center justify-center pointer-events-none">
              {[0, 0.8, 1.6].map(d => (
                <motion.div key={d} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 4.5], opacity: [0, 0.5, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: d }} className="absolute w-60 h-60 border-[4px] border-[#ADFF2F] rounded-full" />
              ))}
            </div>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} className="p-8 bg-[var(--color-surface-1)] rounded-t-[40px] shadow-3xl border-t border-white/5 space-y-6">
              <h2 className="text-2xl font-display font-bold">Finding your driver...</h2>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: 300, ease: 'linear' }} className="h-full bg-[var(--color-primary)]" />
              </div>
              <button onClick={() => setStep('SETUP')} className="w-full py-4 border border-white/10 rounded-2xl text-gray-500 font-bold">Cancel Search</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NO DRIVER (STEP 3.5) */}
      {step === 'NO_DRIVER' && (
        <div className="absolute inset-0 z-[150] bg-[var(--color-bg)] flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-bold mb-2">No drivers available</h2>
          <p className="text-gray-400 mb-10">We couldn't find a driver near you. Try again?</p>
          <button onClick={() => { setStep('FINDING'); setCountdown(300); }} className="w-full py-4 bg-[var(--color-primary)] text-black font-bold rounded-2xl mb-3">Try Again</button>
          <button onClick={() => setStep('SETUP')} className="w-full py-4 text-gray-500 font-bold">Cancel</button>
        </div>
      )}

      {/* CONFIRMED / EN ROUTE (STEP 4 & 5) */}
      {(step === 'CONFIRMED' || step === 'EN_ROUTE' || step === 'ARRIVING') && (
        <>
          <AnimatePresence>
            {bannerVisible && (
              <motion.div
                initial={{ y: -100 }}
                animate={{ y: 24 }}
                exit={{ y: -100 }}
                className="fixed top-0 inset-x-6 bg-[var(--color-surface-1)] p-5 rounded-3xl border border-[var(--color-primary)]/30 shadow-2xl z-[200] flex items-center gap-4"
              >
                <Bell size={20} className="text-[var(--color-primary)]" />
                <p className="font-bold text-sm">Your driver is almost here. Head to pickup.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="fixed bottom-8 inset-x-6 z-[160] bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <img src={booking.driver?.photo} className="w-14 h-14 rounded-2xl border border-white/10" />
              <div className="flex-1"><h3 className="text-lg font-bold">{booking.driver?.name}</h3><p className="text-[10px] uppercase font-bold text-gray-500">{booking.driver?.vehicle} • {booking.driver?.plate}</p></div>
              <div className="text-amber-500 font-bold flex items-center gap-1"><Star size={16} fill="currentColor" /> {booking.driver?.rating}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep('EN_ROUTE')} className="py-4 bg-[#ADFF2F] text-black font-bold rounded-2xl shadow-lg">Track Ride</button>
              <button className="py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10">Chat</button>
            </div>
          </div>
        </>
      )}

      {/* ARRIVED (STEP 7) */}
      {step === 'ARRIVED' && (
        <div className="fixed bottom-8 inset-x-6 z-[160] bg-[var(--color-surface-1)] rounded-[32px] p-7 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3 items-center"><MapPin className="text-[var(--color-success)]" size={24} /><div><h2 className="text-xl font-bold text-[var(--color-success)]">Driver Arrived</h2><p className="text-sm font-bold opacity-60">At pickup point</p></div></div>
            <div className="text-right text-lg font-display font-bold">{Math.floor(waitingTime / 60)}:{(waitingTime % 60).toString().padStart(2, '0')}</div>
          </div>
          {liveWaitingFee > 0 && <div className="mb-6 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 flex justify-between text-xs font-bold uppercase"><span>Waiting Fee</span><span>₦{liveWaitingFee}</span></div>}
          <button onClick={() => { setStep('IN_PROGRESS'); setToastMessage('Trip started!'); }} className="w-full py-5 bg-[var(--color-primary)] text-black font-bold text-lg rounded-[24px]">I'm On My Way</button>
        </div>
      )}

      {/* IN PROGRESS (STEP 8) */}
      {step === 'IN_PROGRESS' && (
        <>
          <div className="fixed bottom-10 left-6 z-[160]"><button onClick={() => navigator.share?.({ title: 'Track my ride', url: window.location.href })} className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center active:scale-95 transition-transform"><Share2 size={24} /></button></div>
          <div className="fixed bottom-10 right-6 z-[160]"><button className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(220,0,0,0.5)] active:scale-95 transition-transform"><ShieldAlert size={28} /></button></div>
          <div className="fixed bottom-28 inset-x-6 bg-[var(--color-surface-1)] p-6 rounded-[32px] border border-white/10 shadow-2xl z-[160]">
            <div className="flex justify-between items-center"><div className="flex-1"><p className="text-[10px] uppercase font-bold opacity-40 mb-1">Heading to</p><h3 className="text-lg font-bold truncate">{destination}</h3></div><div className="text-right"><p className="text-[10px] uppercase font-bold opacity-40 mb-1">ETA</p><p className="text-lg font-bold text-[var(--color-primary)]">~12 min</p></div></div>
            <button onClick={() => setStep('COMPLETE')} className="w-full mt-6 py-4 bg-white/5 text-white font-bold rounded-2xl">Simulate Arrival</button>
          </div>
        </>
      )}

      {/* DEST ALARM (STEP 9) */}
      <AnimatePresence>
        {step === 'DESTINATION_ALARM' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[600] bg-black/95 flex flex-col items-center justify-center p-10 text-center">
            <div className="w-24 h-24 bg-[var(--color-primary)] text-black rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(173,255,47,0.6)] mb-8 animate-bounce"><MapPin size={48} /></div>
            <h2 className="text-4xl font-display font-bold mb-4">Approaching Stop</h2>
            <p className="text-xl opacity-60 mb-12">Prepare to alight — 300m away</p>
            <button onClick={() => setStep('IN_PROGRESS')} className="px-12 py-5 bg-[var(--color-primary)] text-black font-bold rounded-[32px] text-lg shadow-2xl">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPLETE / RATING (STEP 10) */}
      <AnimatePresence>
        {step === 'COMPLETE' && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="fixed inset-0 bg-[var(--color-bg)] z-[1000] p-8 overflow-y-auto font-jakarta">
            <div className="max-w-md mx-auto py-10 space-y-8">
              <div className="text-center"><div className="w-20 h-20 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={48} className="text-[var(--color-success)]" /></div><h1 className="text-3xl font-display font-bold">Trip Complete</h1></div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10"><p className="text-[10px] font-bold opacity-40 mb-1 uppercase tracking-widest">Duration</p><p className="text-xl font-bold">14 min</p></div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10"><p className="text-[10px] font-bold opacity-40 mb-1 uppercase tracking-widest">Distance</p><p className="text-xl font-bold">3.2 km</p></div>
              </div>
              <div className="bg-white/5 p-7 rounded-[40px] border border-white/10 space-y-4">
                <h3 className="text-xs font-bold opacity-60 uppercase mb-4 tracking-widest">Trip Fare breakdown</h3>
                <div className="space-y-3 text-sm font-semibold">
                  <div className="flex justify-between"><span>Base Fare</span><span>₦1,200</span></div>
                  <div className="flex justify-between"><span>Dead Mileage Fee</span><span>₦250</span></div>
                  {liveWaitingFee > 0 && <div className="flex justify-between"><span>Waiting Time Fee</span><span>₦{liveWaitingFee}</span></div>}
                  <div className="flex justify-between text-[var(--color-success)]"><span>Insurance</span><span>₦100</span></div>
                  <div className="pt-5 border-t border-white/10 flex justify-between items-center"><span className="text-lg">Total Paid</span><span className="text-3xl font-display font-bold text-[var(--color-primary)]">₦{fare.total + liveWaitingFee}</span></div>
                </div>
              </div>
              <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center">
                <img src={booking.driver?.photo} className="w-16 h-16 rounded-2xl mx-auto mb-4" />
                <p className="font-bold mb-6">Rate {booking.driver?.name}</p>
                <div className="flex justify-center gap-2 mb-8">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={32} className="text-gray-700 hover:text-amber-400" />)}</div>
                <button onClick={() => { completeTrip(5, ''); navigate('/home'); }} className="w-full py-5 bg-[var(--color-primary)] text-black font-bold text-lg rounded-[24px]">Submit & Go Home</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTooltip && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute bottom-40 left-8 right-8 bg-black/90 p-6 rounded-2xl border border-white/20 z-[300] shadow-3xl text-xs"><p className="opacity-80">Covers your driver's journey from their current location to reach your pickup point.</p><button onClick={() => setShowTooltip(false)} className="mt-4 font-bold text-[var(--color-primary)] uppercase tracking-widest">Got it</button></motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
