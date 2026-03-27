import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Smartphone, Mail, ShieldAlert , ChevronLeft} from 'lucide-react';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    push: {
      tripUpdates: true,
      promotions: false,
      safetyAlerts: true,
      walletActivity: true,
    },
    sms: {
      tripUpdates: true,
      promotions: false,
      safetyAlerts: true,
      walletActivity: false,
    },
    email: {
      tripUpdates: false,
      promotions: true,
      safetyAlerts: true,
      walletActivity: true,
    }
  });

  const toggleSetting = (channel, key) => {
    setSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [key]: !prev[channel][key]
      }
    }));
  };

  const sections = [
    {
      title: 'Push Notifications',
      icon: <Bell size={20} className="text-[var(--color-primary)]" />,
      channel: 'push',
    },
    {
      title: 'SMS Alerts',
      icon: <Smartphone size={20} className="text-[var(--color-primary)]" />,
      channel: 'sms',
    },
    {
      title: 'Email Updates',
      icon: <Mail size={20} className="text-[var(--color-primary)]" />,
      channel: 'email',
    }
  ];

  const items = [
    { key: 'tripUpdates', label: 'Trip Updates', desc: 'Driver arrival, ETA changes, cancellations.' },
    { key: 'safetyAlerts', label: 'Safety Alerts', desc: 'SOS triggers, unusual route detection.', icon: <ShieldAlert size={14} className="text-[var(--color-warning)] inline ml-1" /> },
    { key: 'walletActivity', label: 'Wallet Activity', desc: 'Top-ups, transfers, and payments.' },
    { key: 'promotions', label: 'Promotions & Offers', desc: 'Discounts, rewards, and new features.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Notification Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {sections.map((section) => (
          <div key={section.channel} className="bg-[var(--color-surface-1)] rounded-3xl border border-[var(--color-border-subtle)] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center gap-3 bg-[var(--color-surface-2)]">
              {section.icon}
              <h2 className="font-semibold text-sm uppercase tracking-wider">{section.title}</h2>
            </div>
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {items.map((item) => (
                <div key={item.key} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1 text-[var(--color-text-primary)]">
                      {item.label} {item.icon}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(section.channel, item.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${settings[section.channel][item.key]
                        ? 'bg-[var(--color-primary)]'
                        : 'bg-[var(--color-surface-3)]'
                      }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${settings[section.channel][item.key]
                          ? 'translate-x-6'
                          : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

