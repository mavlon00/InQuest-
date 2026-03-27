import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check , ChevronLeft} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageSettings() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');

  const languages = [
    { id: 'en', name: 'English (UK)', native: 'English' },
    { id: 'pidgin', name: 'Nigerian Pidgin', native: 'Pidgin' },
    { id: 'hausa', name: 'Hausa', native: 'Hausa' },
    { id: 'igbo', name: 'Igbo', native: 'Igbo' },
    { id: 'yoruba', name: 'Yoruba', native: 'Yorùbá' },
    { id: 'fr', name: 'French', native: 'Français' },
  ];

  const handleSelect = (id) => {
    setLanguage(id);
    // In a real app, this would trigger a language change context update
    setTimeout(() => {
      navigate(-1);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Language</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => handleSelect(lang.id)}
            className={`w-full bg-[var(--color-surface-1)] p-4 rounded-2xl border flex items-center justify-between transition-colors ${
              language === lang.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-2)]'
            }`}
          >
            <div className="text-left">
              <h3 className="font-semibold text-sm mb-1">{lang.name}</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">{lang.native}</p>
            </div>
            {language === lang.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
              >
                <Check size={14} className="text-[var(--color-primary-text)]" />
              </motion.div>
            )}
          </button>
        ))}
      </main>
    </div>
  );
}

