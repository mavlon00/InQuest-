import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../app/driverStore';
import DriverNavBar from '../../app/components/DriverNavBar';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ChevronRight, Bell, BellOff, Navigation, MapPin,
  Wallet, Shield, LogOut, Trash2, Phone, MessageCircle,
  HelpCircle, FileText, Moon, Zap, Volume2, VolumeX,
  Route, AlertTriangle, Check, X
} from 'lucide-react';

// ── Reusable components ───────────────────────────────────────────

function SectionHeader({ title }) {
  return (
    <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest px-4 pt-5 pb-2">
      {title}
    </p>
  );
}

function SettingRow({ icon: Icon, iconColor = 'var(--color-primary)', label, sublabel, trailing, onClick, destructive }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 border-b border-[var(--color-surface-3)] last:border-0 active:bg-[var(--color-surface-2)]/50 transition-colors ${destructive ? 'text-[var(--color-error)]' : ''}`}
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: destructive ? 'rgba(239,68,68,0.12)' : `${iconColor}18` }}
      >
        <Icon size={18} style={{ color: destructive ? 'var(--color-error)' : iconColor }} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${destructive ? 'text-[var(--color-error)]' : 'text-[var(--color-text-primary)]'}`}>{label}</p>
        {sublabel && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sublabel}</p>}
      </div>
      {trailing ?? <ChevronRight size={16} className="text-[var(--color-text-muted)] shrink-0" />}
    </button>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)]'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SettingCard({ children }) {
  return (
    <div className="mx-4 bg-[var(--color-surface-1)] rounded-[var(--radius-lg)] border border-[var(--color-surface-3)] overflow-hidden">
      {children}
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────
function ConfirmModal({ title, body, confirmLabel, confirmDestructive, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
      <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] p-6 w-full max-w-sm shadow-[var(--shadow-modal)]" style={{ animation: 'fadeIn 0.2s ease' }}>
        <h3 className="text-lg font-display font-semibold mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">{body}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 h-12 rounded-[var(--radius-pill)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-semibold text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-12 rounded-[var(--radius-pill)] font-semibold text-sm ${confirmDestructive ? 'bg-[var(--color-error)] text-white' : 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function DriverSettings() {
  const navigate = useNavigate();
  const { driver, isOnline, setIsOnline, logout } = useDriverStore();

  // Notification prefs
  const [notifTrips,      setNotifTrips]      = useState(true);
  const [notifEarnings,   setNotifEarnings]   = useState(true);
  const [notifSystem,     setNotifSystem]      = useState(true);
  const [notifMarketing,  setNotifMarketing]  = useState(false);
  const [soundEnabled,    setSoundEnabled]    = useState(true);
  const [vibration,       setVibration]       = useState(true);

  // Navigation prefs
  const [navApp, setNavApp]       = useState('IN_APP');   // IN_APP | GOOGLE | WAZE
  const [voiceNav, setVoiceNav]   = useState(true);
  const [trafficLayer, setTrafficLayer] = useState(true);

  // Availability
  const [acceptCash,   setAcceptCash]   = useState(true);
  const [acceptWallet, setAcceptWallet] = useState(true);
  const [acceptCard,   setAcceptCard]   = useState(true);

  // Modals
  const [showLogout,  setShowLogout]  = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    toast('Logged out successfully.', { icon: '👋' });
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion request submitted. An admin will contact you within 48 hours.');
    setShowDelete(false);
  };

  const NavAppOptions = ['IN_APP', 'GOOGLE_MAPS', 'WAZE'];
  const navLabels = { IN_APP: 'In-App (default)', GOOGLE_MAPS: 'Google Maps', WAZE: 'Waze' };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] pb-28">

      {/* Header */}
      <header className="flex items-center px-4 pt-safe pt-4 pb-4 border-b border-[var(--color-surface-3)] sticky top-0 bg-[var(--color-bg)] z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-3 rounded-full hover:bg-[var(--color-surface-2)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-display font-semibold">Settings</h1>
      </header>

      {/* ── AVAILABILITY ── */}
      <SectionHeader title="Availability" />
      <SettingCard>
        <div className="flex items-center gap-4 px-4 py-4 border-b border-[var(--color-surface-3)]">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--color-primary)]/15 flex items-center justify-center shrink-0">
            <Zap size={18} className="text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Online Status</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{isOnline ? 'You are currently accepting trips' : 'You are offline'}</p>
          </div>
          <Toggle value={isOnline} onChange={(v) => { setIsOnline(v); toast(v ? 'You are now online' : 'You are now offline', { icon: v ? '🟢' : '⚫' }); }} />
        </div>

        {/* Payment methods */}
        <div className="px-4 py-3 border-b border-[var(--color-surface-3)]">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Accept Payment Methods</p>
          <div className="space-y-3">
            {[
              { label: 'Cash',   icon: '💵', value: acceptCash,   set: setAcceptCash   },
              { label: 'Wallet', icon: '💳', value: acceptWallet, set: setAcceptWallet },
              { label: 'Card',   icon: '🏦', value: acceptCard,   set: setAcceptCard   },
            ].map(({ label, icon, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <p className="text-sm text-[var(--color-text-secondary)]">{icon} {label}</p>
                <Toggle value={value} onChange={set} />
              </div>
            ))}
          </div>
        </div>

        <SettingRow
          icon={Route}
          label="Route Preferences"
          sublabel="Set opertion area & preferred routes"
          onClick={() => toast('Route preferences — tap GO ONLINE from home to set route')}
        />
      </SettingCard>

      {/* ── WALLET ── */}
      <SectionHeader title="Wallet" />
      <SettingCard>
        <SettingRow icon={Wallet}  label="Savings Wallet"      sublabel="Withdraw earnings to your bank"   onClick={() => navigate('/wallet/main')} />
        <SettingRow icon={Shield}  label="Maintenance Savings"  sublabel="Admin-approved withdrawals only"  onClick={() => navigate('/wallet/maintenance')} />
        <SettingRow icon={FileText} label="Transaction PIN"     sublabel="Change your 4-digit withdrawal PIN" onClick={() => toast('PIN change — coming soon')} />
        <SettingRow icon={Wallet}  label="Linked Bank Account"  sublabel="Access Bank ••••3421"              onClick={() => toast('Bank management — coming soon')} />
      </SettingCard>

      {/* ── NAVIGATION ── */}
      <SectionHeader title="Navigation" />
      <SettingCard>
        <div className="px-4 py-4 border-b border-[var(--color-surface-3)]">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Preferred Navigation App</p>
          <div className="space-y-2">
            {NavAppOptions.map(app => (
              <button
                key={app}
                onClick={() => { setNavApp(app); toast(`Navigation set to ${navLabels[app]}`); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] border text-sm font-medium transition-all ${navApp === app ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-surface-3)] bg-[var(--color-surface-2)] text-[var(--color-text-secondary)]'}`}
              >
                {navLabels[app]}
                {navApp === app && <Check size={16} className="text-[var(--color-primary)]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Voice Navigation</p>
              <p className="text-xs text-[var(--color-text-muted)]">Turn-by-turn voice guidance</p>
            </div>
            <Toggle value={voiceNav} onChange={(v) => { setVoiceNav(v); toast(v ? 'Voice navigation on' : 'Voice navigation off'); }} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Traffic Layer</p>
              <p className="text-xs text-[var(--color-text-muted)]">Show live traffic on map</p>
            </div>
            <Toggle value={trafficLayer} onChange={setTrafficLayer} />
          </div>
        </div>
      </SettingCard>

      {/* ── NOTIFICATIONS ── */}
      <SectionHeader title="Notifications" />
      <SettingCard>
        <div className="px-4 pt-4 pb-2 space-y-4">
          {[
            { label: 'Trip Requests',   sublabel: 'New booking notifications',     value: notifTrips,     set: setNotifTrips     },
            { label: 'Earnings & Settlements', sublabel: 'Midnight settlement alerts', value: notifEarnings, set: setNotifEarnings },
            { label: 'System Alerts',   sublabel: 'KYC, account, wallet updates',  value: notifSystem,    set: setNotifSystem    },
            { label: 'Promotions',      sublabel: 'Bonuses and Inquest updates',   value: notifMarketing, set: setNotifMarketing },
          ].map(({ label, sublabel, value, set }) => (
            <div key={label} className="flex items-start justify-between gap-4 border-b border-[var(--color-surface-3)] pb-4 last:border-0 last:pb-0">
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sublabel}</p>
              </div>
              <Toggle value={value} onChange={set} />
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-surface-3)] px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 size={18} className="text-[var(--color-text-secondary)]" /> : <VolumeX size={18} className="text-[var(--color-text-muted)]" />}
              <p className="text-sm font-medium">Sound</p>
            </div>
            <Toggle value={soundEnabled} onChange={setSoundEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Vibration</p>
            </div>
            <Toggle value={vibration} onChange={setVibration} />
          </div>
        </div>
      </SettingCard>

      {/* ── SUPPORT ── */}
      <SectionHeader title="Support" />
      <SettingCard>
        <SettingRow
          icon={MessageCircle}
          iconColor="var(--color-success)"
          label="WhatsApp Support"
          sublabel="Chat with our driver support team"
          onClick={() => window.open('https://wa.me/2349000000000?text=Hi+Inquest+Driver+Support', '_blank')}
        />
        <SettingRow
          icon={Phone}
          iconColor="var(--color-info)"
          label="Call Support"
          sublabel="Available 7am – 10pm daily"
          onClick={() => window.open('tel:+2349000000000')}
        />
        <SettingRow
          icon={HelpCircle}
          label="FAQ & Help Centre"
          onClick={() => toast('Help centre — coming soon')}
        />
        <SettingRow
          icon={FileText}
          label="Terms & Conditions"
          onClick={() => toast('Terms — coming soon')}
        />
        <SettingRow
          icon={Shield}
          label="Privacy Policy"
          onClick={() => toast('Privacy policy — coming soon')}
        />
      </SettingCard>

      {/* ── ACCOUNT ── */}
      <SectionHeader title="Account" />
      <SettingCard>
        <SettingRow
          icon={Shield}
          label="KYC Status"
          sublabel="Tap to view verification status"
          onClick={() => navigate('/kyc/pending')}
          trailing={
            <span className="text-xs font-bold text-[var(--color-success)] bg-[var(--color-success)]/15 px-2 py-1 rounded-full">APPROVED</span>
          }
        />
        <SettingRow
          icon={MapPin}
          label="Residential Address"
          sublabel="Update your address on file"
          onClick={() => toast('Address update — contact support')}
        />
        <SettingRow
          icon={Navigation}
          label="Change PIN"
          sublabel="Update your transaction PIN"
          onClick={() => toast('PIN change — coming soon')}
        />
        <SettingRow
          icon={LogOut}
          label="Log Out"
          onClick={() => setShowLogout(true)}
        />
        <SettingRow
          icon={Trash2}
          label="Delete Account"
          sublabel="This action cannot be undone"
          destructive
          onClick={() => setShowDelete(true)}
          trailing={<ChevronRight size={16} className="text-[var(--color-error)] shrink-0" />}
        />
      </SettingCard>

      {/* App version */}
      <p className="text-center text-xs text-[var(--color-text-muted)] py-6">
        Inquest Driver App · v1.0.0
      </p>

      <DriverNavBar />

      {/* Logout confirm */}
      {showLogout && (
        <ConfirmModal
          title="Log Out?"
          body="You will be signed out of this device. You can log back in anytime."
          confirmLabel="Log Out"
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}

      {/* Delete confirm */}
      {showDelete && (
        <ConfirmModal
          title="Delete Account?"
          body="This will permanently deactivate your driver account. Any unsettled earnings must be withdrawn first. An admin will process your request within 48 hours."
          confirmLabel="Delete Account"
          confirmDestructive
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDelete(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
