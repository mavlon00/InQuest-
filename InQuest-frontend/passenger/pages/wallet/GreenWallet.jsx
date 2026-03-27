import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, ArrowRight, Gift, RefreshCw, ChevronLeft, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

export default function GreenWallet() {
  const navigate = useNavigate();
  const { setToastMessage } = useStore();

  const handleConvert = () => {
    setToastMessage('Points converted to cash successfully');
  };

  return (
    <div className="min-h-screen bg-[#071F18] flex flex-col pb-24 text-white overflow-hidden relative">
      {/* RADIANT GREEN GLOWS */}
      <div className="absolute top-[-20%] right-[-10%] w-[80%] aspect-square bg-[#00FF88]/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-[10%] left-[-20%] w-[70%] aspect-square bg-[#008751]/10 rounded-full blur-[120px] animate-pulse" />

      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-lg bg-[#071F18]/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-display font-bold">Green Wallet</h1>
        </div>
        <div className="px-3 py-1 bg-[#00FF88]/10 border border-[#00FF88]/20 rounded-full">
           <span className="text-[10px] font-black text-[#00FF88] uppercase tracking-widest">Eco Verified</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-10 relative z-10">
        {/* HOLOGRAPHIC EMERALD CARD */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-72 rounded-[48px] p-10 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,135,81,0.3)] group"
        >
          {/* Holographic Gradient Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88] via-[#008751] to-[#004D31] z-0" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-1" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-white/10 to-transparent z-2" />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                  <Leaf size={18} className="text-[#00FF88]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Eco Credits Available</span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <h2 className="text-6xl font-display font-bold text-white tracking-tighter">2,450</h2>
                <span className="text-xl font-medium text-white/60">pts</span>
              </div>
              <p className="text-sm font-medium text-[#00FF88] mt-1 drop-shadow-md">≈ ₦2,450.00 Fixed Value</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 h-14 bg-white text-[#008751] rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                <RefreshCw size={16} /> Convert to Wallet
              </button>
              <button
                onClick={() => navigate('/profile/green-rewards')}
                className="w-14 h-14 bg-black/20 backdrop-blur-md border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-black/30 transition-all active:scale-95"
              >
                <Gift size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* IMPACT TRACKER */}
        <section className="bg-white/[0.03] border border-white/5 rounded-[32px] p-6 space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-white/30">Env. Impact Score</h3>
              <div className="flex items-center gap-1 text-[#00FF88] font-bold text-xs">
                 <TrendingUp size={14} /> +12% this month
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                 <div className="text-3xl font-display font-bold text-white">42.5<span className="text-sm text-white/30 ml-1">kg</span></div>
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">CO2 Offset</p>
              </div>
              <div className="space-y-1">
                 <div className="text-3xl font-display font-bold text-white">128<span className="text-sm text-white/30 ml-1">km</span></div>
                 <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Electric Miles</p>
              </div>
           </div>

           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-gradient-to-r from-[#008751] to-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.3)]"
              />
           </div>
           <p className="text-[10px] text-white/20 italic text-center">You're in the top 5% of eco-friendly commuters in Lagos.</p>
        </section>

        {/* EARNING MISSIONS */}
        <section className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-white/30">Earning Programs</h3>
          <div className="space-y-3">
            {[
              { title: 'Standard Commute', desc: '1 pt for every ₦100 spent on routine trips', pts: '1 pts/₦100', icon: <Leaf size={16} /> },
              { title: 'Eco Referral', desc: 'Invite friends to the green movement', pts: '500 pts', icon: <Gift size={16} /> },
              { title: 'Wallet Bonus', desc: '2x points on all wallet transactions', pts: '2x boost', icon: <RefreshCw size={16} />, featured: true },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`p-5 rounded-[28px] border flex items-center justify-between gap-4 transition-all ${
                  item.featured ? 'bg-[#00FF88]/5 border-[#00FF88]/20 shadow-lg' : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.featured ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-white/5 text-white/40'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${item.featured ? 'text-white' : 'text-white/80'} mb-0.5`}>{item.title}</h4>
                    <p className="text-[10px] text-white/30 font-medium leading-tight">{item.desc}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  item.featured ? 'bg-[#00FF88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]' : 'bg-white/5 text-white/40'
                }`}>
                  {item.pts}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

