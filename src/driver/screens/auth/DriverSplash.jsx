import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DriverSplash() {
  const navigate = useNavigate();
  const [showLogo, setShowLogo] = useState(false);
  const [exit,     setExit]     = useState(false);

  useEffect(() => {
    // Fade in sequence
    const timer1 = setTimeout(() => setShowLogo(true), 200);
    
    // Check auth and transition
    const timer2 = setTimeout(() => {
      setExit(true);
      setTimeout(() => {
        const token = localStorage.getItem('driver_token');
        if (token) {
          navigate('/home');
        } else {
          navigate('/login');
        }
      }, 800); // Wait for exit animation
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [navigate]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg)] overflow-hidden transition-all duration-1000 ${exit ? 'scale-110 opacity-0 blur-lg' : 'scale-100 opacity-100 blur-0'}`}>
      
      {/* Subtle Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[var(--color-primary)]/5 rounded-full blur-[120px] animate-pulse" />

      <div className={`flex flex-col items-center z-10 transition-all duration-1000 ease-out ${showLogo ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Animated Icon/Logo Placeholder */}
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-[var(--color-primary)] rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(127,255,0,0.3)] animate-[float_4s_ease-in-out_infinite]">
            <div className="w-10 h-10 bg-[var(--color-bg)] rounded-lg -rotate-45 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-[var(--color-primary)]">IQ</span>
            </div>
          </div>
          {/* Ring elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-[var(--color-primary)]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        <h1 className="text-[44px] font-display font-bold text-white tracking-tighter leading-none mb-3">
          IN<span className="text-[var(--color-primary)]">QUEST</span>
        </h1>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-8 bg-[var(--color-surface-3)]" />
          <p className="text-[var(--color-text-secondary)] text-sm font-medium tracking-[0.2em] uppercase">
            Driver Partner
          </p>
          <div className="h-px w-8 bg-[var(--color-surface-3)]" />
        </div>

        <p className="text-[var(--color-text-muted)] text-sm italic mt-8 animate-pulse">
          Finally, a Ride you can trust
        </p>
      </div>

      {/* Loading Bar at Bottom */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-primary)] rounded-full animate-[loading_2.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: rotate(45deg) translateY(0px); }
          50% { transform: rotate(45deg) translateY(-10px); }
        }
        @keyframes loading {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
