import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
export const mockFareEstimate = {
  distanceKm: 5.2,
  durationMins: 15,
  routePolyline: null,
  baseFare: 800,
  deadMileageFee: 50,
  stopFees: 0,
  insuranceFee: 0,
  discount: 0,
  totalFare: 850,
  currency: 'NGN',
  estimateRef: 'est_abc123',
};

export const mockDriver = {
  id: 'drv_001',
  name: 'Michael Okon',
  phone: '+2348099999999',
  rating: 4.9,
  totalTrips: 1247,
  photoUrl: null,
  vehiclePlate: 'KJA-123XY',
  vehicleColor: 'Yellow',
  vehicleModel: 'Bajaj RE',
  location: { lat: 6.5244, lng: 3.3792, heading: 45 },
  etaMins: 4,
};

export const mockSavedPlaces = [
  {
    id: 'pl_1',
    label: 'HOME',
    name: 'Home',
    address: '14 Admiralty Way, Lekki Phase 1',
    location: { lat: 6.4698, lng: 3.5852 },
  },
  {
    id: 'pl_2',
    label: 'WORK',
    name: 'Work',
    address: 'Eko Atlantic, Victoria Island',
    location: { lat: 6.4281, lng: 3.4219 },
  },
];

export const mockRecentTrips = [
  { destination: { address: 'Ikeja City Mall, Alausa', lat: 6.6018, lng: 3.3515 } },
  { destination: { address: 'Blenco Supermarket, Lekki', lat: 6.4479, lng: 3.5006 } },
  { destination: { address: 'Lagos Island General Hospital', lat: 6.4537, lng: 3.4205 } },
];

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────
const initialBookingState = {
  // Step 1 — Location
  pickup: null,          // { lat, lng, address }
  destination: null,    // { lat, lng, address }
  stops: [],            // [{ lat, lng, address }]
  guest: null,          // { name, phone } or null

  // Step 2 — Estimate
  fareEstimate: null,   // full estimate response
  insurance: false,

  // Step 3 — Options
  paymentMethod: null,  // 'WALLET' | 'CASH' | 'CARD'
  promoCode: null,
  promoDiscount: 0,
  driverNotes: '',

  // Scheduling
  scheduledTime: null,  // ISO8601 string or null
  isScheduled: false,

  // Active booking
  bookingId: null,
  bookingStatus: null,  // REQUESTED | ACCEPTED | EN_ROUTE | ARRIVING | ARRIVED | IN_PROGRESS | COMPLETING | COMPLETED | CANCELLED
  activeDriver: null,   // driver object from API/mock
  etaMins: null,

  // Waiting fee
  waitingFeeActive: false,
  waitingFeeAmount: 0,
  waitingFeeStartedAt: null,

  // Completed trip
  completedTrip: null,

  // Pending rating
  pendingRating: null,  // tripId awaiting rating

  // Chat
  chatMessages: [],

  // Driver location (real-time)
  driverLocation: null, // { lat, lng, heading }
};

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────
export const useBookingStore = create(
  persist(
    (set, get) => ({
      ...initialBookingState,

      // ── Step 1 ──────────────────────────────
      setPickup: (pickup) => set({ pickup }),
      setDestination: (destination) => set({ destination }),
      addStop: (stop) =>
        set((s) => ({ stops: s.stops.length < 3 ? [...s.stops, stop] : s.stops })),
      removeStop: (index) =>
        set((s) => ({ stops: s.stops.filter((_, i) => i !== index) })),
      setGuest: (guest) => set({ guest }),

      // ── Step 2 ──────────────────────────────
      setFareEstimate: (fareEstimate) => set({ fareEstimate }),
      setInsurance: (insurance) => set({ insurance }),

      // ── Step 3 ──────────────────────────────
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setPromoCode: (promoCode) => set({ promoCode }),
      setPromoDiscount: (promoDiscount) => set({ promoDiscount }),
      setDriverNotes: (driverNotes) => set({ driverNotes }),

      // ── Scheduling ──────────────────────────
      setScheduledTime: (scheduledTime) =>
        set({ scheduledTime, isScheduled: !!scheduledTime }),
      clearSchedule: () => set({ scheduledTime: null, isScheduled: false }),

      // ── Active booking ───────────────────────
      setBooking: (bookingId, bookingStatus) => set({ bookingId, bookingStatus }),
      updateBookingStatus: (bookingStatus) => set({ bookingStatus }),
      setActiveDriver: (activeDriver) => set({ activeDriver }),
      setETA: (etaMins) => set({ etaMins }),
      setDriverLocation: (driverLocation) => set({ driverLocation }),

      // ── Waiting fee ──────────────────────────
      startWaitingFee: () =>
        set({
          waitingFeeActive: true,
          waitingFeeStartedAt: Date.now(),
          waitingFeeAmount: 0,
        }),
      updateWaitingFee: (waitingFeeAmount) => set({ waitingFeeAmount }),

      // ── Chat ────────────────────────────────
      addChatMessage: (message) =>
        set((s) => ({ chatMessages: [...s.chatMessages, message] })),
      clearChat: () => set({ chatMessages: [] }),

      // ── Completed trip ───────────────────────
      setCompletedTrip: (completedTrip) => set({ completedTrip }),

      // ── Pending rating ───────────────────────
      setPendingRating: (pendingRating) => set({ pendingRating }),
      clearPendingRating: () => set({ pendingRating: null }),

      // ── Reset ───────────────────────────────
      resetBooking: () => set({ ...initialBookingState }),

      // ── Computed helpers ────────────────────
      getTotalFare: () => {
        const s = get();
        if (!s.fareEstimate) return 0;
        const { baseFare, deadMileageFee, stopFees, insuranceFee } = s.fareEstimate;
        const insurance = s.insurance ? 100 : 0;
        const discount = s.promoDiscount || 0;
        return (baseFare || 0) + (deadMileageFee || 0) + (stopFees || 0) + insurance - discount;
      },

      isActiveTrip: () => {
        const { bookingStatus } = get();
        return (
          bookingStatus !== null &&
          bookingStatus !== 'COMPLETED' &&
          bookingStatus !== 'CANCELLED'
        );
      },
    }),
    {
      name: 'inquest-booking-store',
      partialize: (state) => ({
        bookingId: state.bookingId,
        bookingStatus: state.bookingStatus,
        activeDriver: state.activeDriver,
        pickup: state.pickup,
        destination: state.destination,
        stops: state.stops,
        guest: state.guest,
        fareEstimate: state.fareEstimate,
        insurance: state.insurance,
        paymentMethod: state.paymentMethod,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
        driverNotes: state.driverNotes,
        scheduledTime: state.scheduledTime,
        isScheduled: state.isScheduled,
        etaMins: state.etaMins,
        waitingFeeActive: state.waitingFeeActive,
        waitingFeeAmount: state.waitingFeeAmount,
        waitingFeeStartedAt: state.waitingFeeStartedAt,
        completedTrip: state.completedTrip,
        pendingRating: state.pendingRating,
      }),
    }
  )
);
