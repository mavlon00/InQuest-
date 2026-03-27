import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, Quote, ThumbsUp, Heart } from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';

const TIPS = [500, 1000, 1500];
const FEEDBACK_TAGS = ['Clean Keke', 'Good driving', 'Friendly', 'Great Route', 'Punctual'];

export default function PersonalBookingRating() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  
  const { activeDriver, clearPendingRating, resetBooking } = useBookingStore();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // If driver missing (refresh edge case), mock it for UI flow completeness
  const driver = activeDriver || {
    name: 'Samuel U.',
    photoUrl: 'https://ui-avatars.com/api/?name=Samuel+U&background=random',
    vehiclePlate: 'KJA-123XY',
  };

  const handleTagToggle = (tag) => {
    setTags((prev) => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    
    // Simulate API call: POST /api/v1/ratings
    await new Promise(r => setTimeout(r, 1200));
    
    setSubmitting(false);
    setSuccess(true);
    
    setTimeout(() => {
      clearPendingRating();
      resetBooking();
      navigate('/home', { replace: true });
    }, 2000);
  };

  const handleSkip = () => {
    clearPendingRating();
    resetBooking();
    navigate('/home', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col">
      {/* ── Success Overlay ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[var(--color-primary)] flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0, shadow: 'none' }}
              animate={{ scale: 1, boxShadow: '0 0 100px rgba(0,0,0,0.5)' }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-32 h-32 bg-black rounded-full flex flex-col items-center justify-center mb-6"
            >
              <CheckCircle size={64} className="text-white" strokeWidth={2.5} />
            </motion.div>
            <h2 className="font-display text-3xl font-bold text-black mb-2 text-center">Thanks for your feedback!</h2>
            <p className="font-semibold text-black/70 text-center">Your rating has been submitted successfully.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="pt-16 pb-8 px-6 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Rate your trip</h1>
        <p className="font-semibold text-[var(--color-text-muted)] text-sm">How was your ride with {driver.name}?</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {/* Driver Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-24 h-24 rounded-full p-1 border-2 border-[var(--color-primary)] mb-4">
            <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover rounded-full bg-gray-800" />
          </div>
          <h2 className="text-xl font-bold">{driver.name}</h2>
          <p className="text-xs font-bold text-[var(--color-primary)] tracking-widest uppercase mt-1">
            {driver.vehiclePlate}
          </p>
        </motion.div>

        {/* ── Star Rating ────────────────────────────────────────────────── */}
        <div className="flex justify-center gap-3 mb-10">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Star
                size={40}
                className={`transition-colors duration-200 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                    : 'text-[var(--color-surface-3)] stroke-[1.5]'
                }`}
              />
            </motion.button>
          ))}
        </div>

        {/* ── Feedback Tags (show if rating > 0) ─────────────────────────── */}
        <AnimatePresence>
          {rating > 0 && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="mb-8"
             >
               <p className="text-xs font-bold text-center text-[var(--color-text-muted)] tracking-widest uppercase mb-4">
                 What went well?
               </p>
               <div className="flex flex-wrap justify-center gap-2">
                 {FEEDBACK_TAGS.map(t => (
                   <button
                     key={t}
                     onClick={() => handleTagToggle(t)}
                     className={`px-4 py-2 rounded-[16px] text-sm font-semibold border transition-all ${
                       tags.includes(t) 
                         ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                         : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:border-white/20'
                     }`}
                   >
                     {t}
                   </button>
                 ))}
               </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tip Driver ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 bg-[var(--color-surface-1)] rounded-[32px] border border-[var(--color-border-subtle)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Add a tip for {driver.name}</h3>
            <Heart size={18} className="text-[var(--color-primary)]" />
          </div>
          
          <div className="flex gap-3">
            {TIPS.map(amount => (
              <button
                key={amount}
                onClick={() => setTip(amount === tip ? 0 : amount)}
                className={`flex-1 py-3 rounded-2xl font-display font-semibold border-2 transition-all ${
                  tip === amount 
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)]' 
                    : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)]'
                }`}
              >
                ₦{amount}
              </button>
            ))}
          </div>
          
          <button className="w-full mt-3 py-3 rounded-xl font-semibold text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-surface-3)]">
            Custom Amount
          </button>
        </motion.div>

        {/* ── Written Comment ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute top-4 left-4">
            <Quote size={18} className="text-[var(--color-surface-3)]" />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment (optional)"
            rows={3}
            className="w-full pl-12 pr-4 py-4 bg-[var(--color-surface-1)] rounded-[24px] border border-[var(--color-border-subtle)] font-medium text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-surface-3)] resize-none focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </motion.div>
      </div>

      {/* ── Bottom Actions ───────────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-[var(--color-bg)]/80 backdrop-blur-xl border-t border-[var(--color-border-subtle)] p-6 z-40">
        <button
          disabled={rating === 0 || submitting}
          onClick={handleSubmit}
          className={`w-full py-5 rounded-[24px] font-bold text-lg transition-all flex justify-center items-center ${
            rating === 0 
              ? 'bg-[var(--color-surface-3)] text-white/30 cursor-not-allowed' 
              : 'bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)] active:scale-[0.98]'
          }`}
        >
          {submitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
            />
          ) : (
            'Submit Review'
          )}
        </button>
        
        <button
          onClick={handleSkip}
          disabled={submitting}
          className="w-full py-4 mt-2 font-bold text-sm text-[var(--color-text-muted)]"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
