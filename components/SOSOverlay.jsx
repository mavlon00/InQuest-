import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, Phone, X, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';

export default function SOSOverlay() {
    const { booking, updateBooking, setToastMessage } = useStore();
    const [showConfirm, setShowConfirm] = useState(false);
    const [showActive, setShowActive] = useState(false);
    const [showSafeConfirm, setShowSafeConfirm] = useState(false);
    const [activeRows, setActiveRows] = useState([]);

    const sosActive = booking.sosActive;

    // Handle global state sync
    useEffect(() => {
        if (sosActive) {
            setShowActive(true);
            setShowConfirm(false);
            // Trigger status rows with delay
            const rowDelays = [600, 1200, 1800];
            const items = [
                'Emergency contact has been notified.',
                'Inquest safety team has been alerted.',
                'Your live location is being shared.'
            ];

            const timers = items.map((item, i) =>
                setTimeout(() => setActiveRows(prev => [...prev, item]), rowDelays[i])
            );

            return () => timers.forEach(t => clearTimeout(t));
        } else {
            setShowActive(false);
            setActiveRows([]);
        }
    }, [sosActive]);

    // Handle local state for initial trigger (called from SOSButton)
    // We'll use a local state to show the initial confirmation sheet if not already in active SOS
    useEffect(() => {
        // If the SOS button is clicked, it sets sosActive to true in the store?
        // Actually, the user wants a confirmation sheet FIRST.
        // So SOSButton should toggle a local "requestSOS" in the store or similar.
        // Let's add a `requestSOS` flag to the store or just watch for a specific trigger.
        // For now, let's assume SOSButton sets a state that we watch.
    }, []);

    const triggerSOS = () => {
        updateBooking({ sosActive: true });
        setShowConfirm(false);
    };

    const cancelInitialTrigger = () => {
        updateBooking({ triggeringSOS: false });
        setShowConfirm(false);
    };

    const handleImSafe = () => {
        setShowSafeConfirm(true);
    };

    const confirmImSafe = () => {
        updateBooking({ sosActive: false, triggeringSOS: false });
        setShowSafeConfirm(false);
        setShowActive(false);
        setToastMessage('SOS alert cancelled. Glad you are safe!');
    };

    // Watch for the trigger from the button
    useEffect(() => {
        if (booking.triggeringSOS && !sosActive) {
            setShowConfirm(true);
        } else {
            setShowConfirm(false);
        }
    }, [booking.triggeringSOS, sosActive]);

    return (
        <>
            {/* STEP 1: CONFIRMATION SHEET */}
            <AnimatePresence>
                {showConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={cancelInitialTrigger}
                            className="fixed inset-0 bg-black/60 z-[var(--z-sos)] backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface-1)] rounded-t-[32px] z-[var(--z-sos)] p-8 border-t border-[var(--color-border-subtle)] pb-10"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <ShieldAlert size={36} className="text-red-500" />
                            </div>
                            <h2 className="text-2xl font-display font-semibold text-center mb-2">Trigger SOS Emergency Alert?</h2>
                            <p className="text-[var(--color-text-secondary)] text-center mb-8 px-4">
                                This will immediately notify your emergency contact and the Inquest safety team.
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={triggerSOS}
                                    className="w-full bg-[var(--color-error)] text-white py-4 rounded-2xl font-bold text-lg shadow-[var(--shadow-lg)] active:scale-[0.98] transition-transform"
                                >
                                    Yes, Send SOS
                                </button>
                                <button
                                    onClick={cancelInitialTrigger}
                                    className="w-full py-4 text-[var(--color-text-secondary)] font-semibold text-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* STEP 2: ACTIVE SOS OVERLAY */}
            <AnimatePresence>
                {showActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[var(--z-sos)] bg-red-600 flex flex-col p-8 overflow-hidden"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center text-white pt-20">
                            <div className="relative w-40 h-40 flex items-center justify-center mb-10">
                                <motion.div
                                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute inset-0 rounded-full border-4 border-white"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                    className="absolute inset-4 rounded-full border-4 border-white"
                                />
                                <ShieldAlert size={80} className="relative z-10" />
                            </div>

                            <h1 className="text-4xl font-display font-semibold mb-3 text-center">SOS Sent</h1>
                            <p className="text-xl font-medium opacity-90 mb-12 text-center">Help is on the way.</p>

                            <div className="w-full max-w-sm space-y-4">
                                {activeRows.map((text, i) => (
                                    <motion.div
                                        key={text}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10"
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 12 }}
                                        >
                                            <CheckCircle size={24} className="text-white shrink-0" />
                                        </motion.div>
                                        <span className="font-semibold text-sm leading-snug">{text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pb-safe mt-10">
                            <button className="w-full bg-white text-red-600 py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-3">
                                <Phone size={24} /> Call Emergency Contact
                            </button>
                            <button
                                onClick={handleImSafe}
                                className="w-full py-4 text-white font-semibold text-lg"
                            >
                                I'm Safe — Cancel Alert
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STEP 3: SAFE CONFIRMATION */}
            <AnimatePresence>
                {showSafeConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-[calc(var(--z-sos)+1)] backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-[var(--color-surface-1)] rounded-[32px] z-[calc(var(--z-sos)+2)] p-8 text-center border border-[var(--color-border-subtle)] shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <ShieldCheck size={36} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-display font-semibold mb-3">Are you sure you are safe?</h2>
                            <p className="text-[var(--color-text-secondary)] mb-8">
                                This will cancel the active SOS alert and notify all teams.
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={confirmImSafe}
                                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold text-base"
                                >
                                    Cancel Alert
                                </button>
                                <button
                                    onClick={() => setShowSafeConfirm(false)}
                                    className="w-full py-4 text-[var(--color-text-secondary)] font-semibold"
                                >
                                    I Still Need Help
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
