import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Leaf, Plus, ArrowLeft, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Wallet() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-xl font-display font-semibold">Wallet</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Balance Card */}
        <div className="bg-[var(--color-primary)] rounded-3xl p-6 text-[var(--color-primary-text)] shadow-[var(--shadow-glow)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90 mb-1">Available Balance</p>
            <h2 className="text-4xl font-display font-bold mb-6">₦12,450<span className="text-xl font-normal opacity-80">.00</span></h2>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/wallet/topup')}
                className="flex-1 bg-white text-[var(--color-primary)] py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownLeft size={16} /> Top Up
              </button>
              <button
                onClick={() => navigate('/wallet/transfer')}
                className="flex-1 bg-black/20 text-white py-3 rounded-xl font-semibold text-sm hover:bg-black/30 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpRight size={16} /> Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          <button onClick={() => navigate('/wallet/topup')} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors">
              <Plus size={20} />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-secondary)] text-center leading-tight">Add<br />Funds</span>
          </button>
          <button onClick={() => navigate('/wallet/transfer')} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors">
              <ArrowUpRight size={20} />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-secondary)] text-center leading-tight">Transfer</span>
          </button>
          <button onClick={() => navigate('/profile/green-rewards')} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors">
              <Gift size={20} />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-secondary)] text-center leading-tight">Redeem<br />Points</span>
          </button>
          <button onClick={() => navigate('/wallet/green')} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 flex items-center justify-center text-[var(--color-success)] hover:bg-[var(--color-success)]/20 transition-colors">
              <Leaf size={20} />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-secondary)] text-center leading-tight">Green<br />Wallet</span>
          </button>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Recent Transactions</h3>
            <button onClick={() => navigate('/wallet/history')} className="text-[var(--color-primary)] text-sm font-medium">
              See All
            </button>
          </div>
          <div className="space-y-4">
            {[
              { id: '1', type: 'credit', title: 'Wallet Top-up', amount: '₦5,000.00', date: 'Today, 10:30 AM' },
              { id: '2', type: 'debit', title: 'Ride to Ikeja City Mall', amount: '₦1,250.00', date: 'Yesterday, 4:15 PM' },
              { id: '3', type: 'debit', title: 'Transfer to John Doe', amount: '₦2,000.00', date: 'Oct 22, 2026' },
            ].map((tx) => (
              <div key={tx.id} className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                    }`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{tx.title}</h4>
                    <p className="text-xs text-[var(--color-text-secondary)]">{tx.date}</p>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${tx.type === 'credit' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
                  }`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

