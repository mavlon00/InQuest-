import React from 'react';
import { useMap } from 'react-leaflet';
import { Plus, Minus, Navigation, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MapControls({ userLocation, onAlarmClick, isAlarmActive }) {
    const map = useMap();

    const handleLocate = () => {
        if (userLocation) {
            map.setView(userLocation, 16, { animate: true, duration: 1 });
        }
    };

    const handleZoomIn = () => {
        map.zoomIn();
    };

    const handleZoomOut = () => {
        map.zoomOut();
    };

    return (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-3">
            <div className="bg-[var(--color-surface-1)]/90 backdrop-blur-md rounded-2xl border border-[var(--color-border-subtle)] shadow-lg overflow-hidden flex flex-col">
                <button
                    onClick={handleZoomIn}
                    className="p-3 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors border-b border-[var(--color-border-subtle)]"
                    title="Zoom In"
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-3 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                    title="Zoom Out"
                >
                    <Minus size={20} />
                </button>
            </div>

            <button
                onClick={handleLocate}
                className="w-11 h-11 bg-[var(--color-surface-1)]/90 backdrop-blur-md rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
                title="Locate Me"
            >
                <Navigation size={20} className={userLocation ? 'text-[var(--color-primary)]' : ''} />
            </button>

            <button
                onClick={onAlarmClick}
                className={`w-11 h-11 bg-[var(--color-surface-1)]/90 backdrop-blur-md rounded-2xl border border-[var(--color-border-subtle)] shadow-lg flex items-center justify-center transition-all ${isAlarmActive ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)] animate-pulse' : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)]'
                    }`}
                title="Destination Alarm"
            >
                <Bell size={20} className={isAlarmActive ? 'fill-current' : ''} />
            </button>
        </div>
    );
}
