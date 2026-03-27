import { create } from 'zustand';

// --- MOCK API FOR RECURRING BOOKINGS ---
const mockSchedules = [
  {
    id: "sched_001",
    label: "Morning Commute",
    pickup: { address: "12 Admiralty Way, Lekki Phase 1" },
    destination: { address: "Civic Towers, Victoria Island" },
    daysOfWeek: [1, 2, 3, 4, 5],  // Mon-Fri
    time: "07:30",
    paymentMethod: "WALLET",
    skipHolidays: true,
    status: "ACTIVE",
    nextTripAt: "2026-03-16T07:30:00+01:00",
    estimatedFareKm: 7.4,
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "sched_002",
    label: "Evening Return",
    pickup: { address: "Civic Towers, Victoria Island" },
    destination: { address: "12 Admiralty Way, Lekki Phase 1" },
    daysOfWeek: [1, 2, 3, 4, 5],
    time: "18:00",
    paymentMethod: "WALLET",
    skipHolidays: true,
    status: "ACTIVE",
    nextTripAt: "2026-03-16T18:00:00+01:00",
    estimatedFareKm: 7.8,
    createdAt: "2026-02-10T10:05:00Z",
  },
];

const mockUpcomingTrips = [
  {
    scheduleId: "sched_001",
    scheduleName: "Morning Commute",
    scheduledAt: "2026-03-16T07:30:00+01:00",
    pickup: { address: "12 Admiralty Way, Lekki Phase 1" },
    destination: { address: "Civic Towers, Victoria Island" },
    bookingId: null,       
    status: "SCHEDULED",   
  },
  {
    scheduleId: "sched_002",
    scheduleName: "Evening Return",
    scheduledAt: "2026-03-16T18:00:00+01:00",
    pickup: { address: "Civic Towers, Victoria Island" },
    destination: { address: "12 Admiralty Way, Lekki Phase 1" },
    bookingId: null,       
    status: "SCHEDULED",   
  }
];

const api = {
  get: async (url) => {
    await new Promise(r => setTimeout(r, 600));
    if (url === '/api/v1/recurring-bookings') return { data: mockSchedules };
    if (url === '/api/v1/recurring-bookings/upcoming') return { data: mockUpcomingTrips };
    if (url.startsWith('/api/v1/recurring-bookings/')) {
       // Mock detail fetch
       return { data: mockSchedules[0] }; 
    }
    return { data: null };
  },
  post: async (url, body) => {
    await new Promise(r => setTimeout(r, 800));
    return { data: { success: true, id: `sched_new${Date.now()}` } };
  },
  patch: async (url, body) => {
    await new Promise(r => setTimeout(r, 600));
    return { data: { success: true } };
  },
  delete: async (url) => {
    await new Promise(r => setTimeout(r, 800));
    return { data: { success: true } };
  }
};

const useRecurringStore = create((set, get) => ({

  schedules: [],        
  upcomingRides: [],    
  isLoading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],

  // ── Draft schedule state for the create wizard ──
  draftSchedule: {
    name: '',
    pickup: null,
    destination: null,
    distanceKm: null,
    durationMins: null,
    baseFare: null,
    daysOfWeek: [],
    time: '07:30',
    returnTime: '',
    hasReturn: false,
    skipHolidays: true,
    paymentMethod: 'WALLET',
  },

  updateDraft: (patch) => set(state => ({
    draftSchedule: { ...state.draftSchedule, ...patch }
  })),

  setDraftRouteData: (distanceKm, durationMins, baseFare) => set(state => ({
    draftSchedule: { ...state.draftSchedule, distanceKm, durationMins, baseFare }
  })),

  resetDraft: () => set({
    draftSchedule: {
      name: '',
      pickup: null,
      destination: null,
      distanceKm: null,
      durationMins: null,
      baseFare: null,
      daysOfWeek: [],
      time: '07:30',
      returnTime: '',
      hasReturn: false,
      skipHolidays: true,
      paymentMethod: 'WALLET',
    }
  }),

  checkConflicts: (daysOfWeek, time) => {
    const existing = get().schedules;
    return existing.filter(s => 
      s.status === 'ACTIVE' &&
      s.time === time &&
      s.daysOfWeek.some(d => daysOfWeek.includes(d))
    );
  },

  checkHolidays: (daysOfWeek) => {
    const holidays = get().nigerianHolidays2026;
    // Return next 30 days that are holidays and fall on the selected days
    const upcoming = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
      const dateStr = d.toISOString().split('T')[0];
      if (daysOfWeek.includes(dayOfWeek) && holidays.includes(dateStr)) {
        upcoming.push(dateStr);
      }
    }
    return upcoming;
  },

  setSelectedDate: (dateStr) => set({ selectedDate: dateStr }),

  getUpcomingForDate: (dateStr) => {
    return get().upcomingRides.filter(trip => 
      trip.scheduledAt.startsWith(dateStr) || 
      new Date(trip.scheduledAt).toLocaleDateString('en-GB') === new Date(dateStr).toLocaleDateString('en-GB')
    );
  },

  // Nigerian public holidays 2026
  nigerianHolidays2026: [
    "2026-01-01", // New Year
    "2026-04-03", // Good Friday
    "2026-04-06", // Easter Monday
    "2026-05-01", // Workers Day
    "2026-05-27", // Democracy Day
    "2026-06-12", // Democracy Day (observed)
    "2026-08-01", // Eid el Kabir (approx)
    "2026-10-01", // Independence Day
    "2026-12-25", // Christmas Day
    "2026-12-26", // Boxing Day
  ],

  isHoliday: (dateString) => {
    return get().nigerianHolidays2026.includes(dateString);
  },

  // Actions
  fetchSchedules: async () => { 
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/recurring-bookings');
      set({ schedules: res.data, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchUpcomingRides: async () => { 
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/recurring-bookings/upcoming');
      set({ upcomingRides: res.data, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  createSchedule: async (data) => { 
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/recurring-bookings', data);
      await get().fetchSchedules(); // Refresh lists
      await get().fetchUpcomingRides();
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  updateSchedule: async (id, data) => { 
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/api/v1/recurring-bookings/${id}`, data);
      await get().fetchSchedules();
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  pauseSchedule: async (id) => { 
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/api/v1/recurring-bookings/${id}/status`, { status: "PAUSED" });
      set(state => ({
        schedules: state.schedules.map(s => 
          s.id === id ? { ...s, status: "PAUSED" } : s
        ),
        isLoading: false
      }));
    } catch (e) {
       set({ error: e.message, isLoading: false });
    }
  },

  resumeSchedule: async (id) => { 
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/api/v1/recurring-bookings/${id}/status`, { status: "ACTIVE" });
      set(state => ({
        schedules: state.schedules.map(s => 
          s.id === id ? { ...s, status: "ACTIVE" } : s
        ),
        isLoading: false
      }));
    } catch (e) {
       set({ error: e.message, isLoading: false });
    }
  },

  deleteSchedule: async (id) => { 
     set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/recurring-bookings/${id}`);
      set(state => ({
        schedules: state.schedules.filter(s => s.id !== id),
        upcomingRides: state.upcomingRides.filter(t => t.scheduleId !== id),
        isLoading: false
      }));
    } catch (e) {
       set({ error: e.message, isLoading: false });
    }
  },
}));

export default useRecurringStore;
