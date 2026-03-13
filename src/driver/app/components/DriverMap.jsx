import React from 'react';

/**
 * Premium Driver Map Component
 * Implements a high-end dark-themed map with a subtle primary grid
 * and a visible "Operating Radius" circle when selected.
 */
export default function DriverMap() {
  return (
    <div className="w-full h-full bg-[#0F0F0F] relative overflow-hidden">
      
      {/* ── GRID PATTERN DECOR ── */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 0)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* ── MOCK MAP FEATURES ── */}
      
      {/* Rivers/Roads (Abstract) */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 800" preserveAspectRatio="none">
        <path d="M-50,200 Q150,150 200,400 T500,600" fill="none" stroke="var(--color-primary)" strokeWidth="4" />
        <path d="M-20,600 Q200,550 400,700" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
        <path d="M300,-50 Q250,300 350,850" fill="none" stroke="var(--color-primary)" strokeWidth="1" />
      </svg>

      {/* Center Marker (Driver Location) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        {/* Outer Glow Ring */}
        <div className="absolute inset-[-20px] rounded-full bg-[var(--color-primary)]/10 animate-ping" style={{ animationDuration: '3s' }} />
        
        {/* Pulsing Radius (The "Operating Area" visual) */}
        <div className="absolute inset-[-80px] rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 animate-[radius-pulse_4s_infinite]" />

        {/* The Marker */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full blur-[10px] opacity-40 shadow-[var(--shadow-glow)]" />
          <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full border-4 border-white z-10 shadow-lg" />
          <div className="absolute -bottom-1 w-2 h-2 bg-white rotate-45" />
        </div>
      </div>

      {/* ── FLOATING UI CUES (Mock) ── */}
      
      {/* Active Area Label */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 z-10">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">Current Operating Zone</p>
      </div>

      {/* Mock Vehicle Markers (Nearby Drivers) */}
      <div className="absolute top-[20%] left-[20%] opacity-40 scale-75">
        <div className="w-3 h-3 bg-white/40 rounded-full" />
      </div>
      <div className="absolute bottom-[30%] right-[15%] opacity-30 scale-50">
        <div className="w-3 h-3 bg-white/40 rounded-full animate-bounce" />
      </div>

      <style>{`
        @keyframes radius-pulse {
          0% { transform: scale(0.95); opacity: 0.1; }
          50% { transform: scale(1.05); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
