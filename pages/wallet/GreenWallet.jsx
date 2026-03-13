import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, ArrowRight, Gift, RefreshCw, ChevronLeft } from 'lucide-react';
import { useStore } from '../../store';

export default function GreenWallet() {
  const navigate = useNavigate();
  const { setToastMessage } = useStore();

  const handleConvert = () => {
    setToastMessage('Points converted to cash successfully');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Green Wallet</h1>
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
              <button
                onClick={() => navigate('/profile/green-rewards')}
                className="flex-1 bg-black/20 text-white py-3 rounded-xl font-semibold text-sm hover:bg-black/30 transition-colors flex items-center justify-center gap-2"
              >
                <Gift size={16} /> Redeem Rewards
              </button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">How to Earn</h3>
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

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Recent Activity</h3>
            <button className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-1">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Ride to Ikeja City Mall', date: 'Today, 2:30 PM', pts: '+45' },
              { title: 'Referral Bonus (Sarah)', date: 'Yesterday, 10:15 AM', pts: '+500' },
              { title: 'Converted to Cash', date: 'Oct 20, 2026', pts: '-1000', negative: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.negative ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'}`}>
                    {item.negative ? <RefreshCw size={16} /> : <Leaf size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{item.date}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${item.negative ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                  {item.pts}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

