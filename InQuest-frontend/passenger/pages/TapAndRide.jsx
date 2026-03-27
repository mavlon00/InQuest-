import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, QrCode, ShieldAlert, X, 
  Loader2, CheckCircle2, MapPin, Clock, 
  ArrowRight, ShieldCheck, Zap, AlertTriangle
} from 'lucide-react';
import useSubscriptionStore from '../store/subscriptionStore';
import { useStore } from '../store';

export default function TapAndRide() {
  const navigate = useNavigate();
  const { 
    subscription, tapRideSession, startTapRideLink, startTapRide,
    incrementTapRideTimer, completeTapRide, clearTapRideSession,
    updateTapRideAddress, isSubscriptionUsable
  } = useSubscriptionStore();
  const { user, walletBalance } = useStore();

  const [inputCode, setInputCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  
  const timerRef = useRef(null);

  // Auto-increment timer if ride is active
  useEffect(() => {
    if (tapRideSession?.status === 'ACTIVE') {
      timerRef.current = setInterval(() => {
        incrementTapRideTimer();
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [tapRideSession?.status]);

  // Handle manual code entry
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (inputCode.length !== 4) return;
    
    setIsVerifying(true);
    setError(null);
    
    // Simulate lookup
    await new Promise(r => setTimeout(r, 1200));
    
    if (inputCode === '1234' || inputCode === '0000') {
      startTapRideLink({
        driverId: 'drv_99',
        driverName: 'Mustafa Adebayo',
        vehiclePlate: 'LND-456QR',
        vehicleModel: 'Bajaj RE',
        driverRating: 4.8
      });
    } else {
      setError('Invalid driver code. Please check and try again.');
    }
    setIsVerifying(false);
  };

  const handleStartRide = async () => {
    setIsVerifying(true);
    // Simulate trip start API
    await new Promise(r => setTimeout(r, 1000));
    startTapRide(`TRP-${Date.now()}`);
    setIsVerifying(false);
  };

  const handleEndRide = async () => {
    setIsVerifying(true);
    // Simulate end trip
    await new Promise(r => setTimeout(r, 1000));
    completeTapRide();
    setIsVerifying(false);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── STEP 1: LINKING (SCAN/CODE) ───────────────────────────────────────────
  if (!tapRideSession) {
    return (
      <div className="min-h-screen bg-[#1A2421] flex flex-col">
        <header className="pt-12 px-5 mb-8 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-white/50">
            <ChevronLeft size={28} />
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">Subscriber mode</span>
          </div>
        </header>

        <div className="flex-1 px-5 flex flex-col">
          <h1 className="font-display text-4xl font-bold text-white mb-2 leading-tight">Link your trip</h1>
          <p className="text-white/40 text-sm mb-10 uppercase tracking-widest">Scan QR or enter driver code</p>

          {/* QR SCANNER UI MOCK */}
          <div className="relative aspect-square w-full max-w-[320px] mx-auto mb-10 overflow-hidden rounded-[40px] border-4 border-white/5 bg-black/40 flex items-center justify-center">
            {/* Corner Brackets */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-[var(--color-primary)] rounded-tl-xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-[var(--color-primary)] rounded-tr-xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-[var(--color-primary)] rounded-bl-xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-[var(--color-primary)] rounded-br-xl" />
            
            {/* Scan Beam */}
            <motion.div 
              animate={{ y: [40, 240, 40] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="absolute inset-x-8 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent blur-sm z-10"
            />
            
            <QrCode size={120} className="text-white/10" />
            <div className="absolute bottom-12 text-white/30 text-[10px] font-bold uppercase tracking-widest">Position QR inside frame</div>
          </div>

          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center"><span className="bg-[#1A2421] px-4 text-white/20 text-xs font-bold uppercase tracking-[0.3em]">OR ENTRY CODE</span></div>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-14 h-18 rounded-2xl bg-[var(--color-surface-1)] border flex items-center justify-center text-3xl font-display font-bold text-[var(--color-primary)] transition-all ${inputCode.length === i ? 'border-[var(--color-primary)] shadow-[var(--shadow-glow)]' : 'border-white/5'}`}>
                  {inputCode[i] || ''}
                </div>
              ))}
              <input 
                autoFocus
                type="number"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.slice(0, 4))}
                className="absolute inset-0 opacity-0 cursor-default"
              />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-center text-sm font-bold bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                {error}
              </motion.div>
            )}

            <p className="text-center text-white/30 text-[11px] px-10 italic">The driver code is displayed on the driver's phone or a sticker inside the keke.</p>
          </form>
        </div>

        {/* LOADING OVERLAY */}
        <AnimatePresence>
          {isVerifying && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-10 text-center"
            >
              <Loader2 size={48} className="text-[var(--color-primary)] animate-spin mb-6" />
              <h3 className="text-white font-bold text-xl mb-2">Verifying Keke</h3>
              <p className="text-white/50 text-sm">Checking driver status and linking your session...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── STEP 2: LINKED + SUBSCRIPTION CHECK ─────────────────────────────────────
  if (tapRideSession.status === 'LINKED') {
    const isUsable = isSubscriptionUsable();
    const balance = isUsable ? subscription.remainingKm : 0;
    const status = isUsable ? subscription.status : 'NO_SUBSCRIPTION';

    return (
      <div className="min-h-screen bg-[#1A2421] flex flex-col">
        <header className="pt-12 px-5 mb-8">
          <button onClick={clearTapRideSession} className="text-white/50">
            <X size={28} />
          </button>
        </header>

        <div className="flex-1 px-5 flex flex-col">
          {/* DRIVER CARD */}
          <div className="bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-white/5 shadow-2xl mb-8 relative overflow-hidden">
             <div className="absolute right--10 top--10 w-40 h-40 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
             <div className="relative z-10 flex items-center gap-5">
                <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden">
                   <div className="text-white font-display text-2xl font-bold">{tapRideSession.driverName[0]}</div>
                </div>
                <div>
                   <h2 className="text-white font-bold text-xl">{tapRideSession.driverName}</h2>
                   <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                      <span>{tapRideSession.vehiclePlate}</span>
                      <span className="w-1 h-1 bg-white/10 rounded-full" />
                      <span>{tapRideSession.vehicleModel}</span>
                   </div>
                </div>
             </div>
             <div className="mt-6 flex items-center gap-2 text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-4 py-2 rounded-xl border border-[var(--color-primary)]/20 text-xs font-bold uppercase tracking-widest w-fit">
                <ShieldCheck size={14} /> Keke Identity Verified
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-white/40 text-xs font-black uppercase tracking-widest pl-1">Subscription Status</h3>
            
            {/* STATUS CHIP */}
            <div className={`p-6 rounded-[28px] border-2 shadow-2xl relative overflow-hidden ${
              status === 'ACTIVE' ? 'bg-[#1D2A26] border-[#7FFF00]/30' :
              status === 'LOW' ? 'bg-amber-900/10 border-amber-500/30' :
              status === 'CRITICAL' ? 'bg-red-900/10 border-red-500/30' :
              'bg-white/5 border-white/10'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                   <div className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Remaining Balance</div>
                   <div className="font-display text-5xl font-bold text-white">{balance.toFixed(1)} <span className="text-xl font-normal text-white/40">km</span></div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  status === 'ACTIVE' ? 'bg-[var(--color-primary)] text-black' :
                  status === 'LOW' || status === 'CRITICAL' ? 'bg-amber-500 text-black' :
                  'bg-white/10 text-white/50'
                }`}>
                  {status}
                </div>
              </div>

              {!isUsable && (
                <div className="mt-4 flex items-center gap-3 text-red-400 bg-red-400/10 p-3 rounded-xl">
                  <AlertTriangle size={18} />
                  <p className="text-[11px] font-bold">Standard wallet rates will apply (NGN 120/km).</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
               <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/30">
                  <ShieldCheck size={20} />
               </div>
               <p className="text-[10px] text-white/40 leading-relaxed italic">
                  Tap "Start Trip" now. At the end of your ride, the IoT device on this keke will measure the actual distance and deduct it from your balance.
               </p>
            </div>
          </div>

          <div className="mt-auto pb-10 space-y-3">
             <button 
                onClick={handleStartRide}
                className="w-full h-16 bg-[var(--color-primary)] text-black font-bold text-lg rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
             >
                Start Trip <ArrowRight size={24} />
             </button>
             <button 
                onClick={clearTapRideSession}
                className="w-full h-14 bg-transparent text-white/30 text-xs font-bold uppercase tracking-widest"
             >
                Wrong keke? Cancel
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3: RIDE IN PROGRESS ────────────────────────────────────────────────
  if (tapRideSession.status === 'ACTIVE') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col p-6 overflow-hidden">
        <div className="mt-12 flex flex-col items-center text-center flex-1">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-8 border border-[var(--color-primary)]/20"
          >
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-[var(--shadow-glow)]">
              <Zap size={32} className="text-black" />
            </div>
          </motion.div>

          <h1 className="font-display text-4xl font-bold text-white mb-2">Ride in progress</h1>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-12">Trip ID: {tapRideSession.tripId.slice(-8)}</p>

          <div className="space-y-8 w-full max-w-[280px]">
            <div className="space-y-1">
              <div className="text-white/20 text-[10px] font-black uppercase tracking-widest">Elapsed Time</div>
              <div className="font-display text-5xl font-bold text-white tabular-nums tracking-tighter">
                {formatTime(tapRideSession.elapsedSeconds)}
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
               <div className="flex flex-col items-start text-left gap-1">
                  <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Linked Driver</span>
                  <span className="text-white font-bold">{tapRideSession.driverName}</span>
                  <span className="text-white/40 text-[10px] font-medium">{tapRideSession.vehiclePlate}</span>
               </div>
               <div className="h-px bg-white/5" />
               <div className="flex items-center gap-3 text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-ping" />
                  <span className="text-[10px] text-[var(--color-primary)] font-bold uppercase tracking-widest">IoT Tracking Data...</span>
               </div>
            </div>
          </div>
        </div>

        <div className="pb-10 space-y-4">
           {/* BIG RED SOS */}
           <button className="w-full h-20 bg-red-600/10 border-2 border-red-600/30 rounded-3xl flex items-center justify-center gap-4 text-red-600 active:scale-95 transition-all">
              <ShieldAlert size={32} />
              <span className="font-display text-2xl font-black uppercase tracking-wider">SOS Alert</span>
           </button>
           
           <button 
              onClick={handleEndRide}
              className="w-full h-14 bg-white/5 text-white/30 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
           >
              Trip Ending? End Session
           </button>
        </div>
      </div>
    );
  }

  // ─── STEP 4: TRIP COMPLETE ──────────────────────────────────────────────────
  if (tapRideSession.status === 'COMPLETE') {
    // Simulated receipt data
    const actualKm = 4.8;
    const standardRate = 120;
    const subRate = subscription.ratePerKm || 100;
    
    const coveredKm = Math.min(actualKm, subscription.remainingKm);
    const overflowKm = Math.max(0, actualKm - coveredKm);
    
    const subCharge = 0; // Pre-paid
    const walletCharge = Math.round(overflowKm * standardRate) + 100; // 100 is flag fall
    const totalValue = Math.round(actualKm * standardRate) + 100;
    const totalSaved = Math.round(actualKm * (standardRate - subRate));

    return (
      <div className="min-h-screen bg-[#1A2421] flex flex-col p-6">
        <div className="flex-1 flex flex-col items-center">
           <motion.div 
             initial={{ scale: 0, rotate: -30 }}
             animate={{ scale: 1, rotate: 0 }}
             className="w-20 h-20 bg-[var(--color-primary)] rounded-[24px] flex items-center justify-center mb-6 mt-12 shadow-[var(--shadow-glow)]"
           >
              <CheckCircle2 size={40} className="text-black" />
           </motion.div>
           
           <h2 className="font-display text-3xl font-bold text-white mb-2">Trip Complete</h2>
           <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-10">Receipt #INV-{Date.now().toString().slice(-6)}</p>

           {/* MAIN RECEIPT CARD */}
           <div className="w-full bg-white text-black rounded-[32px] p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative">
              <div className="absolute top-0 inset-x-0 h-4 bg-[var(--color-primary)] rounded-t-[32px]" />
              
              <div className="text-center pt-2">
                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Value</div>
                 <div className="font-display text-5xl font-bold">₦{totalValue.toLocaleString()}</div>
              </div>

              <div className="space-y-3 pt-6 border-t border-black/5">
                 <div className="flex justify-between items-center bg-[var(--color-primary)]/10 p-3 rounded-xl border border-[var(--color-primary)]/20">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase">Covered by Subscription</span>
                       <span className="text-[11px] font-medium opacity-60">{coveredKm.toFixed(1)} km at ₦{subRate}/km</span>
                    </div>
                    <span className="font-bold text-[#1D9100]">-₦{Math.round(coveredKm * subRate).toLocaleString()}</span>
                 </div>

                 <div className="space-y-2 px-1">
                    <div className="flex justify-between text-sm">
                       <span className="opacity-50">Flag fall (Wallet)</span>
                       <span className="font-medium">₦100</span>
                    </div>
                    {overflowKm > 0 && (
                       <div className="flex justify-between text-sm">
                          <span className="opacity-50">Overflow km ({overflowKm.toFixed(1)}km × ₦120)</span>
                          <span className="font-medium">₦{Math.round(overflowKm * standardRate).toLocaleString()}</span>
                       </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-black/5">
                       <span className="font-black text-[10px] uppercase tracking-widest">Charged to Wallet</span>
                       <span className="font-display text-2xl font-bold">₦{walletCharge.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-black/5 rounded-2xl p-4 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <PiggyBank size={18} className="text-[#1D9100]" />
                    <span className="text-xs font-bold">Subscription Savings</span>
                 </div>
                 <span className="text-[#1D9100] font-bold">₦{totalSaved.toLocaleString()}</span>
              </div>
           </div>

           <div className="mt-8 bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-3 w-full">
              <Info size={16} className="text-white/30 flex-shrink-0" />
              <p className="text-[10px] text-white/40 italic leading-relaxed">
                 Distances measured by vehicle IoT sensor for maximum accuracy. Dispute? Contact support citing trip ID.
              </p>
           </div>
        </div>

        <div className="pb-10 pt-4">
           <button 
              onClick={() => {
                clearTapRideSession();
                navigate('/subscription');
              }}
              className="w-full h-16 bg-[var(--color-primary)] text-black font-bold rounded-2xl shadow-[var(--shadow-glow)] active:scale-95 transition-all text-lg"
           >
              Done
           </button>
        </div>
      </div>
    );
  }

  return null;
}

function PiggyBank({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z" />
      <path d="M7 11h.01" />
      <path d="M11 7.5a.5.5 0 0 1 .5-.5" />
    </svg>
  );
}
