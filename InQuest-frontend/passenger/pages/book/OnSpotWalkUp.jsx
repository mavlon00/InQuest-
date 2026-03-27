import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Camera, QrCode as QrIcon, X, Loader2, 
  Search, MapPin, Users, Wallet, CreditCard, 
  ChevronRight, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import useOnSpotStore from '../../store/onSpotStore';
import { useStore } from '../../store';
import BalanceWarningSheet from '../../components/BalanceWarningSheet';

export default function OnSpotWalkUp() {
  const navigate = useNavigate();
  const { 
    walkUpSession, linkDriver, clearWalkUpSession,
    destination, setDestination, seats, setSeats,
    paymentMethod, setPaymentMethod, mapEstimateKm, setMapEstimate,
    runBalanceCheck, balanceCheck, resetFlow
  } = useOnSpotStore();
  
  const { walletBalance, setToastMessage } = useStore();

  // Step 1 UI State
  const [step, setStep] = useState('LINK'); // LINK, DESTINATION
  const [method, setMethod] = useState(null); // QR, CODE
  const [driverCode, setDriverCode] = useState(['', '', '', '']);
  const [isLinking, setIsLinking] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const codeInputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Step 2 UI State
  const [isEstimating, setIsEstimating] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);

  // --- 1. Step 1: Linking Logic ---

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value[0];
    const newCode = [...driverCode];
    newCode[index] = value;
    setDriverCode(newCode);

    if (value && index < 3) {
      codeInputRefs[index + 1].current.focus();
    }

    if (newCode.every(c => c !== '')) {
      submitCode(newCode.join(''));
    }
  };

  const submitCode = async (code) => {
    setIsLinking(true);
    try {
      await linkDriver(code);
      setStep('DESTINATION');
    } catch (err) {
      setToastMessage(err.message || 'Failed to link driver');
      setDriverCode(['', '', '', '']);
      codeInputRefs[0].current.focus();
    } finally {
      setIsLinking(false);
    }
  };

  const handleQRScan = () => {
    setIsScanning(true);
    // Simulation for camera access, but call real link
    setTimeout(async () => {
      setIsScanning(false);
      await submitCode('MOCK_QR');
    }, 2000);
  };

  // --- 2. Step 2: Destination & Payment Logic ---

  useEffect(() => {
    if (destination && walkUpSession) {
      setIsEstimating(true);
      const timer = setTimeout(() => {
        const km = (Math.random() * 5 + 2).toFixed(1);
        const fare = 100 + (km * 120 * seats);
        setMapEstimate(parseFloat(km), fare);
        setIsEstimating(false);
        
        runBalanceCheck(
          paymentMethod || 'WALLET',
          walletBalance,
          null, // No active sub mock
          parseFloat(km),
          seats
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [destination, walkUpSession, seats, paymentMethod]);

  const handleStartTrip = () => {
    if (balanceCheck?.level === 'LOW' || balanceCheck?.level === 'CRITICAL') {
      setShowBalanceSheet(true);
    } else if (balanceCheck?.level === 'BLOCKED') {
      setShowBalanceSheet(true);
    } else {
      proceedToTrip();
    }
  };

  const proceedToTrip = () => {
    // In real app: POST /api/v1/bookings/onspot/walkup
    navigate(`/book/onspot/tracking/bk_walkup_${Date.now()}`);
  };

  // --- 3. Render Helpers ---

  const renderLinkStep = () => (
    <div className="flex-1 px-8 py-10 flex flex-col items-center">
      <header className="w-full text-center space-y-3 mb-12">
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Link to your keke</h1>
        <p className="text-[var(--color-text-secondary)] text-sm max-w-[280px] mx-auto leading-relaxed">
          Scan the QR code inside the cabin or enter the driver's 4-digit code.
        </p>
      </header>

      <div className="w-full space-y-12">
        {/* QR Option */}
        <button 
          onClick={handleQRScan}
          className="w-full aspect-square max-w-[200px] mx-auto bg-white/5 rounded-[48px] border-2 border-dashed border-[#7FFF00]/30 flex flex-col items-center justify-center gap-4 active:scale-95 transition-all group"
        >
          <div className="w-20 h-20 rounded-full bg-[#7FFF00]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera size={36} className="text-[#7FFF00]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-widest">Scan QR Code</p>
            <p className="text-[10px] text-white/40 uppercase font-bold mt-1 tracking-tighter">Inside the keke cabin</p>
          </div>
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">OR ENTER CODE</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Code Input */}
        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            {driverCode.map((val, i) => (
              <input
                key={i}
                ref={codeInputRefs[i]}
                type="number"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !val && i > 0) {
                    codeInputRefs[i - 1].current.focus();
                  }
                }}
                className="w-16 h-20 bg-white/5 border-2 border-white/5 rounded-2xl text-center text-3xl font-display font-black text-[#7FFF00] focus:border-[#7FFF00]/50 focus:bg-white/10 outline-none transition-all shadow-xl"
              />
            ))}
          </div>
          <p className="text-center text-[10px] font-bold text-white/30 uppercase tracking-widest">
            Code expires every 5 minutes
          </p>
        </div>
      </div>

      {/* QR Scanner Modal Simulation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-50 grayscale" />
              <div className="absolute inset-0 bg-black/40" />
              
              <div className="relative w-64 h-64">
                {/* Scan Frame */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-[48px]" />
                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-[#7FFF00] rounded-tl-[16px]" />
                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-[#7FFF00] rounded-tr-[16px]" />
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-[#7FFF00] rounded-bl-[16px]" />
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-[#7FFF00] rounded-br-[16px]" />
                
                <motion.div 
                  animate={{ y: [0, 256, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#7FFF00] to-transparent shadow-[0_0_15px_#7FFF00]"
                />
              </div>

              <button 
                onClick={() => setIsScanning(false)}
                className="absolute top-12 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
              >
                <X size={24} className="text-white" />
              </button>
            </div>
            <div className="bg-[#1A2421] p-12 text-center space-y-3">
              <h2 className="text-xl font-display font-bold text-white">Scanning QR Code</h2>
              <p className="text-white/40 text-sm">Align the code within the frame</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderDestinationStep = () => (
    <div className="flex-1 flex flex-col">
      {/* Driver Confirmed Card */}
      <div className="px-8 pt-8 pb-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 rounded-[40px] p-8 border border-white/10 relative overflow-hidden flex flex-col items-center text-center"
        >
          <div className="absolute top-4 right-6 bg-[#7FFF00]/20 text-[#7FFF00] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Linked</span>
          </div>

          <div className="relative mb-6">
            <img src={walkUpSession.driverPhoto} className="w-24 h-24 rounded-[32px] border-2 border-white/10" alt="" />
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#7FFF00] text-black rounded-full border-4 border-[#1A2421] flex items-center justify-center shadow-lg"
            >
              <CheckCircle2 size={24} />
            </motion.div>
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-2">{walkUpSession.driverName}</h2>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
              {walkUpSession.vehicleColor} · {walkUpSession.vehiclePlate}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[#7FFF00] text-xs font-black tracking-widest uppercase">
              {walkUpSession.vehicleModel}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 bg-black/40 rounded-t-[48px] px-8 py-10 space-y-10 overflow-y-auto pb-32">
        {/* Destination */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Where are you heading?</p>
          <div className="flex items-center gap-4 bg-[#1A2421] border border-white/10 p-5 rounded-[24px] focus-within:border-[#7FFF00]/50 transition-all shadow-inner">
            <Search size={20} className="text-gray-500" />
            <input 
              placeholder="Search destination" 
              value={destination?.address || ''}
              onChange={(e) => setDestination({ address: e.target.value })}
              className="flex-1 bg-transparent border-none outline-none font-bold text-white text-base"
            />
          </div>
        </div>

        {destination && (
          <>
            {/* Map Preview Logic Mock */}
            <div className="h-40 bg-white/5 rounded-[32px] border border-white/10 overflow-hidden relative grayscale opacity-70">
              <div className="absolute inset-0 flex items-center justify-center italic text-white/20 text-xs">Map Route Loaded</div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{mapEstimateKm} km away</span>
                <span className="text-[10px] font-bold text-[#7FFF00] uppercase tracking-widest">Est. 12 mins</span>
              </div>
            </div>

            {/* Seats & Payment */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4 text-left">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Seats</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setSeats(n)}
                      className={`w-10 h-10 rounded-full font-bold transition-all ${seats === n ? 'bg-[#7FFF00] text-black' : 'bg-white/5 text-white/60 text-xs'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4 text-right">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Est. Fare</p>
                <div className="text-2xl font-display font-bold text-[#7FFF00]">
                  {isEstimating ? '...' : `₦${mapEstimateKm ? (100 + mapEstimateKm * 120 * seats).toFixed(0) : '0'}`}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Payment Method</p>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button 
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`px-6 py-4 rounded-2xl flex items-center gap-3 whitespace-nowrap transition-all border ${paymentMethod === 'WALLET' ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-white/60 border-white/10'}`}
                >
                  <Wallet size={18} />
                  <span className="font-bold text-xs uppercase tracking-widest">Wallet · ₦{walletBalance}</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('CASH')}
                  className={`px-6 py-4 rounded-2xl flex items-center gap-3 whitespace-nowrap transition-all border ${paymentMethod === 'CASH' ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-white/60 border-white/10'}`}
                >
                  <CreditCard size={18} />
                  <span className="font-bold text-xs uppercase tracking-widest">Cash</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Start Trip Button */}
      {destination && (
        <div className="absolute bottom-0 inset-x-0 p-8 pt-4 bg-[#1A2421] border-t border-white/5">
          {balanceCheck && balanceCheck.level !== 'SUFFICIENT' && (
            <div className="mb-4 flex items-center justify-between px-5 py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-amber-500" size={16} />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Check Wallet Balance</span>
              </div>
              <button onClick={() => setShowBalanceSheet(true)} className="text-[10px] font-bold text-[#7FFF00] uppercase tracking-widest">Review →</button>
            </div>
          )}

          <button 
            onClick={handleStartTrip}
            disabled={isEstimating}
            className="w-full h-16 bg-[#7FFF00] rounded-[24px] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_12px_32px_rgba(127,255,0,0.3)] active:scale-95 transition-all disabled:opacity-50"
          >
            Start trip
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#1A2421] flex flex-col z-10 overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => {
            if (step === 'DESTINATION') {
              setStep('LINK');
              clearWalkUpSession();
            } else {
              navigate(-1);
            }
          }}
          className="p-3 bg-white/5 backdrop-blur-md text-white rounded-full border border-white/10 active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Linking Loader Overlay */}
      <AnimatePresence>
        {isLinking && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="relative">
              <div className="w-20 h-20 border-t-2 border-[#7FFF00] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ArrowRight size={24} className="text-[#7FFF00] animate-pulse" />
              </div>
            </div>
            <p className="text-white font-display font-medium text-lg mt-8">Verifying Driver Code...</p>
            <p className="text-white/40 text-xs uppercase tracking-widest mt-2 mt-4">Connecting to Keke</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col pt-20">
        {step === 'LINK' ? renderLinkStep() : renderDestinationStep()}
      </div>

      <BalanceWarningSheet 
        isOpen={showBalanceSheet}
        onClose={() => setShowBalanceSheet(false)}
        onContinue={() => {
          setShowBalanceSheet(false);
          proceedToTrip();
        }}
      />
    </div>
  );
}
