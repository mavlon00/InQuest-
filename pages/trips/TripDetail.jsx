import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Navigation, ShieldCheck, Download, AlertTriangle, Search, Star, Wallet, ChevronLeft } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useStore } from '../../store';

const startIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--color-text-secondary); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.2);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const endIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--color-primary); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--color-glow);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function TripDetail() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { theme } = useStore();

  // Mock trip data
  const trip = {
    id: tripId || 'TRP-987654321',
    date: 'Oct 24, 2026 • 2:30 PM',
    type: 'On-Spot',
    duration: '14 min',
    distance: '3.2 km',
    pickup: 'Allen Roundabout, Ikeja',
    destination: 'Ikeja City Mall',
    fare: '₦450',
    driver: {
      name: 'Emmanuel Okafor',
      rating: 5,
    },
    insured: true,
    route: [
      [6.5965, 3.3421],
      [6.6012, 3.3489],
      [6.6123, 3.3567]
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Trip Details</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Static Map */}
        <div className="h-48 rounded-3xl overflow-hidden border border-[var(--color-border-subtle)] shadow-sm relative pointer-events-none">
          <MapContainer center={trip.route[1]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
            <TileLayer
              url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
            />
            <Polyline positions={trip.route} color="var(--color-primary)" weight={4} opacity={0.8} />
            <Marker position={trip.route[0]} icon={startIcon} />
            <Marker position={trip.route[trip.route.length - 1]} icon={endIcon} />
          </MapContainer>
        </div>

        {/* Trip Info */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-[var(--color-surface-2)] text-xs font-medium text-[var(--color-text-secondary)]">
              {trip.type}
            </span>
            <span className="text-sm text-[var(--color-text-muted)] font-medium">{trip.date}</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
              <div className="w-0.5 h-8 bg-[var(--color-border)]" />
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{trip.pickup}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{trip.destination}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[var(--color-text-secondary)]" />
              <span className="text-sm font-medium">{trip.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-[var(--color-text-secondary)]" />
              <span className="text-sm font-medium">{trip.distance}</span>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] p-5 shadow-sm flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
              <span className="text-sm font-bold text-[var(--color-text-muted)]">{trip.driver.name.charAt(0)}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface-1)] flex items-center justify-center shadow-sm">
              <ShieldCheck size={10} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-base">{trip.driver.name}</h3>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={12} className={star <= trip.driver.rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--color-border)]'} />
              ))}
            </div>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden shadow-sm">
          <div className="p-5 space-y-3 border-b border-dashed border-[var(--color-border)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-secondary)]">Base Fare</span>
              <span className="font-medium">₦350</span>
            </div>
            {trip.insured && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                  Trip Insurance <ShieldCheck size={12} className="text-[var(--color-success)]" />
                </span>
                <span className="font-medium">₦100</span>
              </div>
            )}
          </div>
          <div className="p-5 flex justify-between items-center bg-[var(--color-surface-2)] border-l-4 border-[var(--color-primary)]">
            <span className="font-semibold">Total Paid</span>
            <span className="font-display font-semibold text-xl text-[var(--color-primary)]">{trip.fare}</span>
          </div>
          <div className="p-4 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1">
              <Wallet size={14} /> Wallet
            </div>
            <span className="font-mono">{trip.id}</span>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link to={`/trips/${trip.id}/receipt`} className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-2 hover:bg-[var(--color-surface-2)] transition-colors">
            <Download size={20} className="text-[var(--color-text-primary)]" />
            <span className="text-xs font-medium">Download Receipt</span>
          </Link>
          <Link to={`/trips/${trip.id}/dispute`} className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-2 hover:bg-[var(--color-surface-2)] transition-colors">
            <AlertTriangle size={20} className="text-[var(--color-text-primary)]" />
            <span className="text-xs font-medium">Report an Issue</span>
          </Link>
          <Link to={`/trips/${trip.id}/lost-item`} className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-2 hover:bg-[var(--color-surface-2)] transition-colors col-span-2">
            <Search size={20} className="text-[var(--color-text-primary)]" />
            <span className="text-xs font-medium">Lost an Item?</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

