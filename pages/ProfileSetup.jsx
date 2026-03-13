import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ArrowRight, User, Phone } from 'lucide-react';
import { useStore } from '../store';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      login({ name, photo, emergencyContact: { name: emergencyName, phone: emergencyPhone } });
      navigate('/home');
    }
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip? Emergency contacts are required for SOS alerts.')) {
      login({ name: name || 'Passenger', photo, emergencyContact: null });
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="text-[var(--color-text-muted)] text-sm font-medium">Step 1 of 1</div>
        <button onClick={handleSkip} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] font-medium text-sm transition-colors">
          Skip
        </button>
      </header>

      <main className="flex-1 px-6 pt-4 pb-12 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          <h1 className="text-3xl font-display font-semibold mb-2 tracking-tight">
            Complete your profile
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-8 text-base">
            Help drivers recognize you and set up your safety contacts.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-[var(--color-text-muted)]" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition-transform">
                  <Camera size={16} className="text-[var(--color-primary-text)]" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Full Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chidi Okafor"
                    className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl py-4 pl-12 pr-4 text-base font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-subtle)]">
                <h3 className="text-lg font-semibold mb-1">Emergency Contact</h3>
                <p className="text-xs text-[var(--color-text-muted)] mb-4">Required for SOS emergency alerts.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="e.g. Mom"
                      className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl py-4 px-4 text-base font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Phone Number</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center gap-2 text-[var(--color-text-primary)] font-medium">
                        <svg className="w-6 h-4 rounded-sm" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                          <rect width="200" height="400" fill="#008751" />
                          <rect x="200" width="200" height="400" fill="#ffffff" />
                          <rect x="400" width="200" height="400" fill="#008751" />
                        </svg>
                        <span>+234</span>
                        <div className="w-px h-5 bg-[var(--color-border)] ml-2" />
                      </div>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="800 000 0000"
                        maxLength={10}
                        className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-2xl py-4 pl-28 pr-4 text-base font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-[var(--color-primary)] text-[var(--color-primary-text)] py-4 rounded-2xl font-semibold text-lg shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98] mt-8 flex items-center justify-center gap-2"
            >
              Complete Profile <ArrowRight size={20} />
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

