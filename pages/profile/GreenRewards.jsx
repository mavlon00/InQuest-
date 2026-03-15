import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, Gift, RefreshCw, Star, ArrowRight, ShieldCheck , ChevronLeft} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

export default function GreenRewards() {
  const navigate = useNavigate();
  const { setToastMessage } = useStore();

  const handleRedeem = (title) => {
    setToastMessage(`Successfully redeemed: ${title}`);
  };

  const handleConvert = () => {
    setToastMessage('Points converted to cash successfully');
  };

  return (
    <div className="min-h-screen bg-[#071F18] flex flex-col pb-24 text-white overflow-hidden relative">
      {/* RADIANT GREEN GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-[#00FF88]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] aspect-square bg-[#008751]/10 rounded-full blur-[100px] animate-pulse" />

      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-lg bg-[#071F18]/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-display font-bold">Green Rewards</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Star size={18} className="text-[#00FF88]" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-10 relative z-10">
        {/* HOLOGRAPHIC BALANCE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-56 rounded-[40px] p-8 overflow-hidden shadow-2xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88] via-[#008751] to-[#004D31] z-0" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-1" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Available to Redeem</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-display font-bold text-white tracking-tighter">2,450</h2>
                <span className="text-lg font-medium text-white/50">pts</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleConvert}
                className="flex-1 h-14 bg-white text-[#008751] rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider"
              >
                <RefreshCw size={18} /> Instant Cashout
              </button>
            </div>
          </div>
        </motion.div>

        {/* REWARDS CATALOG */}
        <section className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Premium Catalog</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: '10% Off Ride', pts: '500 pts', icon: <Star size={24} />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { title: 'Priority Trip', pts: '1000 pts', icon: <Gift size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { title: '₦500 Credit', pts: '500 pts', icon: <RefreshCw size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { title: 'Eco Insurance', pts: '200 pts', icon: <ShieldCheck size={24} />, color: 'text-[#00FF88]', bg: 'bg-[#00FF88]/10' },
            ].map((reward, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleRedeem(reward.title)}
                className="bg-white/[0.03] backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex flex-col items-center text-center gap-4 hover:bg-white/[0.07] transition-all cursor-pointer active:scale-95 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${reward.bg} flex items-center justify-center border border-white/5 transition-transform group-hover:scale-110`}>
                  <div className={reward.color}>{reward.icon}</div>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white/90 mb-1">{reward.title}</h4>
                  <div className="inline-block px-2 py-0.5 rounded-md bg-[#00FF88]/10 text-[10px] font-black text-[#00FF88] uppercase tracking-wider">
                    {reward.pts}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* MISSIONS SECTION */}
        <section className="space-y-6 pb-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Boost Your Points</h3>
            <button className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest">See All</button>
          </div>
          
          <div className="bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-[32px] p-6 flex items-center gap-5">
             <div className="w-14 h-14 bg-[#00FF88]/10 rounded-2xl flex items-center justify-center text-[#00FF88] border border-[#00FF88]/20">
                <Leaf size={28} />
             </div>
             <div>
                <h4 className="font-bold text-sm text-white">Daily Eco Streak</h4>
                <p className="text-[10px] text-white/40 font-medium">Take 3 rides today to earn 150 bonus points.</p>
                <div className="mt-2 w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-[#00FF88] w-2/3 shadow-[0_0_10px_#00FF88]" />
                </div>
             </div>
             <ArrowRight size={20} className="ml-auto text-white/20" />
          </div>
        </section>
      </main>
    </div>
  );
}

