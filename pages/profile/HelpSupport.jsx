import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Phone, FileText, ChevronRight, ChevronDown, ShieldAlert , ChevronLeft} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HelpSupport() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: 'How do I cancel a ride?',
      answer: 'You can cancel a ride by tapping the "Cancel" button on the active trip screen. If you cancel within 2 minutes of the driver accepting, there is no fee. After 2 minutes, a small cancellation fee may apply to compensate the driver.'
    },
    {
      question: 'What is the cancellation fee?',
      answer: 'The standard cancellation fee is ₦200. This fee is charged if you cancel more than 2 minutes after a driver accepts your request, or if the driver cancels after waiting for you at the pickup location for over 5 minutes.'
    },
    {
      question: 'How do I change my payment method?',
      answer: 'Go to Profile > Payment Methods to add, remove, or select your default payment option. You can also switch your payment method before confirming a booking on the ride request screen.'
    },
    {
      question: 'I lost an item in the car',
      answer: 'If you left an item in a keke, go to Trips, select the specific ride, and tap "Report Issue" to contact the driver directly. If you cannot reach the driver, our support team is available 24/7 to assist you.'
    },
    {
      question: 'My driver was unprofessional',
      answer: 'We take professionalism very seriously. Please rate your driver 1 star after the trip and leave a comment detailing the issue. You can also report the specific trip from your Trip History for our safety team to investigate.'
    },
    {
      question: 'How do Green Rewards work?',
      answer: 'You earn Green Points for every ride you take. These points can be redeemed for ride discounts or transferred to your wallet . Check the Green Rewards section in your profile to see your balance and available offers.'
    },
    {
      question: 'How do I manage my subscriptions?',
      answer: 'Navigate to the "Recurring" booking tab or check your Profile to view active subscriptions. From there, you can pause, modify, or cancel your scheduled rides at any time without penalty.'
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col pb-safe">
      <header className="px-6 py-4 flex items-center gap-4 bg-[var(--color-surface-1)] sticky top-0 z-20 border-b border-[var(--color-border-subtle)]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-display font-semibold">Help & Support</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/profile/help/chat')}
            className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-3 hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
              <MessageCircle size={24} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Live Chat</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Typically replies in 2 mins</p>
            </div>
          </button>
          <button
            className="bg-[var(--color-surface-1)] p-4 rounded-2xl border border-[var(--color-border-subtle)] flex flex-col items-center text-center gap-3 hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
              <Phone size={24} className="text-[var(--color-text-secondary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Call Us</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Available 24/7</p>
            </div>
          </button>
        </div>

        <div className="bg-[var(--color-error)]/10 p-4 rounded-2xl flex items-center justify-between gap-4 border border-[var(--color-error)]/20 cursor-pointer hover:bg-[var(--color-error)]/20 transition-colors">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} className="text-[var(--color-error)] shrink-0" />
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-error)] mb-1">Emergency Assistance</h3>
              <p className="text-xs text-[var(--color-text-primary)]">Report a safety incident immediately</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[var(--color-error)]" />
        </div>

        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Frequently Asked Questions</h2>
          <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden">
            <div className="divide-y divide-[var(--color-border-subtle)]">
              {faqs.map((faq, i) => (
                <div key={i} className="w-full">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full p-4 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] transition-colors text-left"
                  >
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-[var(--color-text-muted)] shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Legal</h2>
          <div className="bg-[var(--color-surface-1)] rounded-2xl border border-[var(--color-border-subtle)] overflow-hidden">
            <div className="divide-y divide-[var(--color-border-subtle)]">
              <button className="w-full p-4 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] transition-colors text-left">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-[var(--color-text-secondary)]" />
                  <span className="font-medium text-sm text-[var(--color-text-primary)]">Terms of Service</span>
                </div>
                <ChevronRight size={20} className="text-[var(--color-text-muted)] shrink-0" />
              </button>
              <button className="w-full p-4 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-2)] transition-colors text-left">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-[var(--color-text-secondary)]" />
                  <span className="font-medium text-sm text-[var(--color-text-primary)]">Privacy Policy</span>
                </div>
                <ChevronRight size={20} className="text-[var(--color-text-muted)] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

