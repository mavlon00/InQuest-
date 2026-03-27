import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, Phone, X, ChevronLeft } from 'lucide-react';
import { useStore } from '../../store';

export default function SOSScreen() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { updateBooking, user } = useStore();
  const [step, setStep] = useState('CONFIRM');

  const handleSendSOS = () => {
    updateBooking({ sosActive: true });
    setStep('ACTIVE');
  };

  const handleCancelSOS = () => {
    setStep('CANCEL_CONFIRM');
  };

  const confirmCancelSOS = () => {
    updateBooking({ sosActive: false });
    navigate(`/tracking/${rideId}`, { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'CONFIRM' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--color-surface-1)] p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-[var(--color-border-subtle)]"
          >
            <div className="w-16 h-16 bg-[var(--color-error)]/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <ShieldAlert size={32} className="text-[var(--color-error)]" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-center mb-4">Trigger SOS Emergency Alert?</h2>
            <p className="text-[var(--color-text-secondary)] text-center mb-8">
              This will immediately notify your emergency contact and the Inquest safety team.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleSendSOS}
                className="w-full bg-[var(--color-error)] text-white py-4 rounded-2xl font-semibold text-lg shadow-[0_4px_14px_0_rgba(239,68,68,0.4)] hover:bg-red-600 transition-colors active:scale-[0.98]"
              >
                Yes, Send SOS
              </button>
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
                <ChevronLeft size={24} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'ACTIVE' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-error)] flex flex-col items-center justify-center p-6 text-white"
          >
            <div className="relative w-32 h-32 flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute inset-4 rounded-full border-4 border-white opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
              <ShieldAlert size={64} className="text-white relative z-10" />
            </div>

            <h1 className="text-4xl font-display font-semibold mb-2 text-center">SOS Sent</h1>
            <p className="text-xl opacity-90 mb-12 text-center">Help is on the way.</p>

            <div className="w-full max-w-sm space-y-4 mb-12">
              {[
                `Emergency contact ${user?.emergencyContact?.name || 'notified'}`,
                'Inquest safety team has been alerted.',
                'Your live location is being shared.'
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.5 }}
                  className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl"
                >
                  <CheckCircle size={20} className="text-white shrink-0" />
                  <span className="font-medium text-sm">{text}</span>
                </motion.div>
              ))}
            </div>

            <div className="w-full max-w-sm space-y-3 mt-auto pb-safe">
              <button className="w-full bg-white text-[var(--color-error)] py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-gray-50 transition-colors active:scale-[0.98] flex items-center justify-center gap-2">
                <Phone size={20} /> Call Emergency Contact
              </button>
              <button
                onClick={handleCancelSOS}
                className="w-full bg-transparent border-2 border-white/30 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-colors active:scale-[0.98]"
              >
                I'm Safe — Cancel Alert
              </button>
            </div>
          </motion.div>
        )}

        {step === 'CANCEL_CONFIRM' && (
          <motion.div
            key="cancel_confirm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--color-surface-1)] p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-[var(--color-border-subtle)]"
          >
            <div className="w-16 h-16 bg-[var(--color-warning)]/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <X size={32} className="text-[var(--color-warning)]" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-center mb-4">Are you sure you are safe?</h2>
            <p className="text-[var(--color-text-secondary)] text-center mb-8">
              This will cancel the SOS alert.
            </p>
            <div className="space-y-3">
              <button
                onClick={confirmCancelSOS}
                className="w-full bg-[var(--color-error)] text-white py-4 rounded-2xl font-semibold text-lg shadow-[0_4px_14px_0_rgba(239,68,68,0.4)] hover:bg-red-600 transition-colors active:scale-[0.98]"
              >
                Cancel Alert
              </button>
              <button
                onClick={() => setStep('ACTIVE')}
                className="w-full bg-[var(--color-surface-2)] text-[var(--color-text-primary)] py-4 rounded-2xl font-semibold text-lg hover:bg-[var(--color-surface-3)] transition-colors active:scale-[0.98]"
              >
                I Still Need Help
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

