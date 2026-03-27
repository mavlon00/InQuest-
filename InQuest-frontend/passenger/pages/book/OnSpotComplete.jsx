import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, MapPin, Navigation, 
  CreditCard, Wallet, ArrowRight, Star,
  AlertTriangle, Receipt, Info, ChevronRight,
  ShieldCheck, Share2
} from 'lucide-react';
import useOnSpotStore from '../../store/onSpotStore';

export default function OnSpotComplete() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { 
    activeBooking, settlementData, setSettlementData, 
    clearActiveBooking, resetFlow 
  } = useOnSpotStore();

  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Simulation: Generating Settlement ---
  useEffect(() => {
    // In a real app: GET /api/v1/bookings/:id/settlement
    const timer = setTimeout(() => {
      const mockSettlement = {
        bookingId: bookingId,
        actualKm: 4.8,
        actualFare: 676,
        waitingFee: 0,
        totalPayable: 676,
        paymentMethod: activeBooking?.paymentMethod || 'WALLET',
        chargedAmount: 500, // Partial charge mock
        debtCreated: 176,
        debtDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fareBreakdown: [
          { label: 'Base Fare', value: 100 },
          { label: 'Distance (4.8km)', value: 576 },
          { label: 'Waiting Time (0m)', value: 0 },
        ],
        pickup: activeBooking?.pickup?.address || 'Pickup Point',
        destination: activeBooking?.destination?.address || 'Destination Point',
        driverName: activeBooking?.driverName || 'Michael Okon',
        driverPhoto: activeBooking?.driverPhoto || 'https://i.pravatar.cc/150?u=michael',
      };
      setSettlementData(mockSettlement);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [bookingId]);

  if (isLoading || !settlementData) {
    return (
      <div className="fixed inset-0 bg-[#1A2421] flex flex-col items-center justify-center">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-16 h-16 border-t-2 border-[#7FFF00] rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Receipt className="text-[#7FFF00]/40" size={20} />
          </div>
        </div>
        <p className="text-white/60 font-jakarta uppercase tracking-widest text-xs mt-8">Generating Receipt...</p>
      </div>
    );
  }

  const handleFinish = () => {
    clearActiveBooking();
    navigate(`/book/onspot/rating/${bookingId}`);
  };

  return (
    <div className="min-h-screen bg-[#1A2421] flex flex-col pt-12">
      {/* Success Header */}
      <div className="flex flex-col items-center text-center px-8 mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-[#7FFF00] text-black rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(127,255,0,0.3)] mb-6"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Trip Completed</h1>
        <p className="text-white/40 text-sm mt-2 uppercase tracking-[0.2em] font-bold">You have arrived safely</p>
      </div>

      <div className="flex-1 bg-black/40 rounded-t-[48px] p-8 space-y-8 overflow-y-auto pb-32">
        {/* Settlement Summary Card */}
        <div className="bg-[#1A2421] rounded-[40px] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Ring */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#7FFF00]/5 rounded-full blur-3xl" />
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-jakarta">Total Fare</p>
              <h2 className="text-5xl font-display font-black text-[#7FFF00]">₦{settlementData.totalPayable}</h2>
            </div>
            <div className="px-5 py-3 bg-[#7FFF00]/10 rounded-2xl border border-[#7FFF00]/20 flex flex-col items-end">
              <span className="text-[10px] font-bold text-[#7FFF00] uppercase tracking-widest">{settlementData.paymentMethod}</span>
              <span className="text-white font-bold text-sm tracking-tighter">Settled</span>
            </div>
          </div>

          <div className="space-y-4">
            {settlementData.fareBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-white/40 font-medium">{item.label}</span>
                <span className="text-white font-bold font-jakarta">₦{item.value}</span>
              </div>
            ))}
            
            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-lg">
              <span className="text-white/60 font-display font-bold">Amount Charged</span>
              <span className="text-white font-display font-black">₦{settlementData.chargedAmount}</span>
            </div>
          </div>
        </div>

        {/* Debt Warning Logic */}
        {settlementData.debtCreated > 0 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-amber-500/10 rounded-[32px] border border-amber-500/20 p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-amber-500" size={28} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Travel Balance Created</p>
              <p className="text-sm font-bold text-white mb-1">₦{settlementData.debtCreated} added to debt</p>
              <p className="text-[10px] text-white/50 leading-relaxed font-jakarta">
                Your wallet didn't cover the full fare. Please clear this by {new Date(settlementData.debtDueDate).toLocaleDateString()}.
              </p>
            </div>
          </motion.div>
        )}

        {/* Trip Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <MapPin size={20} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Destination</p>
              <p className="text-sm font-medium text-white truncate">{settlementData.destination}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/5">
            <div className="flex items-center gap-4">
              <img src={settlementData.driverPhoto} className="w-12 h-12 rounded-xl" alt="" />
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Driver</p>
                <p className="text-sm font-bold text-white">{settlementData.driverName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#7FFF00]/10 rounded-full border border-[#7FFF00]/20">
              <Star size={12} fill="#7FFF00" className="text-[#7FFF00]" />
              <span className="text-[10px] font-bold text-[#7FFF00]">4.9</span>
            </div>
          </div>
        </div>

        {/* Verification Tick */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 rounded-full border border-green-500/20">
            <ShieldCheck size={16} className="text-green-500" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em]">Verified by Inquest IoT</span>
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="fixed bottom-0 inset-x-0 p-8 bg-gradient-to-t from-[#1A2421] to-transparent">
        <button 
          onClick={handleFinish}
          className="w-full h-16 bg-[#7FFF00] rounded-[24px] text-black font-bold text-lg flex items-center justify-center gap-3 shadow-[0_12px_32px_rgba(127,255,0,0.3)] active:scale-95 transition-all"
        >
          Rate Driver <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
