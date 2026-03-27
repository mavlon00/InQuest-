import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, MapPin, ShieldCheck, Gift, Users, Building2, Globe, Monitor, HelpCircle, LogOut, ChevronRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store';

export default function Profile() {
  const navigate = useNavigate();
  const { user, login, logout, setToastMessage } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'User');
  const [editPhone, setEditPhone] = useState(user?.phone || '08012345678');
  const [editPhoto, setEditPhoto] = useState(user?.photo || null);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/splash', { replace: true });
  };

  const handleSave = () => {
    login({ ...user, name: editName, phone: editPhone, photo: editPhoto });
    setIsEditing(false);
    setToastMessage('Profile updated successfully');
  };

  const handleCancel = () => {
    setEditName(user?.name || 'User');
    setEditPhone(user?.phone || '08012345678');
    setEditPhoto(user?.photo || null);
    setIsEditing(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhoto(reader.result );
      };
      reader.readAsDataURL(file);
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: <CreditCard size={20} />, label: 'My Card', path: '/profile/card' },
        { icon: <MapPin size={20} />, label: 'Saved Places', path: '/profile/saved-places' },
        { icon: <ShieldCheck size={20} />, label: 'Guardian Mode', path: '/profile/guardians' },
      ]
    },
    {
      title: 'Rewards & Payments',
      items: [
        { icon: <Gift size={20} />, label: 'Green Rewards', path: '/profile/green-rewards' },
        { icon: <Users size={20} />, label: 'Refer & Earn', path: '/profile/referrals' },
        { icon: <CreditCard size={20} />, label: 'Payment Methods', path: '/profile/payments' },
        { icon: <Building2 size={20} />, label: 'Corporate Account', path: '/profile/corporate' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Globe size={20} />, label: 'Language', path: '/profile/language' },
        { icon: <Monitor size={20} />, label: 'Appearance', path: '/profile/theme' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle size={20} />, label: 'Help & Support', path: '/profile/help' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-xl font-display font-semibold">Profile</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* User Info */}
        <div className="bg-[var(--color-surface-1)] p-4 rounded-3xl border border-[var(--color-border-subtle)] shadow-sm">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div 
                  className="relative w-20 h-20 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border border-[var(--color-border)] cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {editPhoto ? (
                    <img src={editPhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-[var(--color-text-secondary)]" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleCancel}
                  className="flex-1 bg-transparent text-[var(--color-text-secondary)] py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-surface-2)] transition-colors border border-[var(--color-border-subtle)]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-[var(--color-primary)] text-[var(--color-primary-text)] py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-primary)]/90 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                {user?.photo ? (
                  <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-[var(--color-text-secondary)]" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg mb-1">{user?.name || 'User'}</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{user?.phone || '08012345678'}</p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors text-sm font-medium"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 ml-2">{section.title}</h3>
              <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden">
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {section.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(item.path)}
                      className="w-full p-4 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-[var(--color-text-secondary)]">{item.icon}</div>
                        <span className="font-medium text-sm text-[var(--color-text-primary)]">{item.label}</span>
                      </div>
                      <ChevronRight size={20} className="text-[var(--color-text-muted)] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="pt-4 pb-8">
          <button
            onClick={handleLogout}
            className="w-full bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-error)]/20 flex items-center justify-center gap-2 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors font-medium"
          >
            <LogOut size={20} />
            Log Out
          </button>
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-4">
            Inquest Mobility v1.0.0
          </p>
        </div>
      </main>
    </div>
  );
}

