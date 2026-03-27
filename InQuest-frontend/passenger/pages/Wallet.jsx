import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, ArrowDownLeft, Leaf, Plus, 
  ChevronLeft, SlidersHorizontal, Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Wallet() {
  const navigate = useNavigate();
  const { walletBalance, transactions, fetchWalletData } = useStore();

  useEffect(() => {
    fetchWalletData();
  }, []);

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-[#0F1715] flex flex-col pb-24 text-white overflow-hidden relative">
      {/* BACKGROUND BLOBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-[var(--color-primary)]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] aspect-square bg-[#22C55E]/5 rounded-full blur-[100px]" />

      <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-lg bg-[#0F1715]/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-display font-bold">Wallet</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <SlidersHorizontal size={18} className="text-white/60" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-10 relative z-10">
        {/* PREMIUM BALANCE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-64 rounded-[40px] p-8 overflow-hidden shadow-2xl border border-white/20 group"
        >
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl z-0" />
          
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Total Assets</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-white/40 text-lg font-medium">₦</span>
                  <h2 className="text-5xl font-display font-bold tracking-tight">
                    {formatCurrency(walletBalance).split('.')[0]}
                    <span className="text-2xl text-white/30 font-normal">.{formatCurrency(walletBalance).split('.')[1] || '00'}</span>
                  </h2>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                <Leaf size={24} className="text-[var(--color-primary)] shadow-[0_0_15px_rgba(127,255,0,0.4)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/wallet/topup')}
                className="h-16 bg-[var(--color-primary)] text-black rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[var(--shadow-glow)] active:scale-95 transition-all text-sm uppercase tracking-wider"
              >
                <Plus size={18} strokeWidth={3} /> Add Funds
              </button>
              <button
                onClick={() => navigate('/wallet/transfer')}
                className="h-16 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
              >
                <ArrowUpRight size={18} /> Send
              </button>
            </div>
          </div>
        </motion.div>

        {/* QUICK ACTIONS GRID */}
        <section className="grid grid-cols-4 gap-4">
          {[
            { label: 'Bills', icon: <Plus size={22} />, color: 'bg-white/5', path: '/wallet/topup' },
            { label: 'Receive', icon: <ArrowDownLeft size={22} />, color: 'bg-white/5', path: '/wallet/receive' },
            { label: 'Gifts', icon: <Gift size={22} />, color: 'bg-white/5', path: '/profile/green-rewards' },
            { label: 'Eco', icon: <Leaf size={22} />, color: 'bg-[#008751]/20 text-[#008751] border border-[#008751]/30', path: '/wallet/green' },
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-3 transition-transform active:scale-90"
            >
              <div className={`w-14 h-14 rounded-3xl ${action.color || 'bg-white/5'} flex items-center justify-center shadow-lg border border-white/5`}>
                {action.icon}
              </div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </section>

        {/* RECENT TRANSACTIONS */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Activity Analysis</h3>
            <button onClick={() => navigate('/wallet/history')} className="text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest">
              View History
            </button>
          </div>

          <div className="space-y-3 pb-10">
            {transactions.length > 0 ? (
              transactions.map((tx, i) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/[0.02] backdrop-blur-sm p-5 rounded-[28px] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                      tx.type === 'credit' 
                        ? 'bg-[#008751]/10 border-[#008751]/20 text-[#008751] group-hover:bg-[#008751]/20' 
                        : 'bg-white/5 border-white/10 text-white/60 group-hover:border-white/20'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white/90 mb-0.5">{tx.title}</h4>
                      <p className="text-[10px] text-white/30 font-medium">{tx.desc || tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-display font-bold text-sm ${tx.type === 'credit' ? 'text-[#008751]' : 'text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-10 text-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.01]">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No Transactions Found</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

