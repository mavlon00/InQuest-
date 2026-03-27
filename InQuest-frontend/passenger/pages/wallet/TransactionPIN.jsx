import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle , ChevronLeft} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';

export default function TransactionPIN() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToastMessage } = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const { amount, recipient, type } = location.state || { amount: '0', recipient: 'Unknown', type: 'transfer' };

  useEffect(() => {
    if (pin.length === 4) {
      handleVerify();
    }
  }, [pin]);

  const handleVerify = () => {
    // Mock verification
    if (pin === '1234') {
      setSuccess(true);
      setToastMessage(`Successfully transferred ₦${amount} to ${recipient}`);
      setTimeout(() => {
        navigate('/wallet', { replace: true });
      }, 2000);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 1000);
    }
  };

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(prev => prev + key);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Enter PIN</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="pin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              <h2 className="text-2xl font-display font-semibold mb-2">Confirm Transaction</h2>
              <p className="text-[var(--color-text-secondary)] text-center mb-8">
                Enter your 4-digit PIN to authorize {type === 'transfer' ? `transfer of ₦${amount} to ${recipient}` : 'this transaction'}.
              </p>

              <div className="flex gap-4 mb-12">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                      error
                        ? 'border-[var(--color-error)] text-[var(--color-error)] bg-[var(--color-error)]/10'
                        : pin.length > index
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-1)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {pin.length > index ? '•' : ''}
                  </div>
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[var(--color-error)] text-sm font-medium mb-8"
                >
                  Incorrect PIN. Please try again.
                </motion.p>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-4 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="h-16 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-2xl font-medium hover:bg-[var(--color-surface-2)] active:scale-95 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <div />
                <button
                  onClick={() => handleKeyPress('0')}
                  className="h-16 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-2xl font-medium hover:bg-[var(--color-surface-2)] active:scale-95 transition-all"
                >
                  0
                </button>
                <button
                  onClick={() => handleKeyPress('backspace')}
                  className="h-16 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-xl font-medium hover:bg-[var(--color-surface-2)] active:scale-95 transition-all flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-24 h-24 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mb-6">
                <CheckCircle size={48} className="text-[var(--color-success)]" />
              </div>
              <h2 className="text-2xl font-display font-semibold mb-2">Transaction Successful</h2>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-xs">
                Your transfer of ₦{amount} to {recipient} was successful.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

