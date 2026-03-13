import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, MoreVertical , ChevronLeft} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupportChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi there! How can we help you today?', sender: 'support', time: '10:00 AM' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setInput('');

    // Mock support reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for reaching out. An agent will be with you shortly.',
        sender: 'support',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center justify-between bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <span className="text-[var(--color-primary)] font-bold text-sm">INQ</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold mb-0.5">Inquest Support</h1>
              <p className="text-[10px] text-[var(--color-success)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" /> Online
              </p>
            </div>
          </div>
        </div>
        <button className="p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 flex flex-col">
        <div className="text-center mb-6">
          <span className="bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] text-xs px-3 py-1 rounded-full font-medium">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <div
              className={`p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-br-sm'
                  : 'bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-bl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] mt-1 px-1">{msg.time}</span>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)]">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <button type="button" className="p-3 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors shrink-0">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-full px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-[var(--color-primary)] text-[var(--color-primary-text)] rounded-full transition-all disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 shrink-0"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}

