import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navigation, Clock, Wallet, Bell, User } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const path = location.pathname;

    return (
        <nav className="fixed bottom-0 inset-x-0 bg-[var(--color-surface-1)] border-t border-[var(--color-border)] pb-safe z-30">
            <div className="flex items-center justify-around h-16 px-2">
                <Link to="/home" className={`flex flex-col items-center gap-1 p-2 transition-colors ${path === '/home' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                    <Navigation size={24} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>
                <Link to="/trips" className={`flex flex-col items-center gap-1 p-2 transition-colors ${path.startsWith('/trips') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                    <Clock size={24} />
                    <span className="text-[10px] font-medium">Trips</span>
                </Link>
                <Link to="/wallet" className={`flex flex-col items-center gap-1 p-2 transition-colors ${path.startsWith('/wallet') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                    <Wallet size={24} />
                    <span className="text-[10px] font-medium">Wallet</span>
                </Link>
                <Link to="/notifications" className={`flex flex-col items-center gap-1 p-2 transition-colors relative ${path.startsWith('/notifications') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                    <Bell size={24} />
                    <span className="absolute top-2 right-3 w-2 h-2 bg-[var(--color-error)] rounded-full border border-[var(--color-surface-1)]" />
                    <span className="text-[10px] font-medium">Alerts</span>
                </Link>
                <Link to="/profile" className={`flex flex-col items-center gap-1 p-2 transition-colors ${path.startsWith('/profile') ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
                    <User size={24} />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </div>
        </nav>
    );
}
