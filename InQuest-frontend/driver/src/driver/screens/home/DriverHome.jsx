import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShieldAlert, X, Activity, Battery, Wifi, MapPin, Edit2, Search, Crosshair, ChevronRight, Zap } from 'lucide-react';
import { useDriverStore } from '../../app/driverStore';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useDriverSocket } from '../../hooks/useDriverSocket';
import DriverMap from '../../app/components/DriverMap';
import DriverNavBar from '../../app/components/DriverNavBar';
import TripRequestSheet from '../../app/components/TripRequestSheet';
import toast from 'react-hot-toast';

const PRESET_ROUTES = [];

export default function DriverHome() {
  const navigate = useNavigate();
  const { 
    driver, 
    isOnline, 
    setOnline,
    walletBalance,
    fetchWalletData,
    fetchProfile,
    kyc_status,
    activeTrip,
    iotDevice,
    setSettlement,
    settlement,
  } = useDriverStore();

  // Redundant hooks removed for production stability (moved to DriverApp)
  // useDriverLocation();
  // useDriverSocket();

  const [showOfflineConfirm, setShowOfflineConfirm] = useState(false);
  const [showIotDetails, setShowIotDetails] = useState(false);
  const [walletGlow, setWalletGlow] = useState(false);
  
  // Pre-online route selection state
  const [showRouteSheet, setShowRouteSheet] = useState(false);
  const [routeStep, setRouteStep] = useState(1); // 1: Select, 2: Confirm
  const selectedRoute = { label: 'All Areas' };
  const [tempRoute, setTempRoute] = useState(selectedRoute);
  const [searchQuery, setSearchQuery] = useState('');
  // Data Fetching on mount
  useEffect(() => {
    fetchProfile();
    fetchWalletData();
  }, []);

  // KYC Gate — redirect non-approved drivers
  useEffect(() => {
    if (kyc_status && kyc_status !== 'APPROVED') {
      navigate('/kyc', { replace: true });
    }
  }, [kyc_status, navigate]);

  const kycStatus = kyc_status || 'APPROVED';

  const handleToggleOnline = () => {
    if (isOnline) {
      setOnline(false);
    } else {
      // Open route selection sheet before going online
      setTempRoute(selectedRoute);
      setRouteStep(1);
      setShowRouteSheet(true);
    }
  };

  const confirmOnline = () => {
    setShowRouteSheet(false);
    setOnline(true);
  };

  const triggerSOS = () => {
    toast.error('SOS SENT — Emergency Support Dispatched', { duration: 5000, icon: <ShieldAlert className="text-white" /> });
  };

  const dismissMorningSummary = () => {
    setSettlement({ ...settlement, showMorningSummary: false });
  };

  let iotColor = 'var(--color-error)';
  let iotText = 'OFFLINE';
  if (iotDevice.isConnected) {
    if (iotDevice.signalStrength < 2) {
      iotColor = 'var(--color-warning)';
      iotText = 'WEAK';
    } else {
      iotColor = 'var(--color-primary)';
      iotText = 'STABLE';
    }
  }

  const filteredRoutes = PRESET_ROUTES.filter(r => r.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectPresetRoute = (route) => {
    setTempRoute({
      type: 'PRESET',
      presetRouteIds: [route.id],
      customCenter: null,
      customRadiusKm: 1,
      label: route.label
    });
    setRouteStep(2);
  };

  const handleSkipRoute = () => {
    setTempRoute({
      type: 'ANY',
      presetRouteIds: [],
      customCenter: null,
      customRadiusKm: 1,
      label: 'Open to All Areas'
    });
    setRouteStep(2);
  };

  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

  if (kycStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white font-display font-medium tracking-widest text-sm">LOADING ACCOUNT...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <DriverMap />
      </div>

      {/* ── TOP INTERFACE ── */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-safe bg-gradient-to-b from-[var(--color-bg)] via-[var(--color-bg)]/60 to-transparent pb-16 pointer-events-none">
        
        <div className="flex items-center gap-3 px-6 pt-6 mb-6 pointer-events-auto">
          {/* Profile Avatar */}
          <button 
            onClick={() => navigate('/profile')}
            className="w-11 h-11 shrink-0 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] overflow-hidden p-0.5 shadow-lg active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-lg font-display font-bold text-[var(--color-primary)]">
              {driver?.photoUrl ? <img src={driver.photoUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : (driver?.firstName?.charAt(0) || 'D')}
            </div>
          </button>

          {/* ── UNIFIED STATUS BAR ── */}
          <div className="flex-1 flex items-center bg-[var(--color-surface-1)]/80 backdrop-blur-xl border border-[var(--color-surface-3)] rounded-[20px] p-1 gap-1 shadow-lg overflow-hidden">
            {/* IoT Component */}
            <div 
              onClick={() => setShowIotDetails(true)}
              className="flex items-center px-2 py-1.5 rounded-l-2xl cursor-pointer active:bg-white/5 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: iotColor }}></div>
              <span className="text-[9px] font-black tracking-wider uppercase" style={{ color: iotColor }}>{iotText}</span>
            </div>

            <div className="w-px h-4 bg-white/10 shrink-0" />

            {/* Online/Offline Component */}
            <div className="flex items-center px-2 py-1.5">
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOnline ? 'bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] animate-pulse' : 'bg-[var(--color-text-muted)]'}`} />
              <span className={`text-[9px] font-black tracking-wider uppercase ${isOnline ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                {isOnline ? 'ON' : 'OFF'}
              </span>
            </div>

            <div className="w-px h-4 bg-white/10 shrink-0" />

            {/* Active Zone Component (Clickable) */}
            <div 
              onClick={() => { setTempRoute(selectedRoute); setRouteStep(1); setShowRouteSheet(true); }}
              className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0 cursor-pointer active:bg-white/5 transition-colors"
            >
              <MapPin size={10} className={isOnline ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'} />
              <p className={`text-[10px] font-bold truncate tracking-tight ${isOnline ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>
                {selectedRoute.label}
              </p>
            </div>
          </div>

          {/* Notifications */}
          <button className="w-11 h-11 shrink-0 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] flex items-center justify-center relative active:scale-95 transition-transform">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--color-error)] rounded-full border-2 border-[var(--color-surface-1)] shadow-sm"></span>
          </button>
        </div>

        {/* ── TRIPLE WALLET BAR (REPOSITIONED TO TOP) ── */}
        <div className="px-6 pointer-events-auto">
          <div className={`flex bg-[var(--color-surface-0)]/80 backdrop-blur-2xl rounded-2xl p-1 shadow-xl border transition-all duration-700 ${walletGlow ? 'border-[var(--color-primary)] shadow-[0_0_25px_rgba(127,255,0,0.2)] scale-[1.01]' : 'border-[var(--color-surface-3)]/50'}`}>
            <div className="flex-1 px-3 py-2 border-r border-[var(--color-surface-3)]/30 cursor-pointer active:bg-[var(--color-surface-2)] transition-colors rounded-xl" onClick={() => navigate('/wallet')}>
              <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-0.5">Wallet Balance</p>
              <p className="text-sm font-display font-bold text-[var(--color-earnings)]">{formatCurrency(walletBalance || 0)}</p>
            </div>
          </div>
        </div>

        {/* Morning Settlement Banner */}
        {settlement.showMorningSummary && settlement.morningSummary && (
          <div className="px-6 mt-4 pointer-events-auto animate-[slideInDown_0.5s_ease-out]">
            <div 
              onClick={() => navigate('/wallet/main')}
              className="bg-[var(--color-surface-1)] border border-[var(--color-primary)]/40 rounded-[var(--radius-lg)] p-4 shadow-2xl relative cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Zap size={16} className="text-[var(--color-primary)]" />
                </div>
                <p className="text-sm font-bold text-white">Earnings Settled</p>
                <button onClick={(e) => { e.stopPropagation(); dismissMorningSummary(); }} className="ml-auto text-[var(--color-text-muted)] p-1 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Your runs from yesterday are ready! Gross <span className="font-bold text-white">{formatCurrency(settlement.morningSummary.gross)}</span> settled into Savings.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SOS Button */}
      {isOnline && (
        <button 
          onClick={triggerSOS}
          className="absolute bottom-[108px] right-6 z-30 w-16 h-16 rounded-full bg-[var(--color-sos)] flex items-center justify-center shadow-2xl shadow-red-600/40 animate-pulse active:scale-90 transition-transform"
        >
          <ShieldAlert size={28} className="text-white" />
        </button>
      )}

      {/* GO ONLINE Main Button */}
      <div className="absolute bottom-[100px] left-6 right-6 z-30 transition-all duration-500" style={{ transform: showRouteSheet ? 'translateY(200px)' : 'translateY(0)' }}>
        <button
          onClick={handleToggleOnline}
          disabled={kycStatus !== 'APPROVED'}
          className={`w-full h-[72px] rounded-[var(--radius-pill)] font-display font-bold text-2xl tracking-tighter transition-all duration-300 active:scale-95 disabled:opacity-30 ${
            isOnline 
              ? 'bg-[var(--color-surface-1)]/90 backdrop-blur-md text-[var(--color-text-secondary)] border border-[var(--color-surface-3)] shadow-xl' 
              : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-glow)]'
          }`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* ── ROUTE SELECTION SHEET ── */}
      {showRouteSheet && (
        <div className="absolute inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowRouteSheet(false)} />
          <div className="bg-[var(--color-surface-1)] w-full rounded-t-[40px] p-8 pb-all-safe z-10 animate-[slideUp_0.4s_ease-out] shadow-2xl max-h-[85vh] flex flex-col border-t border-white/5">
            
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div>
                <h3 className="text-[28px] font-display font-bold tracking-tight">Set Your <span className="text-[var(--color-primary)]">Area</span></h3>
                <p className="text-[var(--color-text-secondary)] text-sm font-medium mt-1">We'll prioritize requests in this zone.</p>
              </div>
              <button onClick={() => setShowRouteSheet(false)} className="w-10 h-10 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center border border-[var(--color-surface-3)] active:bg-[var(--color-surface-3)]">
                <X size={20} />
              </button>
            </div>

            {routeStep === 1 ? (
              <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-8">
                {/* Search */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-[var(--color-primary)]/20 rounded-[var(--radius-md)] blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative bg-[var(--color-surface-1)] border border-[var(--color-surface-3)] rounded-[var(--radius-md)] group-focus-within:border-[var(--color-primary)] transition-all">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search routes or areas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent h-16 pl-14 pr-6 text-xl font-display font-semibold text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.25em]">Popular Operating Zones</p>
                  {filteredRoutes.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => handleSelectPresetRoute(r)}
                      className="w-full py-4 px-6 rounded-2xl bg-[var(--color-surface-2)]/50 border border-[var(--color-surface-3)] hover:border-[var(--color-primary)]/50 transition-all flex items-center justify-between active:scale-[0.98] group"
                    >
                      <div className="text-left">
                        <p className="font-display font-bold text-lg text-white group-hover:text-[var(--color-primary)] transition-colors">{r.label}</p>
                        <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Traffic: <span className="text-[var(--color-success)]">{r.traffic}</span> · Avg. {r.speed}</p>
                      </div>
                      <ChevronRight size={20} className="text-[var(--color-text-muted)]" />
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setTempRoute({ type: 'CUSTOM', customCenter: { lat: 6.5, lng: 3.3 }, customRadiusKm: 2, label: 'Custom 2km Radius' });
                      setRouteStep(2);
                    }}
                    className="w-full p-6 rounded-3xl border-2 border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 flex items-center gap-5 active:scale-[0.98] transition-all"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
                      <Crosshair size={24} className="text-[var(--color-primary)]" />
                    </div>
                    <div className="text-left">
                      <p className="font-display font-bold text-xl text-white">Specific Search Radius</p>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">Focus on a custom point around you</p>
                    </div>
                  </button>
                </div>

                <button onClick={handleSkipRoute} className="w-full text-center text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest hover:text-white underline underline-offset-8 transition-colors">
                  SKIP & ALL AREAS
                </button>
              </div>
            ) : (
              <div className="flex-1 pb-4 animate-[fadeIn_0.4s_ease-out]">
                <div className="bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface-3)] rounded-[32px] p-8 space-y-8 shadow-inner border border-white/5 mb-8">
                  <div>
                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-3">Selected Primary Zone</p>
                    <h2 className="text-3xl font-display font-bold text-[var(--color-primary)] leading-tight">{tempRoute.label}</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                      <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Availability</p>
                      <p className="text-lg font-display font-bold text-[var(--color-success)]">High Volume</p>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                      <p className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Queue Size</p>
                      <p className="text-lg font-display font-bold text-white">~4 Drivers</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={confirmOnline}
                    className="w-full h-[72px] rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-[var(--color-on-primary)] font-display font-bold text-2xl shadow-[var(--shadow-glow)] active:scale-95 transition-all"
                  >
                    CONFIRM & GO ONLINE
                  </button>
                  <button 
                    onClick={() => setRouteStep(1)}
                    className="w-full h-14 rounded-[var(--radius-pill)] bg-transparent text-[var(--color-text-secondary)] font-bold tracking-widest text-sm hover:text-white transition-colors"
                  >
                    BACK TO ROUTES
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IoT Status Overlay */}
      {showIotDetails && (
        <div className="absolute inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowIotDetails(false)} />
          <div className="bg-[var(--color-surface-1)] w-full rounded-t-[40px] p-8 pb-all-safe z-10 animate-[slideUp_0.3s_ease-out] border-t border-white/5">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-display font-bold">IoT Fleet <span className="text-[var(--color-primary)]">Sync</span></h3>
              <button onClick={() => setShowIotDetails(false)} className="w-10 h-10 bg-[var(--color-surface-2)] rounded-full flex items-center justify-center border border-[var(--color-surface-3)]">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Device ID', val: iotDevice.deviceId, icon: Activity },
                { label: 'Battery Status', val: `${iotDevice.batteryPercent}%`, icon: Battery, color: iotDevice.batteryPercent < 20 ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]' },
                { label: 'Cloud Signal', val: iotText, icon: Wifi, color: iotColor },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-5 bg-[var(--color-surface-2)]/50 rounded-2xl border border-[var(--color-surface-3)]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center">
                      <item.icon size={20} className="text-[var(--color-text-muted)]" />
                    </div>
                    <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ${item.color || 'text-white'}`}>{item.val}</span>
                </div>
              ))}
              <p className="text-[10px] text-center text-[var(--color-text-muted)] pt-6 font-bold uppercase tracking-[0.2em] animate-pulse">
                Encrypted Real-time IoT Handshake Active
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Request Filter Layer */}
      {incomingRequest && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xl">
          <TripRequestSheet />
        </div>
      )}

      <DriverNavBar />

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideInDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
