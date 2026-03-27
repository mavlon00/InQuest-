import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Building2, Smartphone, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';

export default function WalletTopup() {
  const navigate = useNavigate();
  const { paymentMethods, setToastMessage } = useStore();
  const defaultCard = paymentMethods.find(m => m.isDefault);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(defaultCard ? 'card' : 'transfer');
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [1000, 2000, 5000, 10000];

  const handleProceed = () => {
    if (!amount || !method) return;
    setIsProcessing(true);

    let methodName = '';
    if (method === 'card') methodName = defaultCard ? `Card (•••• ${defaultCard.last4})` : 'New Card';
    else if (method === 'transfer') methodName = 'Bank Transfer';
    else methodName = 'USSD';

    setToastMessage(`Initializing ₦${amount} top-up via ${methodName}`);

    setTimeout(() => {
      setIsProcessing(false);
      setToastMessage('Transaction successful! Your balance has been updated.');
      navigate('/wallet');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Top Up Wallet</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <section>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">Amount to Add</label>
          <div className="relative mb-4">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--color-primary)]">₦</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-3xl pl-12 pr-6 py-6 text-3xl font-display font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${amount === preset.toString()
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-text)] shadow-md'
                  : 'bg-[var(--color-surface-1)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]'
                  }`}
              >
                +₦{preset.toLocaleString()}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">Payment Method</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                id: 'card',
                name: defaultCard ? `${defaultCard.brand} •••• ${defaultCard.last4}` : 'Debit / Credit Card',
                sub: defaultCard ? 'Pay with your default card' : 'Pay securely with Paystack',
                icon: <CreditCard size={20} />,
                color: 'blue',
                onClick: () => {
                  if (!defaultCard) setAddPaymentSheetOpen(true);
                  else setMethod('card');
                }
              },
              { id: 'transfer', name: 'Bank Transfer', sub: 'To your virtual account', icon: <Building2 size={20} />, color: 'purple' },
              { id: 'ussd', name: 'USSD Code', sub: 'Dial *737# pattern', icon: <Smartphone size={20} />, color: 'green' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={m.onClick || (() => setMethod(m.id))}
                className={`w-full p-5 rounded-2xl border flex items-center gap-4 transition-all text-left ${method === m.id
                  ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)] shadow-sm'
                  : 'bg-[var(--color-surface-1)] border-[var(--color-border-subtle)] hover:border-[var(--color-primary)]/30'
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${method === m.id ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] shadow-glow' : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]'
                  }`}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[var(--color-text-primary)]">{m.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wider">{m.sub}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${method === m.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-border-subtle)]'
                  }`}>
                  {method === m.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="p-6 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] sticky bottom-0 z-10 shadow-lg">
        <button
          onClick={handleProceed}
          disabled={!amount || !method || isProcessing}
          className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-5 rounded-3xl font-bold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
              Processing...
            </>
          ) : (
            <>Proceed to Payment ₦{amount ? parseFloat(amount).toLocaleString() : '0'}</>
          )}
        </button>
      </footer>
    </div>
  );
}

