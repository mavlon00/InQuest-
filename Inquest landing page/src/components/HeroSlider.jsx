import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative h-[600px] lg:h-[700px] rounded-[2rem] overflow-hidden bg-surface-1 shadow-2xl">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <img 
                src={slides[current].image} 
                alt={slides[current].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 flex items-center">
                <div className="w-full px-8 md:px-16 lg:px-24">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-2xl"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white uppercase tracking-wider mb-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      {slides[current].badge}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6 text-white">
                      {slides[current].title} <br/>
                      {slides[current].titleHighlight && (
                        <span className="text-primary">{slides[current].titleHighlight}</span>
                      )}
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-lg">
                      {slides[current].desc}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {slides[current].primaryCta && (
                        <Link to={slides[current].primaryCta.link} className="bg-primary hover:bg-primary-dim text-on-primary px-8 py-4 rounded-full font-bold transition-all shadow-[0_4px_14px_rgba(127,255,0,0.2)] hover:shadow-[0_6px_20px_rgba(127,255,0,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                          {slides[current].primaryCta.label} <ArrowRight className="w-5 h-5" />
                        </Link>
                      )}
                      {slides[current].secondaryCta && (
                        <Link to={slides[current].secondaryCta.link} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2">
                          {slides[current].secondaryCta.label}
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-8 right-8 flex items-center gap-4 z-20">
            <div className="flex gap-2 mr-4 hidden sm:flex">
              {slides.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-8' : 'bg-white/50 hover:bg-white'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
