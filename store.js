import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      isAddPaymentSheetOpen: false,
      setAddPaymentSheetOpen: (isOpen) => set({ isAddPaymentSheetOpen: isOpen }),

      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),

      savedPlaces: [
        { id: '1', type: 'home', label: 'Home', address: '123 Main St, Apt 4B, Ikeja', lat: 6.6018, lng: 3.3515 },
        { id: '2', type: 'work', label: 'Work', address: '456 Business Rd, Victoria Island', lat: 6.4281, lng: 3.4219 },
      ],
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

      paymentMethods: [
        { id: '1', type: 'card', brand: 'Mastercard', last4: '4567', expiry: '12/28', holder: 'MUSA IBRAHIM', isDefault: true },
        { id: '2', type: 'card', brand: 'Visa', last4: '8901', expiry: '09/25', holder: 'MUSA IBRAHIM', isDefault: false },
      ],
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

      walletBalance: 12450,
      updateWalletBalance: (amount) => set((state) => ({ walletBalance: state.walletBalance + amount })),
      transactions: [
        { id: '1', type: 'credit', title: 'Wallet Top-up', amount: 5000, date: 'Today, 10:30 AM' },
        { id: '2', type: 'debit', title: 'Ride to Ikeja City Mall', amount: 1250, date: 'Yesterday, 4:15 PM' },
        { id: '3', type: 'debit', title: 'Transfer to John Doe', amount: 2000, date: 'Oct 22, 2026' },
      ],
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),

      tripHistory: [
        { id: 'TRP-123', status: 'Completed', date: 'Oct 24, 2026 • 2:30 PM', pickup: 'Allen Roundabout', dropoff: 'Ikeja City Mall', fare: '₦450' },
        { id: 'TRP-124', status: 'Cancelled', date: 'Oct 22, 2026 • 9:15 AM', pickup: 'Maryland Mall', dropoff: 'Oshodi', fare: '₦0' },
        { id: 'TRP-125', status: 'Completed', date: 'Oct 20, 2026 • 6:45 PM', pickup: 'Lekki Phase 1', dropoff: 'Victoria Island', fare: '₦1,200' },
      ],
      addTripHistory: (trip) => set((state) => ({ tripHistory: [trip, ...state.tripHistory] })),

      referralStatus: {
        referrals: 0,
        earned: 0,
        pending: 0,
      },

      notifications: [
        { id: '1', type: 'TRIP_CONFIRMED', title: 'Trip Accepted', desc: 'Emmanuel is on his way to pick you up in a Green Keke.', time: 'Just now', unread: true, tripId: 'TRP-123' },
        { id: '2', type: 'REFERRAL_REWARD', title: '50% Off Your Next Ride', desc: 'Use code INQ50 at checkout. Valid until Oct 31.', time: '2 hours ago', unread: true },
        { id: '3', type: 'DRIVER_ARRIVED', title: 'Driver Arrived', desc: '"I am at the junction, where are you exactly?"', time: '1 hour ago', unread: true, tripId: 'TRP-123' },
        { id: '4', type: 'WALLET_TOPUP', title: 'Wallet Top-up Successful', desc: '₦5,000 has been added to your wallet.', time: 'Yesterday', unread: false },
        { id: '5', type: 'SOS_TRIGGERED', title: 'Guardian Alert', desc: 'Your trip to Ikeja is being shared with 2 contacts.', time: 'Oct 23', unread: false, tripId: 'TRP-125' },
        { id: '6', type: 'GREEN_POINTS_EARNED', title: 'Green Points Earned', desc: 'You earned 45 points from your last ride!', time: 'Oct 22', unread: false },
      ],
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
          // Clear legacy keys if they exist
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
