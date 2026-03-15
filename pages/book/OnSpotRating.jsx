import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, ThumbsUp, Trash2, CheckCircle2, Heart } from 'lucide-react';
import useOnSpotStore from '../../store/onSpotStore';

const RATING_TAGS = [
  'Clean vehicle',
  'Polite driver',
  'Smooth driving',
  'Good music',
  'Excellent service',
  'Navigated well'
];

export default function OnSpotRating() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { settlementData, resetFlow } = useOnSpotStore();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsFinished(true);
      setTimeout(() => {
        resetFlow();
        navigate('/home');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-[#1A2421] flex flex-col z-10 overflow-hidden">
      <AnimatePresence>
        {!isFinished ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col p-8"
          >
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
              <button 
                onClick={() => { resetFlow(); navigate('/home'); }}
                className="p-3 bg-white/5 rounded-full text-white/40"
              >
                <X size={24} />
              </button>
              <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Rate your experience</h2>
              <div className="w-12 h-12" /> {/* Spacer */}
            </header>

            <div className="flex-1 flex flex-col items-center">
              {/* Driver Image */}
              <div className="relative mb-8">
                <img 
                  src={settlementData?.driverPhoto || 'https://i.pravatar.cc/150?u=michael'} 
                  className="w-24 h-24 rounded-[32px] border-4 border-white/5" 
                  alt="" 
                />
                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <div className="px-4 py-1.5 bg-[#7FFF00] text-black text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest whitespace-nowrap">
                    {settlementData?.driverName || 'Michael Okon'}
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-display font-bold text-white text-center mb-12">
                {rating === 0 ? 'How was your trip?' : 
                 rating === 5 ? 'Excellent!' : 
                 rating >= 4 ? 'Very Good' : 
                 rating >= 3 ? 'Good' : 'Could be better'}
              </h1>

              {/* Stars */}
              <div className="flex gap-4 mb-16">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="relative focus:outline-none transition-transform active:scale-90"
                  >
                    <Star 
                      size={48} 
                      fill={star <= (hoveredRating || rating) ? '#7FFF00' : 'none'} 
                      className={`transition-colors duration-300 ${
                        star <= (hoveredRating || rating) ? 'text-[#7FFF00]' : 'text-white/10'
                      }`}
                    />
                    {star <= (hoveredRating || rating) && (
                      <motion.div 
                        layoutId="star-glow"
                        className="absolute inset-0 bg-[#7FFF00]/20 blur-xl rounded-full" 
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Content based on Rating */}
              {rating > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full space-y-10"
                >
                  <div className="space-y-4">
                    <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-widest">What did you like?</p>
                    <div className="flex flex-wrap justify-center gap-3 px-4">
                      {RATING_TAGS.map(tag => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-6 py-3.5 rounded-2xl text-xs font-bold transition-all border ${
                            selectedTags.includes(tag) 
                            ? 'bg-[#7FFF00] text-black border-[#7FFF00] shadow-[0_8px_16px_rgba(127,255,0,0.2)]' 
                            : 'bg-white/5 text-white/50 border-white/5'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      placeholder="Add a comment (Optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-[32px] p-6 text-sm text-white focus:border-[#7FFF00]/50 outline-none transition-all placeholder:text-white/20 min-h-[120px] resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gradient-to-t from-[#1A2421] to-transparent pt-8 pb-4">
              <button
                disabled={rating === 0 || isSubmitting}
                onClick={handleSubmit}
                className={`w-full h-16 rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  rating === 0 || isSubmitting 
                  ? 'bg-white/5 text-white/20' 
                  : 'bg-[#7FFF00] text-black shadow-[0_12px_32px_rgba(127,255,0,0.3)]'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <span>Submit Feedback</span>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-12"
          >
            <div className="w-32 h-32 bg-[#7FFF00]/10 rounded-full flex items-center justify-center mb-8">
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                className="text-[#7FFF00]"
              >
                <Heart size={64} fill="currentColor" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">Thank You!</h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Your feedback helps us maintain the quality of Inquest Mobility. See you on your next trip!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
