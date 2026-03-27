import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';
import useOnSpotStore from '../store/onSpotStore';

const QUICK_REPLIES = [
  'I am on my way',
  'I am here',
  'Can you go faster please',
  'Which road are you taking',
  'I will be 2 minutes'
];

export default function TripChatOverlay() {
  const { chatOpen, toggleChat, activeBooking } = useOnSpotStore();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chatOpen) return null;

  const handleSendMessage = (text) => {
    const msg = text || inputValue;
    if (!msg.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: msg,
      sender: 'passenger',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // Simulate driver reply
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: "Okay, I've seen it.",
        sender: 'driver',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1500] pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleChat(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
        />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute bottom-0 inset-x-0 h-[65%] bg-[var(--color-surface-1)] rounded-t-[40px] border-t border-white/5 shadow-3xl pointer-events-auto flex flex-col"
        >
          {/* Header */}
          <header className="px-8 py-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] overflow-hidden flex items-center justify-center">
                {activeBooking?.driverPhoto ? (
                  <img src={activeBooking.driverPhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gray-500" size={20} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-display font-bold">{activeBooking?.driverName || 'Driver'}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                  <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => toggleChat(false)}
              className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </header>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-8 space-y-6 pb-4"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                  <Send size={24} />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
                <p className="text-xs mt-1">Start chatting with your driver</p>
              </div>
            )}
            
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex flex-col ${msg.sender === 'passenger' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[80%] px-5 py-3.5 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm ${
                  msg.sender === 'passenger' 
                  ? 'bg-[var(--color-primary)] text-black rounded-tr-none' 
                  : 'bg-[var(--color-surface-2)] text-white rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] font-bold text-white/30 mt-1 uppercase tracking-widest px-2">
                  {msg.timestamp}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Footer / Input */}
          <footer className="px-8 pb-10 pt-4 space-y-4 shrink-0 bg-[var(--color-surface-1)]">
            {/* Quick Replies */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
              {QUICK_REPLIES.map((text) => (
                <button
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="whitespace-nowrap px-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
                >
                  {text}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Message driver..."
                className="flex-1 bg-[var(--color-surface-2)] border-none px-6 py-4 rounded-[24px] text-sm font-bold focus:ring-2 focus:ring-[var(--color-primary)]/30 transition-all outline-none"
              />
              <button 
                onClick={() => handleSendMessage()}
                className="w-14 h-14 bg-[var(--color-primary)] text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                <Send size={20} fill="currentColor" />
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
