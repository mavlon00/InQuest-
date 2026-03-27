import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useEffect } from 'react';

export default function Toast() {
  const { toastMessage, setToastMessage } = useStore();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[var(--z-toast)] pointer-events-none"
        >
          <div className="bg-[var(--color-surface-1)] text-[var(--color-text-primary)] px-4 py-3 rounded-full shadow-lg border border-[var(--color-border-subtle)] font-medium text-sm whitespace-nowrap">
            {toastMessage}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

