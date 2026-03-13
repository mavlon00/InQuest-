import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useStore } from '../store';

export default function SOSButton() {
  const booking = useStore((state) => state.booking);

  const { updateBooking } = useStore();

  const handleSOS = () => {
    updateBooking({ triggeringSOS: true });
  };

  if (booking.status !== 'IN_PROGRESS') return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      onClick={handleSOS}
      className="fixed bottom-[92px] right-4 z-[var(--z-sos)] w-14 h-14 bg-[var(--color-error)] rounded-full flex items-center justify-center shadow-[0_4px_14px_0_rgba(239,68,68,0.4)] hover:bg-red-600 transition-colors active:scale-95"
    >
      <div className="absolute inset-0 rounded-full border-2 border-[var(--color-error)] opacity-50 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
      <ShieldAlert size={24} className="text-white" />
    </motion.button>
  );
}

