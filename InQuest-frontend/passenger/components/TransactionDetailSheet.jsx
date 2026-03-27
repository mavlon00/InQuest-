import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Copy, ExternalLink, ArrowDownLeft, ArrowUpRight,
    Calendar, Clock, CreditCard, Wallet, Navigation,
    CheckCircle2, AlertCircle, Clock3
} from 'lucide-react';
import { useStore } from '../store';

export default function TransactionDetailSheet({ transaction, isOpen, onClose }) {
    const { setToastMessage } = useStore();

    if (!transaction) return null;

    const isCredit = transaction.type === 'credit' || (transaction.amount && !transaction.amount.toString().startsWith('-') && transaction.type !== 'debit');
    const amountStr = transaction.amount ? transaction.amount.toString().replace('₦', '').replace('-', '') : '0';
    const amount = parseFloat(amountStr);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setToastMessage('Reference copied to clipboard');
    };

    const statusColors = {
        Completed: 'text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/20',
        Success: 'text-[var(--color-success)] bg-[var(--color-success)]/10 border-[var(--color-success)]/20',
        Pending: 'text-[var(--color-warning)] bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20',
        Failed: 'text-[var(--color-error)] bg-[var(--color-error)]/10 border-[var(--color-error)]/20',
        Cancelled: 'text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border-[var(--color-border-subtle)]'
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
            case 'Success': return <CheckCircle2 size={12} />;
            case 'Pending': return <Clock3 size={12} />;
            case 'Failed': return <AlertCircle size={12} />;
            default: return null;
        }
    };

    const getTxIcon = () => {
        if (transaction.pickup) return <Navigation size={24} />;
        return isCredit ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - High z-index, fully opaque background but slightly dimmed overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[var(--z-overlay)] bg-black/60 shadow-2xl"
                        style={{ backdropFilter: 'none' }} // Explicitly disable blur here to avoid bleeding
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[var(--z-overlay)] bg-[var(--color-surface-1)] rounded-t-[2.5rem] p-8 pb-safe shadow-2xl overflow-hidden"
                        style={{ filter: 'none', opacity: 1 }} // Force zero blur and full opacity
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-[var(--color-surface-3)] rounded-full mx-auto -mt-4 mb-8" />

                        {/* Header: Icon and Amount */}
                        <div className="flex items-start justify-between mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isCredit ? 'bg-[var(--color-success)]/10 border-[var(--color-success)]/20 text-[var(--color-success)]' :
                                    'bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-primary)]'
                                }`}>
                                {getTxIcon()}
                            </div>
                            <div className="text-right">
                                <p className={`text-2xl font-display font-bold ${isCredit ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                                    {isCredit ? '+' : '-'}₦{amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                </p>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mt-2 border ${statusColors[transaction.status] || statusColors.Completed}`}>
                                    {getStatusIcon(transaction.status || 'Completed')}
                                    {transaction.status || 'Completed'}
                                </div>
                            </div>
                        </div>

                        {/* Content Rows */}
                        <div className="space-y-5">
                            {/* Reference Row */}
                            <div className="flex justify-between items-center group">
                                <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">Reference</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-[var(--color-text-secondary)]">{transaction.id}</span>
                                    <button
                                        onClick={() => handleCopy(transaction.id)}
                                        className="p-1.5 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors text-[var(--color-primary)] active:scale-90"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Date Row */}
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">Date & Time</p>
                                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                    {transaction.date?.replace(' • ', ' · ') || 'Saturday 7 March 2026 · 4:32 PM'}
                                </p>
                            </div>

                            {/* Type Row */}
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">Type</p>
                                <div className="px-2.5 py-1 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">
                                    {transaction.pickup ? 'Ride' : transaction.title || 'Transaction'}
                                </div>
                            </div>

                            {/* Description Row */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">Description</p>
                                <p className="text-sm font-medium leading-relaxed text-[var(--color-text-secondary)]">
                                    {transaction.pickup
                                        ? `Trip from ${transaction.pickup} to ${transaction.dropoff}`
                                        : (transaction.title || 'In-app transaction')
                                    }
                                </p>
                            </div>

                            {/* Conditional Rows (Other Party / Payment Method) */}
                            {(transaction.method || transaction.pickup) && (
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">
                                        {transaction.pickup ? 'Booking Type' : 'Source'}
                                    </p>
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                        {transaction.pickup ? 'Personal Ride' : transaction.method}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Divider and Report Link */}
                        <div className="mt-10 pt-6 border-t border-dashed border-[var(--color-border-subtle)] text-center">
                            <button className="text-[var(--color-error)] text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center gap-2 mx-auto">
                                <ExternalLink size={14} />
                                Report an Issue
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-4 bg-[var(--color-surface-2)] text-[var(--color-text-primary)] rounded-2xl font-bold text-sm hover:bg-[var(--color-surface-3)] transition-colors active:scale-[0.98]"
                        >
                            Back to Activity
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
