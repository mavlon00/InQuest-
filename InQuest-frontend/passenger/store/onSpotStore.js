import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useOnSpotStore = create(
  persist(
    (set, get) => ({

      // Booking flow state
      selectedDriver: null,
      // {
      //   driverId, driverName, driverPhoto,
      //   driverRating, vehiclePlate,
      //   vehicleColor, vehicleModel,
      //   distance, location: { lat, lng },
      //   heading
      // }

      destination: null,
      // { lat, lng, address }

      pickup: null,
      // { lat, lng, address }

      seats: 1,
      paymentMethod: null,
      mapEstimateKm: null,
      estimatedFare: null,

      // Active booking
      activeBooking: null,
      // {
      //   bookingId, driverId, driverName,
      //   driverPhoto, vehiclePlate,
      //   pickup, destination, seats,
      //   paymentMethod, status,
      //   iotKm, iotFare, elapsedMinutes,
      //   waitingFee, subscriptionDeducted,
      //   currentDriverLocation,
      //   method: 'APP_SELECTION'|'WALK_UP'
      // }

      // Settlement data (after trip ends)
      settlement: null,
      // {
      //   bookingId, mapEstimateKm, iotActualKm,
      //   subscriptionDeducted, overflowKm,
      //   walletCharged, cashAmount,
      //   debtCreated, debtAmount,
      //   saved, greenPoints
      // }

      // Nearby kekes
      nearbyKekes: [],
      // Each: { driverId, driverName, 
      // location, heading, status, distance }

      // Debt
      outstandingDebt: null,
      // { amount, tripId, createdAt, 
      //   dueBy, status }

      // Pending rating
      pendingRating: null,
      // { bookingId, driverId, driverName }

      // Walk-up session
      walkUpSession: null,
      // { driverId, driverName, driverRating,
      //   vehiclePlate, vehicleColor, vehicleModel,
      //   linkedAt }

      // Balance check result
      balanceCheck: null,
      // { level: 'SUFFICIENT'|'LOW'|'CRITICAL'
      //   |'BLOCKED', walletNeeded, shortfall,
      //   subscriptionCoversKm, overflowKm }

      // UI state
      isLoading: false,
      isFetchingEstimate: false,
      sosActive: false,
      chatOpen: false,

      // ─── ACTIONS ───────────────────────

      setSelectedDriver: (driver) =>
        set({ selectedDriver: driver }),

      clearSelectedDriver: () =>
        set({ selectedDriver: null }),

      setDestination: (destination) =>
        set({ destination }),

      setPickup: (pickup) =>
        set({ pickup }),

      setSeats: (seats) =>
        set({ seats }),

      setPaymentMethod: (method) =>
        set({ paymentMethod: method }),

      setMapEstimate: (km, fare) =>
        set({ mapEstimateKm: km, 
              estimatedFare: fare }),

      runBalanceCheck: (
        paymentMethod, 
        walletBalance, 
        subscription,
        mapEstimateKm,
        seats
      ) => {
        if (paymentMethod === 'CASH') {
          const result = { level: 'SUFFICIENT' };
          set({ balanceCheck: result });
          return 'SUFFICIENT';
        }

        let walletNeeded = 0;
        let subscriptionCoversKm = 0;
        let overflowKm = 0;

        if (paymentMethod === 'SUBSCRIPTION' 
            && subscription) {
          subscriptionCoversKm = Math.min(
            mapEstimateKm || 0,
            subscription.remainingKm || 0
          );
          overflowKm = Math.max(
            0,
            (mapEstimateKm || 0) - (subscription.remainingKm || 0)
          );
          walletNeeded = (
            100 +
            (overflowKm * 120) +
            (100 * (seats - 1)) +
            ((mapEstimateKm || 0) * 120 * (seats - 1))
          );
        } else {
          walletNeeded = (
            (100 * seats) +
            ((mapEstimateKm || 0) * 120 * seats)
          );
        }

        const coverage = walletNeeded === 0 ? 1 : walletBalance / walletNeeded;
        let level = 'SUFFICIENT';
        if (walletBalance === 0 && walletNeeded > 0) level = 'BLOCKED';
        else if (coverage < 0.5) level = 'CRITICAL';
        else if (coverage < 1.0) level = 'LOW';

        const result = {
          level,
          walletNeeded,
          shortfall: Math.max(
            0, walletNeeded - walletBalance
          ),
          subscriptionCoversKm,
          overflowKm,
        };

        set({ balanceCheck: result });
        return level;
      },

      setNearbyKekes: (kekes) =>
        set({ nearbyKekes: kekes }),

      updateKekeLocation: (
        driverId, location, heading
      ) => {
        set(state => ({
          nearbyKekes: state.nearbyKekes.map(k =>
            k.driverId === driverId
              ? { ...k, location, heading }
              : k
          ),
          activeBooking: state.activeBooking?.
            driverId === driverId
            ? {
                ...state.activeBooking,
                currentDriverLocation: location,
              }
            : state.activeBooking,
        }));
      },

      setWalkUpSession: (session) =>
        set({ walkUpSession: session }),

      linkDriver: async (code) => {
        try {
          const api = (await import('../utils/api')).default;
          const res = await api.post('/rides/onspot/walkup/link', { code });
          if (res.data.status === 'success') {
            set({ walkUpSession: res.data.data });
            return res.data.data;
          }
          throw new Error(res.data.message || 'Linking failed');
        } catch (error) {
          console.error('Error linking driver:', error);
          throw error;
        }
      },

      clearWalkUpSession: () =>
        set({ walkUpSession: null }),

      setActiveBooking: (booking) =>
        set({ activeBooking: booking }),

      updateBookingStatus: (status) => {
        set(state => ({
          activeBooking: state.activeBooking
            ? { ...state.activeBooking, status }
            : null
        }));
      },

      updateLiveFare: (iotKm, iotFare, 
        waitingFee, subscriptionDeducted
      ) => {
        set(state => ({
          activeBooking: state.activeBooking ? {
            ...state.activeBooking,
            iotKm,
            iotFare,
            waitingFee,
            subscriptionDeducted,
          } : null
        }));
      },

      setSettlement: (settlement) =>
        set({ settlement }),

      setOutstandingDebt: (debt) =>
        set({ outstandingDebt: debt }),

      clearDebt: () =>
        set({ outstandingDebt: null }),

      setPendingRating: (rating) =>
        set({ pendingRating: rating }),

      clearPendingRating: () =>
        set({ pendingRating: null }),

      toggleSOS: (active) =>
        set({ sosActive: active }),

      toggleChat: (open) =>
        set({ chatOpen: open }),

      resetFlow: () => set({
        selectedDriver: null,
        destination: null,
        pickup: null,
        seats: 1,
        paymentMethod: null,
        mapEstimateKm: null,
        estimatedFare: null,
        balanceCheck: null,
        walkUpSession: null,
      }),

      clearActiveBooking: () => set({
        activeBooking: null,
        settlement: null,
        sosActive: false,
        chatOpen: false,
      }),

    }),
    {
      name: 'inquest-onspot',
      partialize: (state) => ({
        outstandingDebt: state.outstandingDebt,
        pendingRating: state.pendingRating,
      }),
    }
  )
);

export default useOnSpotStore;
