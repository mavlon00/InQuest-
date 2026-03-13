import { create } from 'zustand';

const mockDriver = {
  id: 'drv_001',
  firstName: 'Michael',
  lastName: 'Okon',
  phone: '+2348099999999',
  photoUrl: null,
  rating: 4.9,
  totalTrips: 1247,
  isApproved: true,
  kycStatus: 'APPROVED',
  vehicle: {
    plate: 'KJA-123XY',
    color: 'Yellow',
    model: 'Bajaj RE',
    year: 2022,
  },
};

const mockWallets = {
  working: {
    balance: 14200,
    grossToday: 14200,
    tripCount: 11,
    pendingVerification: 1050,
    lastCreditedAt: new Date().toISOString(),
    lastCreditAmount: 1050,
  },
  main: {
    balance: 87450,
    totalLifetime: 1284000,
    lastSettlementDate: '2026-03-08',
    lastSettlementNet: 8141,
  },
  maintenance: {
    balance: 12340,
    totalSaved: 84200,
    lastDepositAt: '2026-03-08T00:00:00Z',
    lastDepositAmount: 429,
    savingsRate: 0.10,
    pendingWithdrawalRequest: null,
    // pendingWithdrawalRequest shape:
    // { amount, reason, status: 'PENDING'|'APPROVED'|'REJECTED', submittedAt, adminNote, resolvedAt }
  },
};

const mockSettlementPreview = {
  gross: 14200,
  commission: { rate: 0.15, amount: 2130 },
  kekeUsageFee: { amount: 3500 },
  netBeforeMaintenance: 8570,
  maintenanceSplit: { rate: 0.05, amount: 429 },
  mainNet: 8141,
  maintenanceNet: 429,
  settledAt: '2026-03-08T00:00:00Z',
};

const mockTripHistory = [
  {
    id: 'trip_001',
    timestamp: '2026-03-10T14:30:00Z',
    pickup: 'Lekki Phase 1, Lagos',
    destination: 'Victoria Island, Lagos',
    fare: 1050,
    duration: 28,
    paymentMethod: 'WALLET',
    status: 'COMPLETED',
    iotVerified: true,
    passengerName: 'Amaka',
    passengerRating: 5,
  },
  {
    id: 'trip_002',
    timestamp: '2026-03-10T12:15:00Z',
    pickup: 'Yaba, Lagos',
    destination: 'Surulere, Lagos',
    fare: 800,
    duration: 22,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    iotVerified: true,
    passengerName: 'Emeka',
    passengerRating: 4,
  },
  {
    id: 'trip_003',
    timestamp: '2026-03-10T09:45:00Z',
    pickup: 'Victoria Island, Lagos',
    destination: 'Ikoyi, Lagos',
    fare: 1200,
    duration: 35,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    iotVerified: true,
    passengerName: 'Ngozi',
    passengerRating: 5,
  },
  {
    id: 'trip_004',
    timestamp: '2026-03-10T08:00:00Z',
    pickup: 'Ajah, Lagos',
    destination: 'Sangotedo, Lagos',
    fare: 600,
    duration: 18,
    paymentMethod: 'CASH',
    status: 'CANCELLED',
    iotVerified: false,
    passengerName: 'Bola',
    passengerRating: null,
  },
  {
    id: 'trip_005',
    timestamp: '2026-03-09T16:00:00Z',
    pickup: 'Ikeja, Lagos',
    destination: 'Maryland, Lagos',
    fare: 900,
    duration: 25,
    paymentMethod: 'WALLET',
    status: 'COMPLETED',
    iotVerified: true,
    passengerName: 'Chidi',
    passengerRating: 4,
  },
];

export const useDriverStore = create((set, get) => ({
  // Auth
  accessToken: 'mock_token',
  refreshToken: 'mock_refresh',

  // Driver profile
  driver: mockDriver,

  // KYC
  kycStatus: 'APPROVED', // 'NOT_STARTED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  kycRejectionReason: null,

  // Online status
  isOnline: false,

  // Route
  selectedRoute: {
    type: 'ANY',
    presetRouteIds: [],
    customCenter: null,
    customRadiusKm: 1,
    label: 'Accept all bookings',
  },

  // Location
  currentLocation: null, // { lat, lng, heading, speed, accuracy }

  // Active trip
  activeTrip: null,
  tripStatus: null, // IDLE | REQUEST_RECEIVED | EN_ROUTE | ARRIVING | ARRIVED | IN_PROGRESS | COMPLETING | COMPLETED
  incomingRequest: null,
  requestCountdown: 25,

  // Cash trip IoT tracking
  activeCashTrip: {
    iotDistanceKm: 0,
    iotCurrentFare: 0,
    lastIotPingAt: null,
  },

  // Three wallets
  wallets: mockWallets,

  // Settlement
  settlement: {
    lastSettlementDate: '2026-03-08',
    showMorningSummary: false,
    morningSummary: mockSettlementPreview,
  },

  // IoT device
  iotDevice: {
    isConnected: true,
    deviceId: 'IOT-KJA-123XY-001',
    batteryPercent: 87,
    signalStrength: 4,
    lastPingAt: new Date().toISOString(),
  },

  // Trip history (mock)
  tripHistory: mockTripHistory,

  // UI state
  socket: null,
  isConnected: false,
  pendingRating: null,

  // Actions
  setAccessToken: (accessToken) => set({ accessToken }),
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  setDriver: (driver) => set({ driver }),
  setKycStatus: (kycStatus) => set({ kycStatus }),
  setKycRejectionReason: (kycRejectionReason) => set({ kycRejectionReason }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setActiveTrip: (activeTrip) => set({ activeTrip }),
  setTripStatus: (tripStatus) => set({ tripStatus }),
  setIncomingRequest: (incomingRequest) => set({ incomingRequest }),
  setRequestCountdown: (requestCountdown) => set({ requestCountdown }),
  setActiveCashTrip: (activeCashTrip) => set({ activeCashTrip }),
  setWallets: (wallets) => set({ wallets }),
  setSettlement: (settlement) => set({ settlement }),
  setIotDevice: (iotDevice) => set({ iotDevice }),
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setPendingRating: (pendingRating) => set({ pendingRating }),

  // Maintenance wallet actions
  submitMaintenanceWithdrawal: (amount, reason) => {
    const { wallets } = get();
    const request = {
      amount,
      reason,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      adminNote: null,
      resolvedAt: null,
    };
    set({
      wallets: {
        ...wallets,
        maintenance: {
          ...wallets.maintenance,
          pendingWithdrawalRequest: request,
        },
      },
    });
  },

  clearMaintenanceWithdrawal: () => {
    const { wallets } = get();
    set({
      wallets: {
        ...wallets,
        maintenance: {
          ...wallets.maintenance,
          pendingWithdrawalRequest: null,
        },
      },
    });
  },

  // Simulate trip credit to working wallet
  creditWorkingWallet: (amount) => {
    const { wallets } = get();
    set({
      wallets: {
        ...wallets,
        working: {
          ...wallets.working,
          balance: wallets.working.balance + amount,
          grossToday: wallets.working.grossToday + amount,
          tripCount: wallets.working.tripCount + 1,
          lastCreditedAt: new Date().toISOString(),
          lastCreditAmount: amount,
        },
      },
    });
  },

  logout: () => set({
    accessToken: null,
    refreshToken: null,
    driver: null,
    isOnline: false,
    activeTrip: null,
    tripStatus: null,
    incomingRequest: null,
  }),
}));
