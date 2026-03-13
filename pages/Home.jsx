import { useState, useEffect, Component } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, MapPin, Navigation, Calendar, RefreshCw,
  Wallet, Leaf, ChevronRight, Clock, User, ArrowUpRight,
  ArrowDownLeft, Share2, ShieldCheck, Award, Gift, CheckCircle2,
  Sun, Moon
} from 'lucide-react';
import { useStore } from '../store';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MapControls from '../components/MapControls';
import DestinationAlarm from '../components/DestinationAlarm';
import TransactionDetailSheet from '../components/TransactionDetailSheet';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--color-primary); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--color-glow);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const kekeIcon = new L.DivIcon({
  className: 'keke-icon keke-pulse',
  html: `
    <div style="position: relative; width: 32px; height: 32px; background-color: var(--color-surface-2); border-radius: 8px; border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); border-radius: 8px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
      <div style="position: absolute; top: -6px; right: -6px; background-color: var(--color-primary); color: var(--color-primary-text); font-size: 10px; font-weight: bold; padding: 2px 4px; border-radius: 4px; border: 1px solid var(--color-bg);">2/4</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

class TripErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--color-text-primary)] p-8 text-center bg-[var(--color-bg)]">
          <p>Something went wrong loading your trip.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-[var(--color-primary)] text-black rounded-full font-bold">
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ActiveTripView = () => {
  const { booking, updateBooking, theme } = useStore();
  const [location, setLocation] = useState(null);
  const [panelHeight, setPanelHeight] = useState(80);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    if (booking.passengerLat && booking.passengerLng) {
      setLocation([booking.passengerLat, booking.passengerLng]);
    }
    const timer = setTimeout(() => setShowRecovery(true), 2000);
    return () => clearTimeout(timer);
  }, [booking.passengerLat, booking.passengerLng]);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPanelHeight(entry.target.offsetHeight);
      }
    });
    const panel = document.getElementById('driver-panel');
    if (panel) observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  const handleRecover = () => {
    try {
      const saved = localStorage.getItem('inquest-storage');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.state && parsed.state.booking) {
          updateBooking(parsed.state.booking);
        }
      }
      setShowRecovery(false);
    } catch (e) {
      console.error("Recovery failed", e);
    }
  };

  const driverValid = booking.driver &&
    typeof booking.driver.lat === 'number' && !isNaN(booking.driver.lat) &&
    typeof booking.driver.lng === 'number' && !isNaN(booking.driver.lng);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `calc(100vh - 44px - ${panelHeight}px)` }}>
      {location ? (
        <MapContainer center={location} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
          />
          <Marker position={location} icon={customMarkerIcon} />
          {driverValid && (
            <Marker position={[booking.driver.lat, booking.driver.lng]} icon={kekeIcon} />
          )}
          <MapController center={location} />
        </MapContainer>
      ) : showRecovery ? (
        <div className="h-full flex flex-col items-center justify-center bg-[var(--color-bg)] gap-4 px-8 text-center">
          <p className="text-[var(--color-text-muted)] text-sm mb-2">Stuck loading? Your trip data might need a refresh.</p>
          <button onClick={handleRecover} className="flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-[var(--color-primary)] font-bold transition-all active:scale-95">
            <RefreshCw size={20} />
            <span>Tap to reload your trip</span>
          </button>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center bg-[var(--color-surface-1)]">
          <div className="animate-pulse flex flex-col items-center">
            <MapPin size={32} className="text-[var(--color-primary)] mb-4" />
            <p className="text-[var(--color-text-secondary)] font-medium">Finding your location...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const { user, booking, updateBooking, theme, setTheme, walletBalance, transactions, tripHistory, referralStatus, savedPlaces } = useStore();
  const [location, setLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [kekePositions, setKekePositions] = useState([]);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [activeAlarm, setActiveAlarm] = useState(null);

  useEffect(() => {
    // Simulate getting GPS location
    setTimeout(() => {
      const initialLocation = [6.5244, 3.3792];
      setLocation(initialLocation);
      updateBooking({ passengerLat: initialLocation[0], passengerLng: initialLocation[1] });

      // Initialize keke positions nearby
      setKekePositions([
        { id: 1, pos: [initialLocation[0] + 0.002, initialLocation[1] + 0.002], distance: 250 },
        { id: 2, pos: [initialLocation[0] - 0.003, initialLocation[1] + 0.001], distance: 350 }
      ]);
    }, 1000);
  }, [updateBooking]);

  // Simulate vehicle movement
  useEffect(() => {
    if (kekePositions.length === 0) return;

    const interval = setInterval(() => {
      setKekePositions(prev => prev.map(keke => {
        // Only move one or two randomly
        if (Math.random() > 0.7) {
          return {
            ...keke,
            pos: [
              keke.pos[0] + (Math.random() - 0.5) * 0.0002,
              keke.pos[1] + (Math.random() - 0.5) * 0.0002
            ]
          };
        }
        return keke;
      }));
    }, 12000); // Between 10-15s as requested

    return () => clearInterval(interval);
  }, [kekePositions.length]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchFocus = () => {
    setIsSearching(true);
  };

  const handleSearchClose = () => {
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleDestinationSelect = (dest) => {
    updateBooking({ destinationName: dest });
    navigate('/book/onspot');
  };

  const handleShareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Inquest Mobility',
          text: `Use my referral code to get ₦500 off your first ride!`,
          url: 'https://inquest.app',
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const shouldShowTracking = () => {
    const status = booking?.status;
    const hasDriver = booking?.driver !== null && booking?.driver !== undefined;
    const validStatuses = ['ACCEPTED', 'EN_ROUTE', 'ARRIVING', 'ARRIVED', 'IN_PROGRESS'];
    return validStatuses.includes(status) && hasDriver;
  };

  if (shouldShowTracking()) {
    return (
      <TripErrorBoundary>
        <ActiveTripView />
      </TripErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-24">
      {/* TOP BAR */}
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-bg)] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-[var(--color-primary)] rounded-sm" />
          <span className="font-display font-semibold text-lg tracking-tight">INQUEST</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => navigate('/notifications')} className="relative p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-error)] rounded-full border border-[var(--color-bg)]" />
          </button>
          <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] overflow-hidden border border-[var(--color-border)]">
            {user?.photo ? (
              <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* MINI MAP */}
      <div className="h-[240px] relative w-full rounded-b-3xl overflow-hidden shadow-sm mb-6 z-10">
        {location ? (
          <MapContainer center={location} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
            <TileLayer
              url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
            />
            {location && (
              <Marker position={location} icon={customMarkerIcon} />
            )}
            {kekePositions.map(keke => (
              keke.pos && typeof keke.pos[0] === 'number' && (
                <Marker
                  key={keke.id}
                  position={keke.pos}
                  icon={kekeIcon}
                  eventHandlers={{ click: () => navigate('/book/onspot', { state: { selectedKeke: { id: keke.id, distance: keke.distance, eta: `${Math.floor(keke.distance / 100)} mins away` } } }) }}
                />
              )
            ))}
            <MapController center={location} />
            <MapControls
              userLocation={location}
              onAlarmClick={() => setIsAlarmModalOpen(true)}
              isAlarmActive={!!activeAlarm}
            />
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-[var(--color-surface-2)] animate-pulse">
            <MapPin size={24} className="text-[var(--color-text-muted)]" />
          </div>
        )}

        {/* Map Overlays */}
        <div className="absolute top-4 left-4 z-[var(--z-map-controls)] flex flex-col gap-2">
          <div className="bg-[var(--color-surface-1)] px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)] shadow-sm flex items-center gap-2 w-fit">
            <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--color-text-primary)]">6 nearby kekes</span>
          </div>

          <AnimatePresence>
            {activeAlarm && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[var(--color-primary)] text-[var(--color-primary-text)] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 w-fit border border-[var(--color-bg)]/20"
              >
                <div className="relative">
                  <Bell size={12} className="fill-current" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">Alarm: {activeAlarm.destination}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      </div>

      {/* SEARCH BAR */}
      <div className="px-4 mb-8">
        <div
          onClick={handleSearchFocus}
          className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] rounded-full py-4 px-5 flex items-center gap-3 shadow-sm cursor-text hover:border-[var(--color-border)] transition-colors"
        >
          <Search size={20} className="text-[var(--color-primary)]" />
          <span className="text-[var(--color-text-muted)] font-medium text-base">Where are you going?</span>
        </div>

        <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide px-2">
          {savedPlaces.map((place) => (
            <button key={place.id} onClick={() => handleDestinationSelect(place.label)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] whitespace-nowrap text-sm font-medium hover:bg-[var(--color-surface-3)] transition-colors">
              <MapPin size={14} className="text-[var(--color-text-secondary)]" /> {place.label}
            </button>
          ))}
          <button onClick={() => handleDestinationSelect('Ikeja City Mall')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] whitespace-nowrap text-sm font-medium hover:bg-[var(--color-surface-3)] transition-colors">
            <Clock size={14} className="text-[var(--color-text-secondary)]" /> Ikeja City Mall
          </button>
        </div>
      </div>

      {/* BOOKING TYPE CARDS */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-medium text-lg">How do you want to ride?</h2>
          <Link to="/book/onspot" className="text-sm font-medium text-[var(--color-primary)]">See All</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Link to="/book/onspot" className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-2 hover:border-[var(--color-primary)] transition-colors group relative">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
              <Navigation size={20} className="text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <h3 className="font-display font-medium text-sm mb-0.5">On-Spot</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] font-sans leading-tight">Find nearby keke</p>
            </div>
            <ChevronRight size={14} className="absolute bottom-2 right-2 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link to="/book/personal" className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-2 hover:border-[var(--color-primary)] transition-colors group relative">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
              <MapPin size={20} className="text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <h3 className="font-display font-medium text-sm mb-0.5">Personal</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] font-sans leading-tight">Book for yourself</p>
            </div>
            <ChevronRight size={14} className="absolute bottom-2 right-2 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link to="/book/recurring" className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-2 hover:border-[var(--color-primary)] transition-colors group relative">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
              <Calendar size={20} className="text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <h3 className="font-display font-medium text-sm mb-0.5">Recurring</h3>
              <p className="text-[10px] text-[var(--color-text-muted)] font-sans leading-tight">Schedule rides</p>
            </div>
            <ChevronRight size={14} className="absolute bottom-2 right-2 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>

      {/* WALLET SECTION */}
      <div className="px-4 mb-8">
        <h2 className="font-display font-medium text-lg mb-4 ml-2">Wallet</h2>
        <div className="bg-[var(--color-surface-1)] rounded-[var(--radius-xl)] border border-[var(--color-border-subtle)] p-4 flex items-center justify-between shadow-md">
          {/* Balance Section */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/wallet')}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)]/10 transition-colors">
              <Wallet size={18} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Balance</p>
              <p className="font-display font-semibold text-lg text-[var(--color-primary)] leading-tight">₦{walletBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-[var(--color-border-subtle)]" />

          {/* Green Points Section */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/profile/green-rewards')}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-success)]/20 transition-colors">
              <Leaf size={18} className="text-[var(--color-success)]" />
            </div>
            <div>
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">Green Pts</p>
              <p className="font-display font-semibold text-lg text-[var(--color-success)] leading-tight">2,450</p>
            </div>
          </div>

          <div className="w-px h-8 bg-[var(--color-border-subtle)]" />

          {/* Add Funds Button */}
          <button
            onClick={() => navigate('/wallet/topup')}
            className="bg-[var(--color-primary)] text-[var(--color-primary-text)] px-5 py-2.5 rounded-full font-sans font-semibold text-sm shadow-[var(--shadow-glow)] active:scale-95 transition-all hover:brightness-110"
          >
            Add Funds
          </button>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-medium text-lg">Recent Activity</h2>
          <Link to="/trips" className="text-sm font-medium text-[var(--color-primary)]">See All</Link>
        </div>

        <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden">
          {tripHistory.length > 0 ? (
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {tripHistory.slice(0, 4).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTx({ ...trip, type: 'debit', title: `Ride to ${trip.dropoff}`, method: 'Wallet Balance', amount: trip.fare })}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 border border-[var(--color-border)] group-hover:scale-110 transition-transform">
                    {trip.status === 'Completed' ? (
                      <Navigation size={18} className="text-[var(--color-text-primary)]" />
                    ) : (
                      <ShieldCheck size={18} className="text-[var(--color-text-secondary)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-semibold text-sm truncate text-[var(--color-text-primary)]">
                      {trip.status === 'Cancelled' ? 'Cancelled Trip' : `Ride to ${trip.dropoff}`}
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mt-0.5">
                      {trip.date?.split(' • ')[0]}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <p className={`font-display font-bold text-sm ${trip.status === 'Cancelled' ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {trip.status === 'Cancelled' ? '₦0' : `-₦${trip.fare}`}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] font-medium mt-0.5">{trip.status}</p>
                    </div>
                    <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">No trips yet. Book your first ride.</p>
              <button
                onClick={() => navigate('/book/onspot')}
                className="bg-[var(--color-primary)] text-[var(--color-primary-text)] px-6 py-2 rounded-full font-medium text-sm hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                Book Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REFERRAL CARD REDESIGN */}
      <div className="px-4 mb-10">
        <div
          onClick={() => navigate('/profile/referrals')}
          className="bg-[var(--color-primary)] rounded-[var(--radius-xl)] p-7 relative overflow-hidden cursor-pointer shadow-[0_20px_40px_rgba(127,255,0,0.15)] active:scale-[0.98] transition-all group"
        >
          {/* Creative Gift Icon Overlay */}
          <div className="absolute -bottom-6 -right-6 text-black/10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
            <Gift size={160} strokeWidth={1} />
          </div>

          <div className="flex justify-between items-start gap-4 relative z-10">
            <div className="flex-1">
              <h2 className="font-display font-semibold text-2xl text-black mb-2 leading-tight">Invite friends,<br />earn ₦500 each.</h2>
              <p className="text-sm font-sans font-medium text-black/60 mb-6 max-w-[220px] leading-relaxed">Both of you earn when they complete their first ride.</p>

              <div className="flex flex-col gap-4">
                {referralStatus.referrals > 0 && (
                  <div className="bg-black/5 rounded-2xl p-3 inline-block">
                    <p className="text-xs font-sans font-bold text-black flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      {referralStatus.referrals} friends joined · ₦{referralStatus.earned.toLocaleString()} earned
                    </p>
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); handleShareReferral(); }}
                  className="bg-black text-white px-8 py-3.5 rounded-full font-sans font-bold text-sm shadow-xl active:scale-95 transition-all w-fit hover:shadow-2xl hover:-translate-y-0.5"
                >
                  Share Your Code
                </button>
              </div>
            </div>

            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg mt-1 group-hover:scale-110 transition-transform">
              <Gift size={28} className="text-[var(--color-primary)]" />
            </div>
          </div>
        </div>
      </div>


      {/* Search Overlay */}
      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[var(--color-bg)] flex flex-col"
          >
            <div className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)]">
              <button onClick={handleSearchClose} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full bg-[var(--color-surface-2)] border-none rounded-full pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Recent Searches</h3>
              <div className="space-y-4">
                {['Ikeja City Mall', 'Maryland Mall', 'Oshodi Bus Terminal'].map((place, i) => (
                  <button key={i} onClick={() => handleDestinationSelect(place)} className="w-full flex items-center gap-4 text-left group">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-surface-3)] transition-colors">
                      <Clock size={18} className="text-[var(--color-text-secondary)]" />
                    </div>
                    <div className="flex-1 border-b border-[var(--color-border-subtle)] pb-4 group-hover:border-[var(--color-border)] transition-colors">
                      <p className="font-medium text-sm">{place}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Lagos, Nigeria</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DestinationAlarm
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        onSetAlarm={(data) => setActiveAlarm(data)}
      />
      <TransactionDetailSheet
        transaction={selectedTx}
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
