import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Monitor, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

export default function ThemeSettings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useStore();

  const themes = [
    { id: 'light', name: 'Light Mode', icon: <Sun size={20} /> },
    { id: 'dark', name: 'Dark Mode', icon: <Moon size={20} /> },
    { id: 'system', name: 'System Default', icon: <Monitor size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Appearance</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center">
        <div className="bg-[var(--color-surface-1)] p-8 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm flex flex-col items-center w-full max-w-sm text-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 shadow-inner ${theme === 'dark'
              ? 'bg-indigo-900 text-indigo-200 shadow-indigo-500/20'
              : 'bg-amber-100 text-amber-500 shadow-amber-500/20'
              }`}
          >
            <AnimatePresence mode="popLayout">
              {theme === 'dark' ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Moon size={64} className="fill-current" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sun size={64} className="fill-current" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <h2 className="text-2xl font-display font-semibold mb-2">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Tap the icon above to switch between light and dark appearance.
          </p>
        </div>
      </main>
    </div>
  );
}
