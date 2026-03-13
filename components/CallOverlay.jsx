import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../store';

export default function CallOverlay() {
  const { isCallOverlayOpen, setCallOverlayOpen, booking } = useStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (isCallOverlayOpen) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCallOverlayOpen]);

  const handleEndCall = () => {
    setCallOverlayOpen(false);
    // Show toast "Call ended"
    console.log('Call ended');
  };

  if (!isCallOverlayOpen || !booking.driver) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isCallOverlayOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-bg)]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
            <div className="w-32 h-32 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border-2 border-[var(--color-primary)] mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)] opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              {booking.driver.photo ? (
                <img src={booking.driver.photo} alt="Driver" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-[var(--color-text-muted)]">{booking.driver.name.charAt(0)}</span>
              )}
            </div>

            <h2 className="text-3xl font-display font-semibold mb-2">{booking.driver.name}</h2>
            <p className="text-[var(--color-text-secondary)] text-lg mb-12">
              {timer > 0 ? formatTime(timer) : 'Connecting...'}
            </p>

            <div className="flex items-center justify-center gap-8 mb-16">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-[var(--color-surface-3)] text-[var(--color-text-primary)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'}`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isSpeaker ? 'bg-[var(--color-surface-3)] text-[var(--color-text-primary)]' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]'}`}
              >
                {isSpeaker ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
            </div>

            <button
              onClick={handleEndCall}
              className="w-20 h-20 rounded-full bg-[var(--color-error)] flex items-center justify-center shadow-[0_4px_14px_0_rgba(239,68,68,0.4)] hover:bg-red-600 transition-colors active:scale-95"
            >
              <PhoneOff size={32} className="text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

