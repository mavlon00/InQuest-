import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, Wallet, User, Settings } from 'lucide-react';

export default function DriverNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'trips', icon: Clock, label: 'Trips', path: '/history' },
    { id: 'earnings', icon: Wallet, label: 'Earnings', path: '/earnings' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-[var(--color-surface-0)] border-t border-[var(--color-surface-3)] flex items-center justify-around px-2 z-40 pb-safe">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
          >
            <Icon size={24} className="mb-1" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
