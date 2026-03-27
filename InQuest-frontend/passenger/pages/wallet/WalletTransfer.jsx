import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Search, CheckCircle , ChevronLeft} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletTransfer() {
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('DETAILS');

  const handleNext = () => {
    if (!recipient || !amount) return;
    setStep('CONFIRM');
  };

  const handleConfirm = () => {
    // In a real app, this would navigate to the PIN screen or verify PIN here
    navigate('/wallet/pin', { state: { amount, recipient, type: 'transfer' } });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Transfer Funds</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {step === 'DETAILS' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Recipient Phone or Inquest ID</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. 08012345678"
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-lg font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-[var(--color-text-secondary)]">₦</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl pl-10 pr-4 py-4 text-2xl font-semibold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">Available Balance: ₦12,450.00</p>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleNext}
                  disabled={!recipient || !amount}
                  className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 'CONFIRM' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-[var(--color-surface-1)] rounded-3xl p-6 border border-[var(--color-border-subtle)] shadow-sm text-center">
                <div className="w-16 h-16 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
                  <User size={32} className="text-[var(--color-text-secondary)]" />
                </div>
                <h2 className="text-xl font-semibold mb-1">John Doe</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">{recipient}</p>

                <div className="py-6 border-y border-dashed border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Amount to Transfer</p>
                  <p className="text-4xl font-display font-semibold text-[var(--color-primary)]">₦{amount}</p>
                </div>

                <div className="pt-6 flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Fee</span>
                  <span className="font-medium">Free</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleConfirm}
                  className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
                >
                  Confirm Transfer
                </button>
                <button
                  onClick={() => setStep('DETAILS')}
                  className="w-full bg-transparent text-[var(--color-text-secondary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-2)] transition-colors active:scale-[0.98]"
                >
                  Edit Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

