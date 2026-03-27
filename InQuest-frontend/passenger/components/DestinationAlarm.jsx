import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Bell, MapPin, ChevronRight, Check } from 'lucide-react';

export default function DestinationAlarm({ isOpen, onClose, onSetAlarm }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [radius, setRadius] = useState(500);
    const [selectedDest, setSelectedDest] = useState(null);

    const handleSetAlarm = () => {
        if (selectedDest) {
            onSetAlarm({ destination: selectedDest, radius });
            onClose();
        }
    };

    const recentDestinations = [
        { id: 1, name: 'Ikeja City Mall', address: 'Obafemi Awolowo Way, Ikeja' },
        { id: 2, name: 'Maryland Mall', address: 'Ikorodu Road, Maryland' },
        { id: 3, name: 'Oshodi Bus Terminal', address: 'Oshodi, Lagos' }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-bg)] flex flex-col"
                >
                    {/* Header */}
                    <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-xl font-display font-semibold">Destination Alarm</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--color-surface-2)] rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </header>

                    <main className="flex-1 overflow-y-auto px-6 py-8 space-y-10 focus:outline-none">
                        {/* Step 1: Destination Selection */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                    1. Choose Destination
                                </label>
                                {selectedDest && (
                                    <span className="text-[var(--color-success)] flex items-center gap-1 text-xs font-bold">
                                        <Check size={14} /> Selected
                                    </span>
                                )}
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search destination..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-[var(--color-primary)] transition-all"
                                />
                            </div>

                            {!selectedDest ? (
                                <div className="space-y-3">
                                    {recentDestinations.map((dest) => (
                                        <button
                                            key={dest.id}
                                            onClick={() => setSelectedDest(dest.name)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] transition-all text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 text-[var(--color-text-secondary)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] transition-colors">
                                                <MapPin size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">{dest.name}</h4>
                                                <p className="text-xs text-[var(--color-text-muted)] truncate">{dest.address}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)] flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                                            <MapPin size={20} />
                                        </div>
                                        <h4 className="font-bold text-[var(--color-text-primary)]">{selectedDest}</h4>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDest(null)}
                                        className="text-xs font-bold text-[var(--color-primary)] hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Step 2: Radius Selection */}
                        <section className={!selectedDest ? 'opacity-40 pointer-events-none' : ''}>
                            <div className="flex items-center justify-between mb-6">
                                <label className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                                    2. Alarm Radius
                                </label>
                                <div className="bg-[var(--color-surface-2)] px-3 py-1 rounded-full border border-[var(--color-border-subtle)]">
                                    <span className="text-[var(--color-primary)] font-bold text-sm">{radius}m</span>
                                </div>
                            </div>

                            <div className="px-2">
                                <input
                                    type="range"
                                    min="500"
                                    max="2000"
                                    step="100"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    className="w-full h-2 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                />
                                <div className="flex justify-between mt-3 text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-tighter">
                                    <span>500m (Near)</span>
                                    <span>1.2km</span>
                                    <span>2km (Far)</span>
                                </div>
                            </div>

                            <div className="mt-8 p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] flex items-start gap-3">
                                <Bell size={16} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                    We'll sound a loud alarm when you enter the <span className="text-[var(--color-text-primary)] font-bold">{radius}m</span> radius of {selectedDest || 'your destination'}. Don't miss your stop!
                                </p>
                            </div>
                        </section>
                    </main>

                    {/* Footer CTA */}
                    <footer className="p-6 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] shadow-inner">
                        <button
                            onClick={handleSetAlarm}
                            disabled={!selectedDest}
                            className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-bold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:brightness-95 transition-all"
                        >
                            Start Alarm
                        </button>
                    </footer>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
