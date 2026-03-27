import React, { useEffect } from 'react';
import { useDriverStore } from '../driverStore';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const driverMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: var(--color-primary); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px var(--color-glow);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 15, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function DriverMap() {
  const currentLocation = useDriverStore(state => state.currentLocation);
  
  // Fallback to Lagos center if GPS is unavailable
  const centerPos = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : [6.5244, 3.3792];

  return (
    <div className="w-full h-full bg-[#0F0F0F] relative overflow-hidden">
      <MapContainer 
        center={centerPos} 
        zoom={15} 
        style={{ height: '100%', width: '100%', zIndex: 1 }} 
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {currentLocation && (
          <Marker position={centerPos} icon={driverMarkerIcon} />
        )}
        <MapController center={centerPos} />
      </MapContainer>
      
      {/* Active Area Label Overlay */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-[var(--color-primary)]/30 z-[10] shadow-lg pointer-events-none">
        <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest whitespace-nowrap">
          {currentLocation ? 'Live Tracking Active' : 'Waiting for GPS...'}
        </p>
      </div>
    </div>
  );
}
