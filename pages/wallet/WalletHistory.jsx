import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, ArrowDownLeft, ArrowUpRight, ArrowRight, ChevronLeft, X, CheckCircle2, Copy, ExternalLink, Calendar, Clock, Tag, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import TransactionDetailSheet from '../../components/TransactionDetailSheet';

export default function WalletHistory() {
  const navigate = useNavigate();
  const { setToastMessage } = useStore();
  const [filter, setFilter] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);

  const transactions = [
    { id: 'TX-928104', type: 'credit', title: 'Wallet Top-up', amount: '5000.00', date: 'Oct 24, 2026', time: '10:30 AM', status: 'Success', method: 'Debit Card', vendor: 'Paystack' },
    { id: 'TX-928105', type: 'debit', title: 'Ride to Ikeja City Mall', amount: '1250.00', date: 'Oct 23, 2026', time: '4:15 PM', status: 'Success', method: 'Wallet Balance', category: 'Transport' },
    { id: 'TX-928106', type: 'debit', title: 'Transfer to John Doe', amount: '2000.00', date: 'Oct 22, 2026', time: '9:00 AM', status: 'Success', method: 'Wallet Balance', category: 'Transfer' },
    { id: 'TX-928107', type: 'credit', title: 'Refund (Dispute #892)', amount: '450.00', date: 'Oct 20, 2026', time: '2:30 PM', status: 'Success', method: 'System Refund', category: 'Adjustment' },
    { id: 'TX-928108', type: 'debit', title: 'Ride to Airport', amount: '3500.00', date: 'Oct 18, 2026', time: '12:45 PM', status: 'Success', method: 'Wallet Balance', category: 'Transport' },
  ];

  const filteredTransactions = filter === 'All'
    ? transactions
    : transactions.filter(t => t.type === filter.toLowerCase());

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setToastMessage('Transaction ID copied!');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-display font-semibold">Transaction History</h1>
        </div>
        <button className="p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
          <Filter size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Credit', 'Debit'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filter === f
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-text)] shadow-sm'
                : 'bg-[var(--color-surface-1)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredTransactions.map((tx) => (
            <motion.div
              layoutId={tx.id}
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="group bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${tx.type === 'credit' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
                  }`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5 text-[var(--color-text-primary)]">{tx.title}</h3>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold mt-0.5">{tx.date}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className={`font-display font-bold text-sm mb-0.5 ${tx.type === 'credit' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-primary)]'
                    }`}>
                    {tx.type === 'credit' ? '+' : '-'}₦{parseFloat(tx.amount).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <div className={`w-1 h-1 rounded-full ${tx.status === 'Success' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
                    <p className="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-tight">{tx.status}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-20 bg-[var(--color-surface-1)] rounded-3xl border border-dashed border-[var(--color-border-subtle)]">
            <div className="w-20 h-20 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--color-text-muted)]">
              <Filter size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-[var(--color-text-primary)] font-semibold mb-1">No transactions found</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Try selecting a different filter.</p>
          </div>
        )}
      </main>

      <TransactionDetailSheet
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
