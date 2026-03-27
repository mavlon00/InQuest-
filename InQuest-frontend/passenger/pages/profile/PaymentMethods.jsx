import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Plus, Trash2,
  ChevronLeft, MoreVertical, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

export default function PaymentMethods() {
  const navigate = useNavigate();
  const {
    paymentMethods,
    removePaymentMethod,
    setDefaultPaymentMethod,
    setToastMessage,
    setAddPaymentSheetOpen
  } = useStore();

  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDelete = (id) => {
    removePaymentMethod(id);
    setDeleteConfirmId(null);
    setToastMessage('Card removed');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe relative">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-display font-semibold">Payment Methods</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-[2px] mb-2 font-display">Saved Cards</h2>
          <AnimatePresence>
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[var(--color-surface-1)] p-5 rounded-[32px] border relative transition-all duration-300 ${method.isDefault ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/20 shadow-xl shadow-[var(--color-primary)]/5' : 'border-[var(--color-border-subtle)]'
                  }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 border border-[var(--color-border-subtle)] font-display text-[10px] font-bold italic tracking-tighter">
                    {method.brand === 'Visa' ? (
                      <span className="text-blue-500">VISA</span>
                    ) : method.brand === 'Mastercard' ? (
                      <div className="flex -space-x-1.5"><div className="w-3.5 h-3.5 rounded-full bg-red-500/80" /><div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80" /></div>
                    ) : (
                      <CreditCard size={18} className="text-[var(--color-text-secondary)]" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault && (
                      <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] font-bold px-2.5 py-1 rounded-full border border-[var(--color-primary)]/20 uppercase tracking-wider">Default</span>
                    )}
                    <button
                      onClick={() => setActiveMenu(activeMenu === method.id ? null : method.id)}
                      className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-bold text-xl tracking-[4px] font-display text-white italic">•••• •••• •••• {method.last4}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold mb-0.5">Expires</p>
                      <p className="text-sm font-bold font-display">{method.expiry}</p>
                    </div>
                    <p className="text-[10px] font-bold text-[var(--color-text-secondary)] tracking-[2px] uppercase">{method.holder}</p>
                  </div>
                </div>

                {/* 3-Dot Menu */}
                <AnimatePresence>
                  {activeMenu === method.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute top-12 right-6 z-30 bg-[var(--color-surface-2)] rounded-2xl border border-white/5 shadow-2xl py-2 min-w-[160px] overflow-hidden"
                    >
                      {!method.isDefault && (
                        <button
                          onClick={() => { setDefaultPaymentMethod(method.id); setActiveMenu(null); }}
                          className="w-full px-5 py-3 text-left text-sm font-bold hover:bg-[var(--color-surface-3)] transition-colors text-white"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => { setDeleteConfirmId(method.id); setActiveMenu(null); }}
                        className="w-full px-5 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        Delete Card
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          {paymentMethods.length === 0 && (
            <div className="text-center py-16 flex flex-col items-center gap-5 bg-[var(--color-surface-1)] rounded-[40px] border-2 border-dashed border-[var(--color-border)] opacity-60">
              <div className="w-20 h-20 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-muted)] border border-white/5 shadow-inner">
                <CreditCard size={32} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg text-[var(--color-text-primary)] font-display tracking-tight">No saved cards</p>
                <p className="text-[var(--color-text-muted)] text-sm px-12 leading-relaxed">Add a payment method to enjoy seamless booking and one-tap top-ups.</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setAddPaymentSheetOpen(true)}
          className="w-full bg-[var(--color-surface-2)] p-8 rounded-[40px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)] transition-all duration-500 active:scale-[0.98] group shadow-inner"
        >
          <div className="w-14 h-14 rounded-full bg-[var(--color-surface-1)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-black transition-all duration-500 shadow-lg border border-white/5">
            <Plus size={28} />
          </div>
          <span className="font-bold text-xs uppercase tracking-[3px] font-display italic">Add New Card</span>
        </button>

        <div className="flex items-center gap-4 p-6 bg-black/40 rounded-[32px] border border-white/5 mt-8 backdrop-blur-md">
          <ShieldCheck size={28} className="text-[var(--color-primary)] shrink-0" />
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed font-medium uppercase tracking-wider">
            All card information is securely handled by <span className="text-[var(--color-text-primary)] font-bold italic">paystack</span>. Inquest does not store your full card details.
          </p>
        </div>
      </main>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirmId(null)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[var(--color-surface-1)] rounded-[40px] p-10 text-center border border-white/10 shadow-3xl"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-red-500/20 rotate-12">
                <Trash2 size={40} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-4">Delete Card?</h2>
              <p className="text-[var(--color-text-secondary)] mb-10 text-sm leading-relaxed px-2 font-medium">This action cannot be undone. You will need to re-add the card details manually later.</p>
              <div className="space-y-4">
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="w-full bg-red-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                  Yes, Delete Card
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full py-4 text-[var(--color-text-muted)] font-bold text-sm tracking-widest uppercase hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

