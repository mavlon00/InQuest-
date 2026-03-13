import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Copy, CheckCircle, CreditCard , ChevronLeft} from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
          <h1 className="text-lg font-display font-semibold">Virtual Card</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Card Visual */}
        <div className="relative w-full aspect-[1.586/1] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-[var(--color-primary)] rounded-sm" />
              <span className="font-display font-bold text-xl tracking-tight">INQUEST</span>
            </div>
            <CreditCard size={32} className="opacity-80" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-2xl tracking-widest">
                {showDetails ? cardDetails.number : '•••• •••• •••• ' + cardDetails.number.slice(-4)}
              </p>
              <button onClick={() => setShowDetails(!showDetails)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                {showDetails ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Cardholder Name</p>
                <p className="font-medium tracking-widest">{cardDetails.name}</p>
              </div>
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Valid Thru</p>
                  <p className="font-mono">{showDetails ? cardDetails.expiry : '••/••'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">CVV</p>
                  <p className="font-mono">{showDetails ? cardDetails.cvv : '•••'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => handleCopy(cardDetails.number.replace(/\s/g, ''))}
            className="w-full bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Copy size={20} className="text-[var(--color-text-secondary)]" />
              <span className="font-medium text-sm">Copy Card Number</span>
            </div>
            {copied && <CheckCircle size={16} className="text-[var(--color-success)]" />}
          </button>

          <button
            onClick={() => navigate('/profile/card/physical')}
            className="w-full bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-[var(--color-text-secondary)]" />
              <span className="font-medium text-sm">Request Physical Card</span>
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="bg-[var(--color-surface-2)] p-4 rounded-2xl text-sm text-[var(--color-text-secondary)]">
          Your Inquest Virtual Card is linked directly to your wallet balance. Use it for online payments anywhere Mastercard is accepted.
        </div>
      </main>
    </div>
  );
}

