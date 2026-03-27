import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Copy, CheckCircle, CreditCard, ChevronLeft, ShieldCheck, ChevronRight, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyCard() {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardDetails = {
    number: '5399 8210 4567 8901',
    expiry: '12/28',
    cvv: '123',
    name: 'JOHN DOE',
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col pb-24 text-white overflow-hidden relative">
      {/* STELLAR GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-[#4F46E5]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] aspect-square bg-[#7C3AED]/5 rounded-full blur-[100px] animate-pulse" />

      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-lg bg-[#0A0A0F]/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-display font-bold">Virtual Card</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full shadow-lg">
           <div className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Active</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-12 relative z-10">
        {/* PREMIUM 3D HOLOGRAPHIC CARD */}
        <div className="perspective-[1000px]">
          <motion.div 
            whileHover={{ rotateY: 15, rotateX: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-full aspect-[1.586/1] rounded-[40px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] p-10 flex flex-col justify-between group cursor-pointer"
          >
            {/* Card Material */}
            <div className="absolute inset-0 bg-[#12121A] z-0" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 z-1" />
            
            {/* Animated Holographic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--color-primary)]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-2" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-black text-2xl tracking-tighter text-white">INQUEST</span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--color-primary)]">Platinum</span>
              </div>
              <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                <CreditCard size={28} className="text-white/80" />
              </div>
            </div>

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xl sm:text-2xl tracking-[0.25em] text-white/90 drop-shadow-lg">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={showDetails}
                      initial={{ opacity: 0, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(5px)' }}
                    >
                      {showDetails ? cardDetails.number : '•••• •••• •••• ' + cardDetails.number.slice(-4)}
                    </motion.span>
                  </AnimatePresence>
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
                  className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all active:scale-90"
                >
                  {showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Card Participant</p>
                  <p className="font-bold text-sm tracking-widest text-white/80 uppercase">{cardDetails.name}</p>
                </div>
                <div className="flex gap-8 text-right">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Expiry</p>
                    <p className="font-mono font-bold text-sm text-white/80">{showDetails ? cardDetails.expiry : '••/••'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">CVV</p>
                    <p className="font-mono font-bold text-sm text-[var(--color-primary)]">{showDetails ? cardDetails.cvv : '•••'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Microchips & Security Icons */}
            <div className="absolute bottom-10 right-48 opacity-20 transform -rotate-12 pointer-events-none">
               <ShieldCheck size={120} />
            </div>
          </motion.div>
        </div>

        {/* CORE ACTIONS */}
        <section className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleCopy(cardDetails.number.replace(/\s/g, ''))}
            className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-4 hover:bg-white/[0.08] transition-all group active:scale-95"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-[var(--color-primary)] transition-colors">
              {copied ? <CheckCircle size={24} className="text-[#00FF88]" /> : <Copy size={24} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Copy Details</span>
          </button>

          <button
            onClick={() => navigate('/profile/card/physical')}
            className="bg-white/5 border border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-4 hover:bg-white/[0.08] transition-all group active:scale-95 text-center"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-[var(--color-primary)] transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Request Plastic</span>
          </button>
        </section>

        {/* SECURITY INFO */}
        <div className="bg-gradient-to-br from-[#12121A] to-[#0A0A0F] p-8 rounded-[40px] border border-white/5 space-y-4">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                 <ShieldCheck size={16} />
              </div>
              <h3 className="text-sm font-bold text-white/90 tracking-tight">Security Protocol</h3>
           </div>
           <p className="text-xs text-white/40 leading-relaxed font-medium">
             Your virtual card is linked to your wallet balance with real-time fraud monitoring. Use it anywhere Mastercard is accepted globally.
           </p>
           <button className="text-[var(--color-primary)] text-[10px] font-black uppercase tracking-widest pt-2 flex items-center gap-2">
             Freeze Card Session <ChevronRight size={14} />
           </button>
        </div>
      </main>
    </div>
  );
}

