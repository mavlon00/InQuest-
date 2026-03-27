import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useDriverStore = create()(
  persist(
    (set, get) => ({
      // Authentication State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      kyc_status: 'NOT_STARTED', // NOT_STARTED, PENDING, APPROVED, REJECTED

      // Profile State
      driver: {
        id: '',
        phone: '',
        firstName: '',
        lastName: '',
        email: '',
        photo: '',
        rating: 0,
        trips: 0,
        vehicle: {
          make: '',
          model: '',
          plate: '',
          color: ''
        }
      },

      // Wallet & Earnings State
      walletBalance: 0,
      tripHistory: [],
      notifications: [],

      // Active Trip State
      isOnline: false,
      activeTrip: null,
      incomingRequest: null,
      requestCountdown: 0,
      currentLocation: null,
      iotDevice: { isConnected: true, signalStrength: 3, batteryPercent: 88, deviceId: 'IQ-99' },
      settlement: { showMorningSummary: false, morningSummary: null },

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAccessToken: (token) => {
        set({ accessToken: token, isAuthenticated: !!token });
        if (token) {
          localStorage.setItem('accessToken', token);
        } else {
          localStorage.removeItem('accessToken');
        }
      },

      // setDriver: used by OTPVerify & ProfileSetup after auth
      setDriver: (driverData) => set((state) => ({
        driver: { ...state.driver, ...driverData },
        user: { ...state.user, ...driverData },
        kyc_status: driverData.kycStatus || driverData.kyc_status || state.kyc_status,
      })),

      setNotifications: (notifications) => set({ notifications }),
      
      login: (data) => {
        set({
          user: data.user,
          accessToken: data.access_token,
          isAuthenticated: true,
          driver: {
            ...get().driver,
            id: data.user.id,
            phone: data.user.phone_number,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            email: data.user.email,
            photo: data.user.photo_url,
          }
        });
        localStorage.setItem('accessToken', data.access_token);
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          driver: null,
          walletBalance: 0,
          tripHistory: [],
          isOnline: false,
          activeTrip: null
        });
        localStorage.removeItem('accessToken');
      },

      updateDriver: (updates) => set((state) => ({
        driver: { ...state.driver, ...updates }
      })),

      updateKYC: (status) => set({ kyc_status: status }),

      setOnline: (online) => set({ isOnline: online }),
      setActiveTrip: (trip) => set({ activeTrip: trip }),
      setIncomingRequest: (request) => set({ incomingRequest: request }),
      setRequestCountdown: (count) => set({ requestCountdown: count }),
      setIotDevice: (device) => set({ iotDevice: device }),
      setSettlement: (settlement) => set({ settlement }),
      setTripStatus: (status) => set({ tripStatus: status }),
      setCurrentLocation: (loc) => set({ currentLocation: loc }),

      // API Actions
      fetchWalletData: async () => {
        try {
          const response = await api.get('/wallet/balance');
          if (response.data.status === 'success') {
            set({ walletBalance: response.data.data.balance });
          }
        } catch (error) {
          console.error("Failed to fetch wallet balance", error);
        }
      },

      fetchTripHistory: async () => {
        try {
          const response = await api.get('/rides/history');
          if (response.data.status === 'success') {
            const mappedTrips = response.data.data.map(trip => ({
              id: trip.id,
              date: new Date(trip.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }),
              pickup: trip.pickup_address || 'Pickup Location',
              dropoff: trip.destination_address || 'Destination Location',
              fare: trip.actual_fare || trip.estimated_fare,
              status: trip.status,
              timestamp: trip.created_at
            }));
            set({ tripHistory: mappedTrips });
          }
        } catch (error) {
           console.error("Failed to fetch trip history", error);
        }
      },

      fetchProfile: async () => {
        try {
          const response = await api.get('/auth/profile');
          if (response.data.status === 'success') {
             const user = response.data.data;
             set({
               user,
               driver: {
                 ...get().driver,
                 firstName: user.first_name,
                 lastName: user.last_name,
                 email: user.email,
                 photo: user.photo_url,
                 phone: user.phone_number
               }
             });
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      }
    }),
    {
      name: 'inquest-driver-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        kyc_status: state.kyc_status,
        driver: state.driver,
        walletBalance: state.walletBalance,
        tripHistory: state.tripHistory,
        isOnline: state.isOnline,
      }),
    }
  )
);
