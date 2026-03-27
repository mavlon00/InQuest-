import { create } from 'zustand';

// --- MOCK API FOR SUBSCRIPTIONS ---
const mockActiveSubscription = {
  id: "sub_abc123",
  plan: "commuter",
  kmTotal: 100,
  kmUsed: 34.7,
  kmRemaining: 65.3,
  ratePerKm: 100,
  purchasedAt: "2026-03-01T08:00:00Z",
  expiresAt: "2026-03-31T08:00:00Z",
  daysRemaining: 16,
  autoRenew: false,
  status: "active",
  tripsThisCycle: 7,
  savedThisCycle: 1400,  // NGN saved vs standard rate
};

const mockPlans = [
  { id: 'starter', name: 'Starter', kmTotal: 50, price: 5500, ratePerKm: 110, standardRate: 120, isPopular: false },
  { id: 'commuter', name: 'Commuter', kmTotal: 100, price: 10000, ratePerKm: 100, standardRate: 120, isPopular: true },
  { id: 'premium', name: 'Premium', kmTotal: 200, price: 18000, ratePerKm: 90, standardRate: 120, isPopular: false },
  { id: 'unlimited', name: 'Unlimited', kmTotal: 300, price: 24000, ratePerKm: 80, standardRate: 120, isPopular: false },
];

const mockHistory = [
  {
    id: "sub_xyz789",
    plan: "starter",
    kmTotal: 50,
    kmUsed: 50,
    kmRemaining: 0,
    ratePerKm: 110,
    purchasedAt: "2026-01-15T08:00:00Z",
    expiresAt: "2026-02-14T08:00:00Z",
    status: "expired",
    tripsThisCycle: 12,
    savedThisCycle: 500,
  }
];

const api = {
  get: async (url) => {
    await new Promise(r => setTimeout(r, 600));
    if (url === '/api/v1/subscriptions/active') return { data: mockActiveSubscription };
    if (url === '/api/v1/subscriptions/history') return { data: mockHistory };
    if (url === '/api/v1/subscriptions/plans') return { data: mockPlans };
    return { data: null };
  },
  post: async (url, body) => {
    await new Promise(r => setTimeout(r, 800));
    return { data: { success: true } };
  }
};

const useSubscriptionStore = create((set, get) => ({

  // State
  activeSubscription: null,
  history: [],
  plans: [],
  isLoading: false,
  error: null,

  // ── Aliases used by original pages/book components ──
  // `subscription` = alias for `activeSubscription`
  get subscription() { return get().activeSubscription; },
  // `tiers` = alias for `plans`  
  get tiers() { return get().plans; },
  // `savingsThisCycle` = the savedThisCycle field on the active sub
  get savingsThisCycle() { return get().activeSubscription?.savedThisCycle ?? 0; },

  // Actions
  fetchActiveSubscription: async () => { 
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/subscriptions/active');
      set({ activeSubscription: res.data, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchHistory: async () => { 
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/subscriptions/history');
      set({ history: res.data, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/subscriptions/plans');
      set({ plans: res.data, isLoading: false });
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  // Alias for original components that call fetchTiers()
  fetchTiers: async () => {
    return get().fetchPlans();
  },

  // Toggle auto-renewal on the active subscription
  toggleAutoRenewal: async (newValue) => {
    set(state => ({
      activeSubscription: state.activeSubscription
        ? { ...state.activeSubscription, autoRenew: newValue }
        : null
    }));
    // In production this would call the API
  },

  subscribe: async (planId) => { 
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/subscriptions', { planId });
      
      const plan = get().plans.find(p => p.id === planId);
      if (!plan) throw new Error("Plan not found");

      set(state => {
        const currentSub = state.activeSubscription;
        const isRenewal = currentSub && currentSub.plan === planId;
        
        const newSub = {
          id: `sub_${Math.random().toString(36).substr(2, 9)}`,
          plan: planId,
          kmTotal: plan.kmTotal,
          // If renewal, add to existing. If change, start fresh (common pattern)
          kmUsed: isRenewal ? currentSub.kmUsed : 0,
          kmRemaining: isRenewal ? (currentSub.kmRemaining + plan.kmTotal) : plan.kmTotal,
          ratePerKm: plan.ratePerKm,
          purchasedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 30,
          autoRenew: currentSub?.autoRenew || false,
          status: "active",
          tripsThisCycle: isRenewal ? currentSub.tripsThisCycle : 0,
          savedThisCycle: isRenewal ? currentSub.savedThisCycle : 0,
        };

        return { activeSubscription: newSub, isLoading: false };
      });
    } catch (e) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  cancelSubscription: async (id) => { 
    set({ isLoading: true, error: null });
    try {
      await api.post(`/api/v1/subscriptions/${id}/cancel`);
      set(state => ({
        activeSubscription: state.activeSubscription ? {
          ...state.activeSubscription,
          autoRenew: false
        } : null,
        isLoading: false
      }));
    } catch (e) {
      set({ error: e.message, isLoading: false });
    }
  },

  deductKm: (kmUsedActual) => {
    // Called after IoT confirms trip distance
    set(state => {
      if (!state.activeSubscription) return { activeSubscription: null };
      
      const newUsed = state.activeSubscription.kmUsed + kmUsedActual;
      const newRemaining = Math.max(0, state.activeSubscription.kmTotal - newUsed);
      
      return {
        activeSubscription: {
          ...state.activeSubscription,
          kmUsed: newUsed,
          kmRemaining: newRemaining,
        }
      };
    });
  },

  // Computed helpers
  getKmPercent: () => {
    const sub = get().activeSubscription;
    if (!sub) return 0;
    return (sub.kmRemaining / sub.kmTotal) * 100;
  },
  
  getKmColor: () => {
    const pct = get().getKmPercent();
    if (pct > 30) return "var(--color-km-full)";
    if (pct > 10) return "var(--color-km-low)";
    return "var(--color-km-empty)";
  },

  isExpiringSoon: () => {
    const sub = get().activeSubscription;
    return sub && sub.daysRemaining <= 3;
  },
}));

export default useSubscriptionStore;
