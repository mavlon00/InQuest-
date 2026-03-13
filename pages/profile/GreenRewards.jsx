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
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Green Rewards</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#008751] to-[#00663d] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Leaf size={16} />
              <span className="text-sm font-medium uppercase tracking-wider">Green Points</span>
            </div>
            <h2 className="text-4xl font-display font-bold mb-1">2,450 <span className="text-xl font-normal opacity-80">pts</span></h2>
            <p className="text-sm opacity-80 mb-6">≈ ₦2,450.00 value</p>
            
            <div className="flex gap-3">
              <button 
                onClick={handleConvert}
                className="flex-1 bg-white text-[#008751] py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Convert to Cash
              </button>
            </div>
          </div>
        </div>

        {/* Rewards Catalog */}
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">Redeem Rewards</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: '10% Off Next Ride', pts: '500 pts', icon: <Star size={24} className="text-amber-500" /> },
              { title: 'Free Priority Booking', pts: '1000 pts', icon: <Star size={24} className="text-purple-500" /> },
              { title: '₦500 Wallet Credit', pts: '500 pts', icon: <Gift size={24} className="text-blue-500" /> },
              { title: 'Free Trip Insurance', pts: '200 pts', icon: <ShieldCheck size={24} className="text-green-500" /> },
            ].map((reward, i) => (
              <div 
                key={i} 
                onClick={() => handleRedeem(reward.title)}
                className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                  {reward.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{reward.title}</h4>
                  <p className="text-xs font-bold text-[var(--color-primary)]">{reward.pts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Earn */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">How to Earn</h3>
            <button className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Take a Ride', desc: 'Earn 1 point for every ₦100 spent on rides.', pts: '+1 pt/₦100' },
              { title: 'Refer a Friend', desc: 'Get 500 points when they take their first ride.', pts: '+500 pts' },
              { title: 'Use Inquest Wallet', desc: 'Earn double points when paying with your wallet.', pts: '2x pts' },
            ].map((item, i) => (
              <div key={i} className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">{item.desc}</p>
                </div>
                <div className="bg-[var(--color-success)]/10 text-[var(--color-success)] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  {item.pts}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

