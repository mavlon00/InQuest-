import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: 48 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-3 bg-[var(--color-primary)] rounded-sm"
        />
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-5xl font-display font-semibold text-[var(--color-text-primary)] tracking-tight"
        >
          INQUEST
        </motion.h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-6 text-[var(--color-text-muted)] font-medium tracking-wide text-sm uppercase"
      >
        Trust. Safety. Accountability.
      </motion.p>
    </div>
  );
}

