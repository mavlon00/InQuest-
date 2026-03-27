import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, ShieldCheck, AlertCircle } from 'lucide-react';
import useOnSpotStore from '../store/onSpotStore';

export default function SOSSheet({ isOpen, onClose }) {
  const { toggleSOS, sosActive, activeBooking } = useOnSpotStore();
  const [showConfirmation, setShowConfirmation] = useState(true);

  if (!isOpen) return null;

  const handleTriggerSOS = async () => {
    // In a real app, POST /api/v1/sos/trigger would be called here
    setShowConfirmation(false);
    toggleSOS(true);
  };

  const handleCancelSOS = () => {
    toggleSOS(false);
    onClose();
    setShowConfirmation(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {showConfirmation && !sosActive ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-xs bg-[var(--color-surface-1)] rounded-[40px] p-8 border-t-4 border-[var(--color-error)] shadow-2xl relative z-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="text-red-500" size={40} />
            </div>
            
            <h2 className="text-2xl font-display font-bold mb-3">Send SOS Alert?</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-10 px-2">
              This will alert the Inquest emergency team and notify your emergency contacts with your live location.
            </p>

            <div className="space-y-3">
              <button 
                onClick={handleTriggerSOS}
                className="w-full py-5 bg-red-600 text-white font-bold rounded-3xl shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 transition-transform"
              >
                Send SOS
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-[var(--color-text-muted)] font-bold"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center pointer-events-none"
          >
            {/* Pulsing Red Background Effect */}
            <motion.div 
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-red-600"
            />

            <div className="relative z-10 space-y-8 flex flex-col items-center">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-32 h-32 bg-white text-red-600 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.4)]"
              >
                <ShieldAlert size={64} />
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-5xl font-display font-black text-white tracking-tight uppercase">SOS SENT</h1>
                <p className="text-xl text-white/80 font-medium leading-relaxed max-w-xs">
                  The Inquest team has been alerted. Stay calm. Help is on the way.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white font-bold tracking-widest uppercase">Live location sharing active</span>
              </div>

              <div className="pt-12 pointer-events-auto">
                <button 
                  onClick={() => {
                    if (window.confirm('Are you safe?')) {
                      handleCancelSOS();
                    }
                  }}
                  className="px-12 py-5 bg-white text-red-600 font-bold rounded-full text-lg shadow-2xl active:scale-95 transition-transform"
                >
                  I am safe — Cancel SOS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
