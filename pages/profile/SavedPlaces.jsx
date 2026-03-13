import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Briefcase, Plus, MapPin, MoreVertical, Search, X, GraduationCap, ShoppingBag, Heart, Star, Activity, Coffee, Hotel, Users, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

export default function SavedPlaces() {
  const navigate = useNavigate();
  const { savedPlaces, addSavedPlace, removeSavedPlace, setToastMessage, theme } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [location, setLocation] = useState([6.5244, 3.3792]);
  const [placeName, setPlaceName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState('Resolving address...');

  const emojis = [
    { id: 'home', icon: <Home size={24} /> },
    { id: 'work', icon: <Briefcase size={24} /> },
    { id: 'school', icon: <GraduationCap size={24} /> },
    { id: 'market', icon: <ShoppingBag size={24} /> },
    { id: 'church', icon: <Heart size={24} /> },
    { id: 'hospital', icon: <Activity size={24} /> },
    { id: 'gym', icon: <Activity size={24} /> },
    { id: 'restaurant', icon: <Coffee size={24} /> },
    { id: 'hotel', icon: <Hotel size={24} /> },
    { id: 'family', icon: <Users size={24} /> },
    { id: 'heart', icon: <Heart size={24} /> },
    { id: 'star', icon: <Star size={24} /> },
  ];

  useEffect(() => {
    if (isAdding) {
      // Simulate reverse geocoding
      const timer = setTimeout(() => {
        setResolvedAddress('123 Simulated Address, Lagos');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location, isAdding]);

  const getIcon = (type) => {
    const found = emojis.find(e => e.id === type);
    if (found) {
      return React.cloneElement(found.icon, { size: 20, className: "text-[var(--color-primary)]" });
    }
    return <MapPin size={20} className="text-[var(--color-primary)]" />;
  };

  const handleSave = () => {
    if (!placeName) return;

    addSavedPlace({
      id: Date.now().toString(),
      type: selectedEmoji,
      label: placeName,
      address: resolvedAddress,
      lat: location[0],
      lng: location[1]
    });

    setIsAdding(false);
    setPlaceName('');
    setToastMessage('Place saved');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe relative">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-display font-semibold">Saved Places</h1>
        </div>
        <button onClick={() => setIsAdding(true)} className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {savedPlaces.map((place) => (
          <div key={place.id} className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                {getIcon(place.type)}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{place.label}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{place.address}</p>
              </div>
            </div>
            <button onClick={() => removeSavedPlace(place.id)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        ))}

        <button onClick={() => setIsAdding(true)} className="w-full bg-[var(--color-surface-1)] p-4 rounded-2xl border border-dashed border-[var(--color-border)] flex items-center justify-center gap-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors">
          <Plus size={20} />
          <span className="font-medium text-sm">Add New Place</span>
        </button>
      </main>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col pt-safe"
          >
            <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
              <button onClick={() => setIsAdding(false)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl font-display font-semibold">Add New Place</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      <MapPin size={20} />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. 123 Main St, Lagos"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setResolvedAddress(e.target.value); // Sync resolved address for save logic
                      }}
                      className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Name of Place</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      <Home size={20} />
                    </span>
                    <input
                      type="text"
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      placeholder="e.g. Home, Gym, Work"
                      className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-3">Choose an Icon</label>
                  <div className="grid grid-cols-6 gap-3">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji.id}
                        onClick={() => setSelectedEmoji(emoji.id)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-colors ${selectedEmoji === emoji.id
                          ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/30'
                          : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-3)]'
                          }`}
                      >
                        {emoji.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </main>

            <div className="p-6 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] pb-safe">
              <button
                onClick={handleSave}
                disabled={!placeName || !searchQuery}
                className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98]"
              >
                Save Place
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

