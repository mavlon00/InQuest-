import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './utils/api';

const initialBookingState = {
  tripId: null,
  status: 'IDLE',
  passengerLat: null,
  passengerLng: null,
  destinationLat: null,
  destinationLng: null,
  destinationName: null,
  pickupName: null,
  driver: null,
  eta: null,
  fare: null,
  type: 'Personal',
  acceptedAt: null,
  acceptanceTimestamp: null,
  sosActive: false,
  triggeringSOS: false,
  alarmFired: false,
  passengerName: null,
  passengerPhone: null,
  waitingFee: 0,
  waitStartTime: null,
  scheduledTime: null,
  stops: [],
  timestamp: Date.now(),
};

export const useStore = create()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      isAddPaymentSheetOpen: false,
      setAddPaymentSheetOpen: (isOpen) => set({ isAddPaymentSheetOpen: isOpen }),

      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => {
        set({ isAuthenticated: false, user: null, walletBalance: 0, transactions: [], tripHistory: [], notifications: [], savedPlaces: [], paymentMethods: [] });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('inquest-storage');
      },

      savedPlaces: [],
      addSavedPlace: (place) => set((state) => ({ savedPlaces: [...state.savedPlaces, place] })),
      removeSavedPlace: (id) => set((state) => ({ savedPlaces: state.savedPlaces.filter(p => p.id !== id) })),

      booking: initialBookingState,
      updateBooking: (updates) => set((state) => ({
        booking: { ...state.booking, ...updates, timestamp: Date.now() }
      })),
      resetBooking: () => set({ booking: initialBookingState }),

      completeTrip: (rating, comment) => set((state) => {
        const completedTrip = {
          id: state.booking.tripId || `TRP-${Date.now()}`,
          status: 'Completed',
          date: new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
          pickup: state.booking.pickupName || 'Unknown Pickup',
          dropoff: state.booking.destinationName || 'Unknown Destination',
          fare: state.booking.fare || 0,
          waitingFee: state.booking.waitingFee || 0,
          totalPaid: (state.booking.fare || 0) + (state.booking.waitingFee || 0),
          rating,
          comment,
          driver: state.booking.driver,
          route: state.booking.route,
          passengerName: state.booking.passengerName,
          type: state.booking.type
        };

        const updatedHistory = [completedTrip, ...state.tripHistory];

        return {
          tripHistory: updatedHistory,
          booking: {
            ...initialBookingState,
            status: 'IDLE'
          },
          toastMessage: 'Trip completed successfully!',
          isCallOverlayOpen: false,
          isChatOverlayOpen: false,
        };
      }),

      paymentMethods: [],
      addPaymentMethod: (method) => set((state) => {
        const updatedMethods = method.isDefault
          ? state.paymentMethods.map(m => ({ ...m, isDefault: false })).concat(method)
          : [...state.paymentMethods, method];
        return { paymentMethods: updatedMethods };
      }),
      removePaymentMethod: (id) => set((state) => ({
        paymentMethods: state.paymentMethods.filter(m => m.id !== id)
      })),
      setDefaultPaymentMethod: (id) => set((state) => ({
        paymentMethods: state.paymentMethods.map(m => ({ ...m, isDefault: m.id === id }))
      })),

      isCallOverlayOpen: false,
      isChatOverlayOpen: false,
      setCallOverlayOpen: (isOpen) => set({ isCallOverlayOpen: isOpen }),
      setChatOverlayOpen: (isOpen) => set({ isChatOverlayOpen: isOpen }),

      isCancelModalOpen: false,
      setCancelModalOpen: (isOpen) => set({ isCancelModalOpen: isOpen }),

      walletBalance: 0,
      updateWalletBalance: (amount) => set((state) => ({ walletBalance: state.walletBalance + amount }), false),
      setWalletBalance: (walletBalance) => set({ walletBalance }),
      transactions: [],
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
      setTransactions: (transactions) => set({ transactions }),

      tripHistory: [],
      addTripHistory: (trip) => set((state) => ({ tripHistory: [trip, ...state.tripHistory] })),
      setTripHistory: (tripHistory) => set({ tripHistory }),

      referralStatus: {
        referrals: 0,
        earned: 0,
        pending: 0,
      },

      notifications: [],
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, unread: false } : n)
      })),
      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, unread: false }))
      })),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      toastMessage: null,
      setToastMessage: (msg) => set({ toastMessage: msg }),

      // API Actions
      fetchWalletData: async () => {
        try {
          const response = await api.get('/wallet/balance');
          if (response.data.status === 'success') {
            set({ walletBalance: response.data.data.balance });
          }
          
          const historyResponse = await api.get('/wallet/transactions');
          if (historyResponse.data.status === 'success') {
            const raw = historyResponse.data.data?.transactions || [];
            const mapped = raw.map(tx => ({
              id: tx.id,
              type: tx.type === 'credit' ? 'credit' : 'debit',
              title: tx.description || tx.category || 'Transaction',
              desc: tx.created_at ? new Date(tx.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '',
              amount: tx.amount,
              date: tx.created_at,
            }));
            set({ transactions: mapped });
          }
        } catch (error) {
          console.error('Error fetching wallet data:', error);
        }
      },

      fetchProfileData: async () => {
        try {
          const response = await api.get('/auth/profile');
          if (response.data.status === 'success') {
            set({ user: response.data.data });
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
    }),
    {
      name: 'inquest-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Cleanup stale trip data on app startup
        const trip = state.booking;
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        const validStatuses = ['ACCEPTED', 'EN_ROUTE', 'ARRIVING', 'ARRIVED', 'IN_PROGRESS'];

        if (
          !trip ||
          !validStatuses.includes(trip.status) ||
          !trip.driver ||
          (trip.timestamp && trip.timestamp < twoHoursAgo)
        ) {
          state.resetBooking();
          localStorage.removeItem('inquest-active-trip');
          localStorage.removeItem('inquest-booking-state');
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        savedPlaces: state.savedPlaces,
        booking: state.booking,
        walletBalance: state.walletBalance,
        transactions: state.transactions,
        tripHistory: state.tripHistory,
        referralStatus: state.referralStatus,
        paymentMethods: state.paymentMethods,
        notifications: state.notifications,
      }),
    }
  )
);
