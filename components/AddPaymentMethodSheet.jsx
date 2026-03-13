import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';

export default function AddPaymentMethodSheet() {
    const { isAddPaymentSheetOpen, setAddPaymentSheetOpen, addPaymentMethod, setToastMessage, paymentMethods } = useStore();

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [holder, setHolder] = useState('');
    const [isDefault, setIsDefault] = useState(paymentMethods.length === 0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const detectNetwork = (num) => {
        const cleanNum = num.replace(/\s+/g, '');
        if (cleanNum.startsWith('4')) return 'Visa';
        if (/^5[1-5]/.test(cleanNum)) return 'Mastercard';
        return null;
    };

    const formatCardNumber = (val) => {
        const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];
        for (let i = 0, len = v.length; i < len; i += 4) {
            parts.push(v.substring(i, i + 4));
        }
        return parts.join(' ');
    };

    const formatExpiry = (val) => {
        const v = val.replace(/\//g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
        return v;
    };

    const validate = () => {
        const newErrors = {};
        const cleanCard = cardNumber.replace(/\s+/g, '');
        if (cleanCard.length !== 16) newErrors.cardNumber = 'Please enter a valid 16-digit card number.';
        if (expiry.length !== 5) newErrors.expiry = 'Please enter a valid expiry date (MM/YY).';
        if (cvv.length !== 3) newErrors.cvv = 'CVV must be 3 digits.';
        if (!holder.trim()) newErrors.holder = 'Please enter the name on your card.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsProcessing(true);
        // Premium delay as requested
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newCard = {
            id: Date.now().toString(),
            type: 'card',
            brand: detectNetwork(cardNumber) || 'Card',
            last4: cardNumber.replace(/\s+/g, '').slice(-4),
            expiry,
            holder: holder.toUpperCase(),
            isDefault
        };

        addPaymentMethod(newCard);
        setIsProcessing(false);
        setAddPaymentSheetOpen(false);
        setToastMessage('Card added successfully');

        // Reset Form
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setHolder('');
        setIsDefault(false);
    };

    const handleClose = () => {
        if (!isProcessing) {
            setAddPaymentSheetOpen(false);
            setErrors({});
        }
    };

    if (!isAddPaymentSheetOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[var(--z-overlay)] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    className="relative w-full max-w-lg bg-[var(--color-surface-1)] rounded-t-[40px] sm:rounded-[40px] border-t sm:border border-white/10 shadow-3xl p-8 overflow-hidden"
                >
                    <div className="w-12 h-1.5 bg-[var(--color-border-subtle)] rounded-full mx-auto mb-8 sm:hidden" />

                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-white to-[var(--color-text-muted)] bg-clip-text text-transparent">Add New Card</h2>
                        <button onClick={handleClose} className="p-2 bg-[var(--color-surface-2)] rounded-full hover:bg-[var(--color-surface-3)] transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Card Preview (Internal Visual) */}
                        <div className="bg-gradient-to-br from-[#1a1c1e] to-black rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden h-48 flex flex-col justify-between group grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--color-primary)]/5 rounded-full blur-[80px]" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 border border-white/10 shadow-inner" />
                                <div className="h-8">
                                    {detectNetwork(cardNumber) === 'Visa' ? (
                                        <span className="text-white font-bold italic text-2xl tracking-tighter">VISA</span>
                                    ) : detectNetwork(cardNumber) === 'Mastercard' ? (
                                        <div className="flex -space-x-2"><div className="w-8 h-8 rounded-full bg-red-500/80" /><div className="w-8 h-8 rounded-full bg-yellow-500/80" /></div>
                                    ) : (
                                        <CreditCard size={32} className="text-white/20" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <p className="text-xl font-display font-bold tracking-[4px] text-white">
                                    {cardNumber || '•••• •••• •••• ••••'}
                                </p>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Card Holder</p>
                                        <p className="text-xs font-bold text-white tracking-widest uppercase truncate max-w-[150px]">{holder || 'NAME ON CARD'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Expiry</p>
                                        <p className="text-xs font-bold text-white tracking-widest uppercase">{expiry || 'MM/YY'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[2px] ml-1">Card Number</label>
                                <div className={`relative bg-[var(--color-surface-2)] rounded-[20px] border transition-all duration-300 ${errors.cardNumber ? 'border-red-500/50' : 'border-white/5 focus-within:border-[var(--color-primary)]/50 focus-within:bg-[var(--color-surface-3)]'}`}>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardNumber}
                                        onChange={(e) => {
                                            const val = formatCardNumber(e.target.value);
                                            if (val.replace(/\s+/g, '').length <= 16) setCardNumber(val);
                                        }}
                                        className="w-full bg-transparent p-5 font-display font-bold tracking-[2px] outline-none text-white placeholder:text-white/10"
                                    />
                                    {detectNetwork(cardNumber) && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-[var(--color-primary)]">
                                            {detectNetwork(cardNumber).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                {errors.cardNumber && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.cardNumber}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[2px] ml-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) => {
                                            const val = formatExpiry(e.target.value);
                                            if (val.replace(/\//g, '').length <= 4) setExpiry(val);
                                        }}
                                        className={`w-full bg-[var(--color-surface-2)] p-5 rounded-[20px] border border-white/5 outline-none font-bold text-center tracking-widest focus:border-[var(--color-primary)]/50 transition-all ${errors.expiry ? 'border-red-500/50' : ''}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[2px] ml-1">CVV</label>
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        maxLength={3}
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                                        className={`w-full bg-[var(--color-surface-2)] p-5 rounded-[20px] border border-white/5 outline-none font-bold text-center tracking-[4px] focus:border-[var(--color-primary)]/50 transition-all ${errors.cvv ? 'border-red-500/50' : ''}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[2px] ml-1">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="NAME AS IT APPEARS ON CARD"
                                    value={holder}
                                    onChange={(e) => setHolder(e.target.value.toUpperCase())}
                                    className={`w-full bg-[var(--color-surface-2)] p-5 rounded-[20px] border border-white/5 outline-none font-bold tracking-widest focus:border-[var(--color-primary)]/50 transition-all uppercase ${errors.holder ? 'border-red-500/50' : ''}`}
                                />
                            </div>

                            <div className="flex items-center justify-between p-5 bg-[var(--color-surface-2)] rounded-[24px] border border-white/5 mt-2">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={20} className={isDefault ? 'text-[var(--color-primary)]' : 'text-white/20'} />
                                    <span className="text-sm font-bold text-white/80">Make default payment method</span>
                                </div>
                                <button
                                    onClick={() => setIsDefault(!isDefault)}
                                    className={`w-12 h-7 rounded-full relative transition-all duration-300 ${isDefault ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        layout
                                        animate={{ x: isDefault ? 24 : 4 }}
                                        className={`absolute top-1 w-5 h-5 rounded-full shadow-lg ${isDefault ? 'bg-black' : 'bg-white/40'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <button
                                onClick={handleSave}
                                disabled={isProcessing}
                                className="w-full h-16 bg-[var(--color-primary)] text-black font-bold text-lg rounded-2xl shadow-[var(--shadow-glow)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span className="tracking-widest uppercase text-sm">Validating Card...</span>
                                    </>
                                ) : (
                                    'Confirm & Save Card'
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold opacity-60">
                                <ShieldCheck size={14} className="text-[var(--color-primary)]" />
                                Secured by Paystack Standard Encryption
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
