import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, MapPin, Clock, Navigation, Wallet, Star } from 'lucide-react';
import { useStore } from '../../store';

export default function TripComplete() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { booking, completeTrip } = useStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (val) => {
    setRating(val);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleGoHome = () => {
    // Save trip if rating was submitted, otherwise null
    completeTrip(submitted ? rating : null, submitted ? comment : null);

    // Explicitly clear any remaining active trip data from localStorage
    localStorage.removeItem('active_trip');
    localStorage.removeItem('active_booking');

    // Use React Router navigate to home with replace: true for clean history
    navigate('/home', { replace: true });
  };

  if (!booking.driver) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-bg)]/80 flex flex-col justify-end overflow-hidden">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-[var(--color-surface-1)] rounded-t-3xl border-t border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] pb-safe h-[85vh] flex flex-col"
      >
        <div className="w-12 h-1.5 bg-[var(--color-border)] rounded-full mx-auto mt-3 mb-5 shrink-0" />

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="rating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center shrink-0">
                    <CheckCircle size={24} className="text-[var(--color-success)]" />
                  </div>
                  <h1 className="text-2xl font-display font-semibold">Trip Complete</h1>
                </div>

                <div className="flex items-center gap-3 mb-6 bg-[var(--color-surface-2)] p-4 rounded-2xl border border-[var(--color-border-subtle)]">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
                    <div className="w-0.5 h-4 bg-[var(--color-border)]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Allen Roundabout</p>
                    <p className="text-sm font-medium">{booking.destinationName || 'Destination'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[var(--color-surface-2)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center gap-3">
                    <Clock size={20} className="text-[var(--color-text-secondary)]" />
                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Duration</p>
                      <p className="font-semibold text-sm">14 min</p>
                    </div>
                  </div>
                  <div className="bg-[var(--color-surface-2)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center gap-3">
                    <Navigation size={20} className="text-[var(--color-text-secondary)]" />
                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-0.5">Distance</p>
                      <p className="font-semibold text-sm">3.2 km</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--color-surface-2)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden mb-6">
                  <div className="p-4 space-y-3 border-b border-dashed border-[var(--color-border)]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Base Fare</span>
                      <span className="font-medium">₦450</span>
                    </div>
                    {booking.type !== 'ON_SPOT' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--color-text-secondary)]">Dead Mileage Fee</span>
                        <span className="font-medium">₦100</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">Trip Insurance</span>
                      <span className="font-medium">₦100</span>
                    </div>
                  </div>
                  <div className="p-4 flex justify-between items-center bg-[var(--color-surface-1)] border-l-4 border-[var(--color-primary)]">
                    <span className="font-semibold">Total</span>
                    <span className="font-display font-semibold text-xl text-[var(--color-primary)]">₦{booking.type === 'ON_SPOT' ? '550' : '650'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-8 bg-[var(--color-surface-2)] p-4 rounded-2xl border border-[var(--color-border-subtle)]">
                  <Wallet size={20} className="text-[var(--color-primary)]" />
                  <span className="font-medium text-sm">Paid from Wallet</span>
                </div>

                <div className="border-t border-[var(--color-border-subtle)] pt-6 mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                      {booking.driver.photo ? (
                        <img src={booking.driver.photo} alt="Driver" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[var(--color-text-muted)]">{booking.driver.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{booking.driver.name}</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">Thank you for riding with us</p>
                    </div>
                  </div>

                  <h4 className="text-center font-semibold mb-4">How was {booking.driver.name.split(' ')[0]}?</h4>
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className="p-2 transition-transform active:scale-90"
                      >
                        <Star
                          size={32}
                          className={`transition-colors ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--color-border)]'}`}
                        />
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {rating > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Tell us more about your trip (optional)"
                          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-2xl p-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow resize-none min-h-[100px]"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-auto space-y-3">
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
                  >
                    Submit Rating
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="w-full bg-transparent text-[var(--color-text-secondary)] py-4 rounded-2xl font-semibold text-base hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mb-6">
                  <CheckCircle size={48} className="text-[var(--color-success)]" />
                </div>
                <h2 className="text-2xl font-display font-semibold mb-2">Thank you</h2>
                <p className="text-[var(--color-text-secondary)] text-lg mb-12">Your feedback helps keep Inquest safe.</p>
                <button
                  onClick={handleGoHome}
                  className="w-full max-w-xs bg-[var(--color-surface-2)] text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-3)] transition-colors active:scale-[0.98]"
                >
                  Go Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

