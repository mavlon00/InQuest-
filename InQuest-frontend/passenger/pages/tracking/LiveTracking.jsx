import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Share2, AlertTriangle, Navigation, ZoomIn, ZoomOut, ArrowLeft, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import L from 'leaflet';

const customMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--color-primary); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--color-glow);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const kekeIcon = new L.DivIcon({
  className: 'keke-icon',
  html: `
    <div style="position: relative; width: 32px; height: 32px; background-color: var(--color-surface-2); border-radius: 8px; border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
}

export default function LiveTracking() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { theme, booking, updateBooking } = useStore();
  const [location, setLocation] = useState([6.5244, 3.3792]);
  const [driverLocation, setDriverLocation] = useState([6.5244, 3.3792]);
  const [zoom, setZoom] = useState(16);
  const [showTraffic, setShowTraffic] = useState(false);

  useEffect(() => {
    if (booking.status !== 'IN_PROGRESS') {
      updateBooking({ status: 'IN_PROGRESS', tripId: rideId || 'TRP-123' });
    }

    // Simulate driver movement
    const interval = setInterval(() => {
      setDriverLocation(prev => [prev[0] + 0.0001, prev[1] + 0.0001]);
    }, 4000);

    // Simulate traffic alert
    const trafficTimer = setTimeout(() => {
      setShowTraffic(true);
      setTimeout(() => setShowTraffic(false), 5000);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(trafficTimer);
    };
  }, [rideId, booking.status, updateBooking]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track my Inquest ride',
          text: 'Follow my live trip on Inquest.',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="h-screen w-full bg-[var(--color-bg)] relative overflow-hidden">
      <MapContainer center={driverLocation} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer
          url={theme === 'dark' ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
        />
        {location && typeof location[0] === 'number' && (
          <Marker position={location} icon={customMarkerIcon} />
        )}
        {driverLocation && typeof driverLocation[0] === 'number' && (
          <Marker position={driverLocation} icon={kekeIcon} />
        )}
        {driverLocation && location && (
          <Polyline positions={[driverLocation, [location[0] + 0.01, location[1] + 0.01]]} color="var(--color-primary)" weight={4} opacity={0.8} />
        )}
        <MapController center={driverLocation} zoom={zoom} />
      </MapContainer>

      {/* Traffic Banner */}
      <AnimatePresence>
        {showTraffic && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="absolute top-safe pt-4 inset-x-4 z-[110]"
          >
            <div className="bg-[var(--color-warning)] text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3">
              <AlertTriangle size={20} />
              <span className="font-medium text-sm">Heavy traffic ahead. Route updated.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Controls */}
      <div className="absolute top-safe pt-4 left-4 z-[100]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="absolute top-safe pt-4 right-4 z-[100] flex flex-col gap-2">
        <button onClick={() => setZoom(z => Math.min(z + 1, 18))} className="w-12 h-12 bg-[var(--color-surface-1)] rounded-full flex items-center justify-center shadow-md border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
          <ZoomIn size={20} />
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 1, 10))} className="w-12 h-12 bg-[var(--color-surface-1)] rounded-full flex items-center justify-center shadow-md border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
          <ZoomOut size={20} />
        </button>
        <button onClick={() => setZoom(16)} className="w-12 h-12 bg-[var(--color-surface-1)] rounded-full flex items-center justify-center shadow-md border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
          <Navigation size={20} />
        </button>
      </div>

      {/* Share Button */}
      <div className="absolute bottom-28 left-4 z-[100]">
        <button onClick={handleShare} className="w-12 h-12 bg-[var(--color-surface-1)] rounded-full flex items-center justify-center shadow-md border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}

