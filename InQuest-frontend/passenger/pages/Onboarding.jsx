import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Map, Clock } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Book With Confidence',
    description: 'Every driver is verified before going live. Your safety is our priority.',
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: 'We Watch Your Journey',
    description: 'Real-time tracking and destination alarms keep you secure and on time.',
    icon: Map,
  },
  {
    id: 3,
    title: 'Three Ways to Ride',
    description: 'On-spot, scheduled, or recurring. Travel your way.',
    icon: Clock,
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      navigate('/register');
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col relative overflow-hidden">
      <button 
        onClick={handleSkip}
        className="absolute top-12 right-6 text-[var(--color-text-muted)] font-medium text-sm z-10 hover:text-[var(--color-text-primary)] transition-colors"
      >
        Skip
      </button>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center max-w-sm w-full"
          >
            <div className="w-32 h-32 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mb-12 relative">
              <div className="absolute inset-0 rounded-full border border-[var(--color-primary)] opacity-20 animate-ping" />
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon size={48} className="text-[var(--color-primary)]" />;
              })()}
            </div>
            
            <h2 className="text-3xl font-display font-semibold mb-4 tracking-tight">
              {slides[currentSlide].title}
            </h2>
            <p className="text-[var(--color-text-secondary)] text-base leading-relaxed">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-6 pb-12 pt-8 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)] to-transparent z-10">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-[var(--color-primary)]' : 'w-2 bg-[var(--color-surface-3)]'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] hover:bg-[var(--color-primary)]/90 transition-colors active:scale-[0.98]"
        >
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}

