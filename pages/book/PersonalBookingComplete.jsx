import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Leaf, Download, Star, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { useStore } from '../../store';
import useSubscriptionStore from '../../store/subscriptionStore';

export default function PersonalBookingComplete() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  
  const {
    pickup, destination, activeDriver, fareEstimate, insurance,
    waitingFeeAmount, paymentMethod, promoDiscount,
    setPendingRating, resetBooking,
  } = useBookingStore();

  const [confetti, setConfetti] = useState(true);

  // Fallback data if page refreshed
  const baseFare = fareEstimate?.baseFare || 1200;
  const deadMileage = fareEstimate?.deadMileageFee || 250;
  const stopFees = fareEstimate?.stopFees || 0;
  const insuranceFee = insurance ? 100 : 0;
  const waitFee = waitingFeeAmount ? Math.floor(waitingFeeAmount) : 0;
  const discount = promoDiscount || 0;
  
  const isSubActive = paymentMethod === 'SUBSCRIPTION';
  const subCoverageKm = isSubActive ? (fareEstimate?.distanceKm || 0) : 0;
  const subscriptionCoveredValue = subCoverageKm * 120;
  
  const totalFare = baseFare + deadMileage + stopFees + insuranceFee + waitFee - discount;
  const finalWalletPaid = isSubActive ? (totalFare - subscriptionCoveredValue) : totalFare;

  const pointsEarned = Math.floor(totalFare * 0.05); // 5% back in points

  useEffect(() => {
    // Stop confetti after 2 seconds
    const timer = setTimeout(() => setConfetti(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRateDriver = () => {
    navigate(`/book/personal/rate/${bookingId}`);
  };

  const handleGoHome = () => {
    // Instead of resting here, we queue it so the rating prompt 
    // catches it on the home screen next time if they skip
    setPendingRating(bookingId);
    resetBooking();
    navigate('/home', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col overflow-y-auto">
      {/* ── Confetti effect ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {confetti && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: '100vh',
                  x: `${Math.random() * 100}vw`,
                  opacity: 1,
                  scale: Math.random() * 1.5 + 0.5,
                  rotate: Math.random() * 360,
                }}
                animate={{
                  y: '-10vh',
                  opacity: 0,
                  rotate: Math.random() * 720,
                  x: `${Math.random() * 100}vw`,
                }}
                transition={{ duration: Math.random() * 2 + 1, ease: 'easeOut' }}
                className="absolute w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#7FFF00', '#EF4444', '#F59E0B', '#3B82F6', '#FFFFFF'][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col p-6 pb-32 max-w-md mx-auto w-full pt-16">
        {/* Celebration Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1, damping: 15 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(127,255,0,0.15)', border: '2px solid var(--color-primary)' }}
          >
            <Check size={40} className="text-[var(--color-primary)]" strokeWidth={3} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl font-bold mb-2"
          >
            Trip Complete
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[var(--color-text-muted)] font-semibold"
          >
            You have arrived at your destination
          </motion.p>
        </div>

        {/* Action Callouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          {/* Cash Payment Highlight */}
          {paymentMethod === 'CASH' && (
            <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_30px_rgba(255,255,255,0.1)] text-center border-4 border-[var(--color-warning)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--color-warning)]/10 rounded-bl-full" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Please pay driver</p>
              <h2 className="text-4xl font-display font-black text-black">
                ₦{totalFare.toLocaleString()}
              </h2>
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-bold">
                💵 Pay with Exact Cash
              </div>
            </div>
          )}

          {/* Wallet Payment Highlight */}
          {paymentMethod === 'WALLET' && (
             <div className="bg-[var(--color-surface-2)] p-5 rounded-[24px] border border-[var(--color-success)]/30 text-center flex flex-col items-center">
                <Check size={24} className="text-[var(--color-success)] mb-2" />
                <p className="text-sm font-semibold mb-1">Paid automatically from Wallet</p>
                <p className="font-display text-xl font-bold text-[var(--color-success)]">₦{finalWalletPaid.toLocaleString()}</p>
             </div>
          )}

          {/* Subscription Payment Highlight */}
          {paymentMethod === 'SUBSCRIPTION' && (
             <div className="bg-[var(--color-surface-2)] p-5 rounded-[24px] border border-[var(--color-primary)]/30 text-center flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--color-primary)]/5 rounded-bl-[32px] flex items-center justify-center">
                   <Zap size={16} className="text-[var(--color-primary)] ml-2 mb-2" />
                </div>
                <Check size={24} className="text-[var(--color-primary)] mb-2" />
                <p className="text-sm font-semibold mb-1">Subscription: KM Decoupled</p>
                <div className="flex items-baseline gap-2">
                   <p className="font-display text-xl font-bold text-[var(--color-primary)]">-{subCoverageKm.toFixed(1)} km</p>
                   {finalWalletPaid > 0 && (
                      <p className="text-xs text-white/40">+ ₦{finalWalletPaid.toLocaleString()}</p>
                   )}
                </div>
             </div>
          )}

          {/* Green Points Earned */}
          <button onClick={() => navigate('/profile/green-rewards')} className="w-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 p-4 rounded-[24px] flex items-center gap-4 active:scale-[0.98] transition-all">
            <div className="w-12 h-12 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center flex-shrink-0">
              <Leaf size={24} className="text-[var(--color-success)]" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-[var(--color-success)] text-sm mb-0.5">+{pointsEarned} Green Points</p>
              <p className="text-xs text-[var(--color-success)]/70 font-semibold">Earned for taking a sustainable ride</p>
            </div>
            <ExternalLink size={16} className="text-[var(--color-success)] opacity-50" />
          </button>
        </motion.div>

        {/* Detailed Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--color-surface-1)] rounded-[32px] p-6 border border-[var(--color-border-subtle)] space-y-5 shadow-xl"
        >
          {/* Route */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{pickup?.address || 'Pickup Point'}</p>
            </div>
            <div className="w-px h-4 bg-[var(--color-surface-3)] ml-1" />
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--color-error)]" />
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{destination?.address || 'Destination Point'}</p>
            </div>
          </div>

          <div className="border-t border-[var(--color-border-subtle)] pt-5 pb-1 space-y-3">
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-widest uppercase mb-1">Fare Breakdown</p>
            
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Base fare</span>
              <span className="font-semibold">₦{baseFare.toLocaleString()}</span>
            </div>
            {deadMileage > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Dead mileage</span>
                <span className="font-semibold">₦{deadMileage.toLocaleString()}</span>
              </div>
            )}
            {stopFees > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Stop fees</span>
                <span className="font-semibold">₦{stopFees.toLocaleString()}</span>
              </div>
            )}
            {waitFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-warning)]">Waiting fee (grace exceeded)</span>
                <span className="font-semibold text-[var(--color-warning)]">₦{waitFee.toLocaleString()}</span>
              </div>
            )}
            {insurance && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-success)]">Trip Insurance</span>
                <span className="font-semibold text-[var(--color-success)]">₦100</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-success)]">Promo Discount</span>
                <span className="font-semibold text-[var(--color-success)]">-₦{discount.toLocaleString()}</span>
              </div>
            )}
            {isSubActive && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-primary)] font-semibold">Subscription Coverage</span>
                <span className="font-semibold text-[var(--color-primary)]">-{subCoverageKm.toFixed(1)} km</span>
              </div>
            )}
            
            <div className="pt-3 flex justify-between items-baseline border-t border-[var(--color-border-subtle)] mt-2">
              <span className="font-semibold">{isSubActive ? 'Wallet Settlement' : 'Total Paid'}</span>
              <span className="text-2xl font-display font-semibold" style={{ color: paymentMethod === 'CASH' ? 'var(--color-text-primary)' : 'var(--color-primary)' }}>
                ₦{finalWalletPaid.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Download Receipt */}
          <button className="w-full py-3 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border-subtle)] flex items-center justify-center gap-2 text-sm font-semibold active:bg-[var(--color-surface-3)] transition-colors mt-2">
            <Download size={16} /> Get PDF Receipt
          </button>
        </motion.div>
      </div>

      {/* Fixed Sticky Footer Actions */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.6, type: 'spring' }}
        className="fixed bottom-0 inset-x-0 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] px-6 py-6 pb-10 space-y-4"
        style={{ zIndex: 40 }}
      >
        <button
          onClick={handleRateDriver}
          className="w-full py-5 rounded-[24px] font-bold text-lg bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)] active:scale-[0.98] transition-transform"
        >
          Rate your driver →
        </button>
        <button
          onClick={handleGoHome}
          className="w-full text-center py-2 font-semibold text-[var(--color-text-muted)] text-sm active:text-white"
        >
          Done — Go home
        </button>
      </motion.div>
    </div>
  );
}
