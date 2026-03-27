import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Send, CheckCircle } from 'lucide-react';
import { useStore } from '../store';

export default function ChatOverlay() {
  const { isChatOverlayOpen, setChatOverlayOpen, setCallOverlayOpen, booking } = useStore();
  const [messages, setMessages] = useState([
    { id: 1, text: 'I am on my way.', sender: 'driver', time: '10:42 AM' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isChatOverlayOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOverlayOpen]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, sender: 'passenger', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setInput('');

      // Simulate driver response
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now(), text: 'Okay, I see you.', sender: 'driver', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }, 2000);
    }
  };

  const handleQuickReply = (text) => {
    setInput(text);
    handleSend();
  };

  if (!isChatOverlayOpen || !booking.driver) return null;

  return (
    <AnimatePresence>
      {isChatOverlayOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-bg)] flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-1)]">
            <div className="flex items-center gap-3">
              <button onClick={() => setChatOverlayOpen(false)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                  {booking.driver.photo ? (
                    <img src={booking.driver.photo} alt="Driver" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-[var(--color-text-muted)]">{booking.driver.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-base">{booking.driver.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">Active Now</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setChatOverlayOpen(false); setCallOverlayOpen(true); }}
              className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)] transition-colors"
            >
              <Phone size={20} />
            </button>
          </div>

          {/* Mini Map Thumbnail */}
          <div className="h-24 bg-[var(--color-surface-2)] border-b border-[var(--color-border-subtle)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--color-primary) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-1)]/80 backdrop-blur-sm border border-[var(--color-border-subtle)] text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                Driver is {booking.eta} min away
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="text-center text-xs text-[var(--color-text-muted)] font-medium mb-6">Today</div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'passenger' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.sender === 'passenger' ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-tr-sm' : 'bg-[var(--color-surface-2)] text-[var(--color-text-primary)] rounded-tl-sm'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === 'passenger' ? 'text-[var(--color-primary-text)]/70' : 'text-[var(--color-text-muted)]'}`}>
                    <span className="text-[10px]">{msg.time}</span>
                    {msg.sender === 'passenger' && <CheckCircle size={10} className="text-[var(--color-primary-text)]" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] pb-safe">
            {/* Quick Replies */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {['I AM ON MY WAY', 'I AM OUTSIDE', 'PLEASE WAIT 2 MINUTES', 'I CANNOT FIND YOU', 'ONE MINUTE', 'WHICH SIDE ARE YOU', 'I DON SEE YOU'].map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="px-4 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] whitespace-nowrap text-xs font-medium hover:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-secondary)]"
                >
                  {reply}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden focus-within:border-[var(--color-primary)] focus-within:ring-1 focus-within:ring-[var(--color-primary)] transition-shadow">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent p-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none max-h-32"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-text)] shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:bg-[var(--color-primary)]/90 transition-all active:scale-[0.98] shrink-0 mb-1"
              >
                <Send size={20} className="ml-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

