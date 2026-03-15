import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, Bell, QrCode, TrendingUp, User, 
  MapPin, CheckCircle2, ChevronRight, X, 
  ShieldCheck, Zap, Info, DollarSign
} from 'lucide-react';

export default function DriverHome() {
  const [showQR, setShowQR] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  
  // Mock incoming request after 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveRequest({
        id: 'REQ-567',
        passengerName: 'Oluwaseun A.',
        pickup: '14 Admiralty Way, Lekki',
        destination: 'Victoria Island',
        distance: 4.2,
        fare: 604,
        isSubscriber: true,
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#1A2421] text-white flex flex-col">
      {/* HEADER */}
      <header className="p-6 flex justify-between items-center">
        <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <Menu size={20} />
        </button>
        <div className="flex flex-col items-center">
           <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Earnings Today</div>
           <div className="text-xl font-bold font-display text-[var(--color-primary)]">₦12,450.00</div>
        </div>
        <button className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
          <Bell size={20} />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1A2421]" />
        </button>
      </header>

      {/* ONLINE STATUS */}
      <div className="px-6 mb-8">
         <div className="bg-[#1D2A26] border border-[#7FFF00]/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
               <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">Online & Accepting Trips</span>
            </div>
            <button className="text-white/40 text-xs font-bold uppercase hover:text-white transition-colors">Go Offline</button>
         </div>
      </div>

      <div className="flex-1 px-6 space-y-8">
         {/* QR CODE ACTION */}
         <section>
            <button 
              onClick={() => setShowQR(true)}
              className="w-full bg-[var(--color-surface-1)] border border-white/5 rounded-[32px] p-6 flex items-center gap-5 active:scale-[0.98] transition-all shadow-xl"
            >
               <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)]">
                  <QrCode size={32} />
               </div>
               <div className="text-left">
                  <h3 className="font-bold text-lg mb-1">My QR Code</h3>
                  <p className="text-white/40 text-xs leading-relaxed">Let subscribers scan this to start a Tap & Ride trip instantly.</p>
               </div>
            </button>
         </section>

         {/* EARNINGS SUMMARY */}
         <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <h3 className="text-white font-bold">Performance</h3>
               <button className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest">Details</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-[var(--color-surface-1)] p-5 rounded-3xl border border-white/5">
                  <div className="text-white/30 text-[10px] font-black uppercase mb-1">Trips Today</div>
                  <div className="text-2xl font-bold font-display">12</div>
               </div>
               <div className="bg-[var(--color-surface-1)] p-5 rounded-3xl border border-white/5">
                  <div className="text-white/30 text-[10px] font-black uppercase mb-1">Success Rate</div>
                  <div className="text-2xl font-bold font-display">96%</div>
               </div>
            </div>
         </section>

         {/* SETTLEMENT NOTICE */}
         <section className="bg-white/5 border border-white/10 p-5 rounded-[28px]">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-[#22C55E]/10 rounded-full flex items-center justify-center text-[#22C55E]">
                  <ShieldCheck size={18} />
               </div>
               <span className="text-xs font-bold">Subscription Settlement Pool</span>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed italic mb-4">
               Trips taken by subscribers are settled 1:1 at standard rates from the Inquest Settlement Pool. You always earn the full fare.
            </p>
            <div className="flex justify-between items-center text-sm font-bold">
               <span className="text-white/60">Subscription Earnings Today</span>
               <span className="text-[var(--color-primary)]">+ ₦4,520</span>
            </div>
         </section>
      </div>

      {/* INCOMING REQUEST MODAL */}
      <AnimatePresence>
         {activeRequest && (
            <motion.div 
               initial={{ y: '100%' }}
               animate={{ y: 0 }}
               exit={{ y: '100%' }}
               className="fixed inset-x-0 bottom-0 z-[100] bg-[var(--color-surface-1)] rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-white/10 p-8 pb-12"
            >
               <div className="flex justify-between items-start mb-8">
                  <div>
                     <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-white font-display text-4xl font-bold">₦{activeRequest.fare.toLocaleString()}</h2>
                        {activeRequest.isSubscriber && (
                           <div className="bg-[var(--color-primary)] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Zap size={10} fill="black" /> Subscriber
                           </div>
                        )}
                     </div>
                     <p className="text-white/40 text-sm font-medium">New Trip Request • {activeRequest.distance}km</p>
                  </div>
                  <div className="text-right">
                     <span className="block text-white font-bold">{activeRequest.passengerName}</span>
                     <span className="text-xs text-amber-400 font-bold">4.9 ★</span>
                  </div>
               </div>

               <div className="space-y-6 mb-10">
                  <div className="flex gap-4">
                     <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] mt-1 flex-shrink-0 border-4 border-[#1A2421]" />
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Pickup</div>
                        <div className="text-white font-medium">{activeRequest.pickup}</div>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-5 h-5 rounded-full bg-red-500 mt-1 flex-shrink-0 border-4 border-[#1A2421]" />
                     <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Destination</div>
                        <div className="text-white font-medium">{activeRequest.destination}</div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveRequest(null)}
                    className="w-20 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 border border-white/5 active:bg-white/10"
                  >
                     <X size={24} />
                  </button>
                  <button 
                    onClick={() => setActiveRequest(null)}
                    className="flex-1 h-16 bg-[var(--color-primary)] text-black font-bold text-xl rounded-2xl shadow-[var(--shadow-glow)] active:scale-[0.98] transition-all"
                  >
                     Accept Trip
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* QR MODAL */}
      <AnimatePresence>
         {showQR && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-[200] bg-[#1A2421] flex flex-col items-center justify-center p-8"
            >
               <button 
                  onClick={() => setShowQR(false)}
                  className="absolute top-12 left-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"
               >
                  <X size={24} />
               </button>

               <div className="text-center mb-12">
                  <h2 className="text-white font-display text-3xl font-bold mb-2">Driver QR Code</h2>
                  <p className="text-white/40 text-sm max-w-[200px] mx-auto leading-relaxed italic">Subscribers scan this to start an instant linked session.</p>
               </div>

               <div className="bg-white p-8 rounded-[48px] shadow-2xl relative mb-12">
                  <div className="w-64 h-64 bg-white flex items-center justify-center">
                     <QrCode size={240} className="text-black" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-lg border-4 border-[#1A2421]">
                     <Zap size={24} className="text-black" fill="black" />
                  </div>
               </div>

               <div className="space-y-4 text-center">
                  <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">OR ENTRY CODE</div>
                  <div className="flex gap-3 justify-center">
                     {['1', '2', '3', '4'].map((d, i) => (
                        <div key={i} className="w-16 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-display text-4xl font-bold text-[var(--color-primary)]">
                           {d}
                        </div>
                     ))}
                  </div>
               </div>

               <div className="mt-auto pb-10 flex items-center gap-3 text-white/30 text-xs text-center px-10">
                  <Info size={16} className="flex-shrink-0" />
                  <p>Keep this code active while the subscriber scans. Do not navigate away.</p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
