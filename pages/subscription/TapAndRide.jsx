import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Maximize, AlertCircle, ShieldAlert, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function TapAndRide() {
  const navigate = useNavigate();
  const { 
    activeSubscription, 
    tapRideSession, 
    startTapRideLink, 
    startTapRide, 
    incrementTapRideTimer, 
    completeTapRide, 
    clearTapRideSession,
    deductKm
  } = useSubscriptionStore();
  
  const [codeDigits, setCodeDigits] = useState(['', '', '', '']);
  const [isScanning, setIsScanning] = useState(true);
  const [scanError, setScanError] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Clean up on unmount or on first load if we accidentally got here via back button
  useEffect(() => {
    if (!activeSubscription) {
      navigate('/subscription', { replace: true });
    }
  }, [activeSubscription, navigate]);

  // Manage trip timer
  useEffect(() => {
    let timer;
    if (tapRideSession?.status === 'ACTIVE') {
      timer = setInterval(() => {
        incrementTapRideTimer();
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [tapRideSession?.status, incrementTapRideTimer]);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...codeDigits];
    newDigits[index] = value;
    setCodeDigits(newDigits);
    setScanError(null);

    // Auto focus next
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
    
    // Auto submit on last digit
    if (index === 3 && value) {
      const code = newDigits.join('');
      if (code === '1234') { // Mock valid code
        handleLinkSuccess();
      } else {
        setScanError("Invalid code. Ask your driver.");
        setTimeout(() => {
          setCodeDigits(['', '', '', '']);
          inputRefs[0].current.focus();
          setScanError(null);
        }, 1500);
      }
    }
  };

  const handleLinkSuccess = () => {
    setIsScanning(false);
    // Mock linking to a driver
    startTapRideLink({
      driverName: "Michael Okon",
      vehiclePlate: "KJA-123XY",
      vehicleColor: "Yellow",
      vehicleModel: "Bajaj RE"
    });
  };

  const fmtMinSec = (secs) => {
    if (!secs) return "0:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeSubscription) return null;

  const percentRemaining = (activeSubscription.kmRemaining / activeSubscription.kmTotal) * 100;
  let kmColor = 'bg-[var(--color-km-full)]';
  if (percentRemaining <= 30) kmColor = 'bg-[var(--color-km-low)]';
  if (percentRemaining <= 10) kmColor = 'bg-[var(--color-km-empty)]';

  // State 1: Scanning / Code Entry
  if (!tapRideSession) {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-white active:bg-white/10 z-10">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-display font-bold text-center flex-1 -ml-10 text-white">Tap & Ride</h1>
        </div>

        {/* Subscription Status Bar */}
        <div 
          onClick={() => navigate('/subscription')}
          className="w-full px-4 mb-6 cursor-pointer"
        >
          <div className="bg-[var(--color-surface-1)] rounded-full px-4 py-2 flex items-center justify-between border border-[var(--color-surface-3)]">
            <span className="text-xs font-semibold text-white">{activeSubscription.kmRemaining.toFixed(1)} km remaining</span>
            <div className="w-24 h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
              <div className={`h-full ${kmColor}`} style={{ width: `${percentRemaining}%` }} />
            </div>
          </div>
        </div>

        {/* QR Scanner Area */}
        <div className="w-full max-w-sm px-6 flex-1 flex flex-col items-center pt-8">
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-6 text-center">
            Scan the QR code inside the keke cabin
          </p>

          <div 
            onClick={handleLinkSuccess} // Hidden trigger for desktop testing
            className="w-64 h-64 border-2 border-dashed border-[var(--color-primary)]/50 rounded-[var(--radius-xl)] relative mb-12 flex items-center justify-center bg-[var(--color-surface-1)] cursor-pointer"
          >
            {/* Animated brackets */}
            <Maximize className="absolute inset-0 w-full h-full text-[var(--color-primary)]/30 scale-110 pointer-events-none" strokeWidth={1} />
            <div className="text-center opacity-50">
              <p className="text-xs text-[var(--color-primary)]">[ Camera Viewfinder ]</p>
              <p className="text-[10px] mt-1 text-white/50">(Tap box to simulate scan)</p>
            </div>
          </div>

          <div className="w-full pt-6 border-t border-[var(--color-surface-3)]">
            <h3 className="text-sm font-bold text-center text-white mb-4">Or enter driver code</h3>
            <div className={`flex justify-center gap-3 ${scanError ? 'animate-shake' : ''}`}>
              {codeDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="number"
                  inputMode="numeric"
                  pattern="\d*"
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  className={`w-14 h-16 bg-[var(--color-surface-2)] text-center text-2xl font-display font-bold text-white rounded-[var(--radius-md)] border-2 focus:outline-none transition-colors ${
                    scanError ? 'border-[var(--color-error)] text-[var(--color-error)]' : 
                    digit ? 'border-[var(--color-primary)]' : 'border-transparent focus:border-[var(--color-primary)]/50'
                  }`}
                  maxLength={1}
                />
              ))}
            </div>
            {scanError && (
              <p className="text-[10px] font-bold text-[var(--color-error)] text-center mt-3 uppercase tracking-widest">{scanError}</p>
            )}
            <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-4">(Hint: type 1234 to proceed)</p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Ride Ready (Linked)
  if (tapRideSession.status === 'LINKED') {
    return (
      <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col px-4 pt-12 pb-8">
        <button onClick={() => clearTapRideSession()} className="p-2 -ml-2 mb-4 w-fit rounded-full text-white active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        
        <h1 className="text-3xl font-display font-bold text-white mb-8">Ride Ready</h1>

        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-surface-3)] mb-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-surface-3)]">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] shrink-0 overflow-hidden">
              <img src="https://i.pravatar.cc/150?u=michael" alt="Driver" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-1">{tapRideSession.driverName}</h2>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                <span className="bg-[var(--color-surface-2)] px-2 py-0.5 rounded">{tapRideSession.vehiclePlate}</span>
                <span>• {tapRideSession.vehicleColor} {tapRideSession.vehicleModel}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold text-white">
              <span>Subscription covered per-km fare</span>
              <CheckCircle2 size={18} className="text-[var(--color-success)]" />
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-[var(--color-text-secondary)]">
              <span>Flag fall (charged to wallet)</span>
              <span>₦100</span>
            </div>
            
            <div className="pt-4 border-t border-[var(--color-surface-3)]">
              <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
                <span>Remaining credit</span>
                <span className="text-white">{activeSubscription.kmRemaining.toFixed(1)} km</span>
              </div>
              <div className="w-full h-2 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
                <div className={`h-full ${kmColor}`} style={{ width: `${percentRemaining}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4">
          <button
            onClick={() => startTapRide('trip_001')}
            className="w-full h-14 bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-[var(--radius-xl)] font-bold text-lg active:scale-95 transition-transform shadow-[var(--shadow-glow)]"
          >
            START RIDE
          </button>
        </div>
      </div>
    );
  }

  // State 3: Active Trip & Completion
  const isComplete = tapRideSession.status === 'COMPLETE';
  const simulatedIotKm = ((tapRideSession.elapsedSeconds || 0) * 0.05).toFixed(1); // Mock 50m per sec
  const mapEstKm = (parseFloat(simulatedIotKm) + 1.2).toFixed(1);

  if (isComplete) {
    // ── Completion Screen ──
    const flagFall = 100;
    const finalKm = parseFloat(simulatedIotKm);
    
    // Simulate overflow logic for display
    let usedFromSub = finalKm;
    let overflowCharge = 0;
    let remainingSub = activeSubscription.kmRemaining - finalKm;
    
    if (finalKm > activeSubscription.kmRemaining) {
      usedFromSub = activeSubscription.kmRemaining;
      remainingSub = 0;
      const overflowKm = finalKm - activeSubscription.kmRemaining;
      overflowCharge = overflowKm * 120; // standard rate
    }

    return (
      <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center px-4 pt-16 pb-8 animate-fade-in overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-[var(--color-success)]" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-2">Trip Complete</h1>
        <p className="text-[var(--color-text-secondary)] font-semibold mb-8">Tap & Ride Session</p>

        <div className="w-full max-w-sm bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-6 border border-[var(--color-surface-3)] mb-8">
          <div className="flex justify-between items-end mb-6 pb-6 border-b border-[var(--color-surface-3)]">
            <div>
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">IoT Distance</p>
              <h2 className="text-4xl font-display font-bold text-[var(--color-primary)]">{finalKm} <span className="text-xl">km</span></h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Duration</p>
              <p className="text-lg font-bold text-white">{fmtMinSec(tapRideSession.elapsedSeconds)}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm font-semibold">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Deducted from subscription</span>
              <span className="text-[var(--color-primary)]">-{usedFromSub.toFixed(1)} km</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Remaining subscription</span>
              <span className="text-white">{Math.max(0, remainingSub).toFixed(1)} km</span>
            </div>

            <div className="pt-4 border-t border-[var(--color-surface-3)] flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Flag fall charged to wallet</span>
              <span className="text-white">₦{flagFall}</span>
            </div>
            
            {overflowCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--color-warning)]">Overflow charged to wallet</span>
                <span className="text-[var(--color-warning)]">₦{Math.floor(overflowCharge)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating Placeholder */}
        <div className="mb-auto w-full max-w-sm flex justify-center gap-2">
          {[1,2,3,4,5].map(i => (
            <button key={i} className="p-2 text-[var(--color-surface-3)] active:text-[var(--color-warning)] transition-colors"><Star size={32} /></button>
          ))}
        </div>

        <button
          onClick={() => {
            deductKm(finalKm);
            clearTapRideSession();
            navigate('/home', { replace: true });
          }}
          className="w-full max-w-sm h-14 bg-[var(--color-surface-2)] text-white rounded-[var(--radius-xl)] font-bold text-lg active:bg-[var(--color-surface-3)] transition-colors mt-8"
        >
          Done
        </button>
      </div>
    );
  }

  // ── Active Trip State ──
  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col pt-12 pb-8">
      {/* Absolute SOS Button */}
      <div className="absolute top-12 right-4 z-50">
         <button className="w-12 h-12 rounded-full bg-[var(--color-error)] text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center border border-white/20 active:scale-95 transition-transform animate-pulse">
            <ShieldAlert size={16} className="mb-0.5" />
            <span className="text-[9px] font-bold">SOS</span>
          </button>
      </div>

      <div className="px-6 flex flex-col items-center text-center mt-8 mb-auto">
        <h2 className="text-lg font-semibold text-[var(--color-text-secondary)] mb-2">Tap & Ride in progress</h2>
        <div className="text-5xl font-display font-bold text-white mb-8 tracking-tighter">
          {fmtMinSec(tapRideSession.elapsedSeconds)}
        </div>

        <div className="w-full bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-8 border border-[var(--color-surface-3)] shadow-[var(--shadow-glow)] relative overflow-hidden">
          {/* Subtle radar pulse effect */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-primary)] opacity-50 shadow-[0_0_20px_var(--color-primary)]"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">IoT Sensor Active</p>
            </div>
            
            <h1 className="text-6xl font-display font-bold text-[var(--color-primary)] tracking-tighter mb-4">
              {simulatedIotKm} <span className="text-2xl">km</span>
            </h1>
            
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">Map estimate: {mapEstKm} km</p>
          </div>
        </div>
      </div>

      <div className="px-4 w-full">
        {isEnding ? (
           <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-6 space-y-4">
             <h3 className="text-lg font-bold text-white text-center mb-2">End this ride?</h3>
             <button
                onClick={completeTapRide}
                className="w-full h-14 bg-[var(--color-error)] text-white rounded-[var(--radius-xl)] font-bold shadow-[0_0_20px_rgba(248,113,113,0.3)]"
              >
                Confirm End Ride
              </button>
              <button
                onClick={() => setIsEnding(false)}
                className="w-full h-12 text-sm font-bold text-[var(--color-text-secondary)]"
              >
                Cancel
              </button>
           </div>
        ) : (
          <button
            onClick={() => setIsEnding(true)}
            className="w-full h-14 bg-[var(--color-surface-0)] border-2 border-[var(--color-error)]/50 text-[var(--color-error)] rounded-[var(--radius-xl)] font-bold text-lg active:bg-[var(--color-error)]/10 transition-colors"
          >
            END RIDE
          </button>
        )}
      </div>
    </div>
  );
}

// Inline Icon to save imports
function CheckCircle2({ size = 24, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
