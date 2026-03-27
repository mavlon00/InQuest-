import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
// All mock constants removed to use real data from API.

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

      // ── API Actions ─────────────────────────
      fetchFareEstimate: async () => {
        const { pickup, destination, stops } = get();
        if (!pickup || !destination) return;
        
        try {
          const response = await api.post('/rides/fare/estimate', {
            pickup_latitude: pickup.lat,
            pickup_longitude: pickup.lng,
            destination_latitude: destination.lat,
            destination_longitude: destination.lng,
            stops: stops.map(s => ({
              latitude: s.lat,
              longitude: s.lng,
              address: s.address
            }))
          });
          
          if (response.data.status === 'success') {
            set({ fareEstimate: response.data.data });
            return response.data.data;
          }
        } catch (error) {
          console.error('Error fetching fare estimate:', error);
          throw error;
        }
      },

      createBooking: async () => {
        const { pickup, destination, stops, paymentMethod, isScheduled, scheduledTime } = get();
        
        const endpoint = isScheduled ? '/rides/personal/create' : '/rides/onspot/book';
        const payload = {
          pickup_latitude: pickup.lat,
          pickup_longitude: pickup.lng,
          destination_latitude: destination.lat,
          destination_longitude: destination.lng,
        };

        if (isScheduled) {
          payload.scheduled_time = scheduledTime;
        }

        try {
          const response = await api.post(endpoint, payload);
          if (response.data.status === 'success') {
            const { ride_id, status } = response.data.data;
            set({ bookingId: ride_id, bookingStatus: status });
            return response.data.data;
          }
          throw new Error(response.data.message || 'Booking failed');
        } catch (error) {
          console.error('Error creating booking:', error);
          throw error;
        }
      },

      cancelBooking: async (reason = '') => {
        const { bookingId } = get();
        if (!bookingId) return;

        try {
          const response = await api.post(`/rides/${bookingId}/cancel`, { reason });
          if (response.data.status === 'success') {
            set({ bookingId: null, bookingStatus: 'CANCELLED' });
          }
        } catch (error) {
          console.error('Error cancelling booking:', error);
          throw error;
        }
      },

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
