import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Wallet, Banknote, CreditCard, Shield,
  AlertCircle, Tag, StickyNote, Edit3, MapPin, Clock,
  X, CheckCircle, Zap
} from 'lucide-react';
import { useBookingStore } from '../../store/bookingStore';
import { useStore } from '../../store';
import useSubscriptionStore from '../../store/subscriptionStore';
import { format } from 'date-fns';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-3)]'}`}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

const PAYMENT_OPTIONS = [
  { id: 'WALLET', label: 'Wallet', icon: Wallet },
  { id: 'CASH', label: 'Cash', icon: Banknote },
  { id: 'CARD', label: 'Card', icon: CreditCard },
];

export default function PersonalBookingOptions() {
  const navigate = useNavigate();
  const {
    pickup, destination, stops, fareEstimate, insurance, isScheduled, scheduledTime, guest,
    paymentMethod, promoCode, promoDiscount, driverNotes,
    setPaymentMethod, setInsurance, setPromoCode, setPromoDiscount, setDriverNotes,
    getTotalFare,
  } = useBookingStore();

  const { walletBalance, paymentMethods } = useStore();
  const { subscription, isSubscriptionUsable, fetchActiveSubscription } = useSubscriptionStore();

  const [selectedPayment, setSelectedPayment] = useState(paymentMethod || 'CASH');
  const [insuranceOn, setInsuranceOn] = useState(insurance);
  const [notes, setNotes] = useState(driverNotes || '');
  const [promoInput, setPromoInput] = useState(promoCode || '');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoStatus, setPromoStatus] = useState(null); // null | 'valid' | 'invalid'
  const [promoDiscountAmt, setPromoDiscountAmt] = useState(promoDiscount || 0);

  const estimate = fareEstimate;
  const baseFare = estimate?.baseFare || 0;
  const deadMileage = estimate?.deadMileageFee || 0;
  const stopFees = estimate?.stopFees || 0;
  const insuranceFee = insuranceOn ? 100 : 0;
  
  // Calculate coverage
  const isSubActive = selectedPayment === 'SUBSCRIPTION';
  const subCoverageKm = isSubActive ? Math.min(subscription.remainingKm, estimate?.distanceKm || 0) : 0;
  const subscriptionCoveredValue = subCoverageKm * 120; // 120 NGN per KM covered
  
  const totalfare = baseFare + deadMileage + stopFees + insuranceFee - promoDiscountAmt - subscriptionCoveredValue;

  const walletInsufficient = (selectedPayment === 'WALLET' || selectedPayment === 'SUBSCRIPTION') && walletBalance < totalfare;

  // Redirect guard
  useEffect(() => {
    fetchActiveSubscription();
    if (!pickup || !destination || !estimate) {
      navigate('/book/personal', { replace: true });
    }
  }, []);

  // Auto-select payment method
  useEffect(() => {
    if (!paymentMethod) {
      if (isSubscriptionUsable()) {
        setSelectedPayment('SUBSCRIPTION');
      } else {
        setSelectedPayment(walletBalance >= totalfare ? 'WALLET' : 'CASH');
      }
    }
  }, [subscription]);

  const handlePaymentSelect = (id) => {
    setSelectedPayment(id);
    setPaymentMethod(id);
  };

  const handleInsuranceToggle = (val) => {
    setInsuranceOn(val);
    setInsurance(val);
  };

  const handlePromoSubmit = async () => {
    if (!promoInput.trim()) return;
    // Mock promo validation
    await new Promise((r) => setTimeout(r, 500));
    if (promoInput.toUpperCase() === 'SAVE100') {
      setPromoStatus('valid');
      setPromoDiscount(100);
      setPromoDiscountAmt(100);
    } else {
      setPromoStatus('invalid');
    }
  };

  const canConfirm = selectedPayment && !(walletInsufficient);

  const handleConfirm = () => {
    setPaymentMethod(selectedPayment);
    setInsurance(insuranceOn);
    setDriverNotes(notes);
    navigate('/book/personal/confirm');
  };

  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 flex-shrink-0 bg-[var(--color-surface-1)] border-b border-[var(--color-border-subtle)]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[var(--color-surface-2)] flex items-center justify-center"
        >
          <ChevronLeft size={22} className="text-[var(--color-text-primary)]" />
        </button>
        <h1 className="font-display text-xl font-semibold">Booking options</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-32">
        {/* Trip summary card */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)]">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-1.5 flex-shrink-0" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {pickup?.address}
                </p>
              </div>
              {stops.filter(Boolean).map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-1 pl-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{s.address}</p>
                </div>
              ))}
              <div className="flex items-start gap-2">
                <MapPin size={10} className="text-[var(--color-error)] mt-1.5 flex-shrink-0" />
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {destination?.address}
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/book/personal')} className="flex-shrink-0">
              <Edit3 size={16} className="text-[var(--color-primary)]" />
            </button>
          </div>

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
            <span className="text-xs text-[var(--color-text-muted)]">
              {estimate?.distanceKm} km • {estimate?.durationMins} min
            </span>
            {isScheduled && scheduledTime && (
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                <Clock size={12} />
                {format(new Date(scheduledTime), 'EEE d MMM, HH:mm')}
              </span>
            )}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            How would you like to pay?
          </p>
          <div className="flex flex-wrap gap-3">
            {isSubscriptionUsable() && (
               <button
                  onClick={() => handlePaymentSelect('SUBSCRIPTION')}
                  className={`flex-1 min-w-[100px] flex flex-col items-center gap-1.5 py-3.5 rounded-xl border transition-all ${
                    selectedPayment === 'SUBSCRIPTION'
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-1)]'
                  }`}
                >
                  <Zap
                    size={20}
                    className={selectedPayment === 'SUBSCRIPTION' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
                  />
                  <span className={`text-xs font-semibold ${selectedPayment === 'SUBSCRIPTION' ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                    Subscription
                  </span>
                  <span className={`text-[10px] ${subscription?.remainingKm < estimate?.distanceKm ? 'text-amber-500' : 'text-[var(--color-text-muted)]'}`}>
                    {subscription?.remainingKm.toFixed(1)}km left
                  </span>
               </button>
            )}
            {PAYMENT_OPTIONS.map(({ id, label, icon: Icon }) => {
              const active = selectedPayment === id;
              return (
                <button
                  key={id}
                  onClick={() => handlePaymentSelect(id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-xl border transition-all ${
                    active
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-1)]'
                  }`}
                >
                  <Icon
                    size={20}
                    className={active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
                  />
                  <span className={`text-xs font-semibold ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {label}
                  </span>
                  {id === 'WALLET' && (
                    <span className={`text-[10px] ${walletInsufficient && id === 'WALLET' ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'}`}>
                      NGN {walletBalance?.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {walletInsufficient && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2 p-3 bg-[var(--color-error)]/10 rounded-xl border border-[var(--color-error)]/20"
            >
              <AlertCircle size={14} className="text-[var(--color-error)] flex-shrink-0" />
              <p className="text-xs text-[var(--color-error)]">
                Insufficient balance. Top up or choose cash.
              </p>
            </motion.div>
          )}
        </div>

        {/* Insurance */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-[var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold">Trip Insurance</p>
                <p className="text-xs text-[var(--color-text-muted)]">Coverage • NGN 100</p>
              </div>
            </div>
            <Toggle value={insuranceOn} onChange={handleInsuranceToggle} />
          </div>
        </div>

        {/* Driver notes */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2 mb-3">
            <StickyNote size={16} className="text-[var(--color-primary)]" />
            <p className="text-sm font-semibold">Notes for driver</p>
            <span className="ml-auto text-xs text-[var(--color-text-muted)]">{notes.length}/100</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 100))}
            placeholder="e.g. Please call when you arrive"
            rows={2}
            className="w-full bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none resize-none border border-transparent focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Promo code */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)]">
          {!showPromoInput ? (
            <button
              onClick={() => setShowPromoInput(true)}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: 'var(--color-primary)' }}
            >
              <Tag size={16} />
              Have a promo code?
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus(null); }}
                  placeholder="Enter promo code"
                  className="flex-1 bg-[var(--color-surface-2)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none border border-[var(--color-border-subtle)] uppercase"
                />
                <button
                  onClick={handlePromoSubmit}
                  className="px-4 py-3 bg-[var(--color-primary)] text-black text-sm font-semibold rounded-xl"
                >
                  Apply
                </button>
              </div>
              {promoStatus === 'valid' && (
                <p className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                  <CheckCircle size={12} /> NGN 100 discount applied!
                </p>
              )}
              {promoStatus === 'invalid' && (
                <p className="text-xs text-[var(--color-error)] flex items-center gap-1">
                  <X size={12} /> Invalid promo code
                </p>
              )}
            </div>
          )}
        </div>

        {/* Fare summary */}
        <div className="bg-[var(--color-surface-1)] rounded-2xl p-4 border border-[var(--color-border-subtle)] space-y-2.5">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Fare Summary</p>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-text-muted)]">Base fare</span>
            <span className="font-semibold">NGN {baseFare.toLocaleString()}</span>
          </div>
          {deadMileage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Dead mileage</span>
              <span className="font-semibold">NGN {deadMileage.toLocaleString()}</span>
            </div>
          )}
          {stopFees > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Stop fees</span>
              <span className="font-semibold">NGN {stopFees.toLocaleString()}</span>
            </div>
          )}
          {insuranceOn && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Insurance</span>
              <span className="font-semibold">NGN 100</span>
            </div>
          )}
          {promoDiscountAmt > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-success)' }}>Promo discount</span>
              <span className="font-semibold" style={{ color: 'var(--color-success)' }}>
                -NGN {promoDiscountAmt.toLocaleString()}
              </span>
            </div>
          )}
          {isSubActive && (
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-primary)] font-semibold">Subscription coverage</span>
              <span className="font-semibold text-[var(--color-primary)]">
                -{subCoverageKm.toFixed(1)} km
              </span>
            </div>
          )}
          <div className="border-t border-[var(--color-border-subtle)] pt-2.5 flex justify-between items-baseline">
            <span className="text-sm font-semibold">{isSubActive ? 'Pay via Wallet' : 'Total to pay'}</span>
            <span className="text-xl font-display font-semibold" style={{ color: 'var(--color-primary)' }}>
              NGN {totalfare.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="absolute bottom-0 inset-x-0 bg-[var(--color-surface-1)] border-t border-[var(--color-border-subtle)] p-4">
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
            canConfirm
              ? 'bg-[var(--color-primary)] text-black shadow-[var(--shadow-glow)] active:scale-[0.98]'
              : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] cursor-not-allowed'
          }`}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
