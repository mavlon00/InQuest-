import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from './store';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import OnSpotBooking from './pages/book/OnSpotBooking';
import PersonalBookingLocation from './pages/book/PersonalBookingLocation';
import PersonalBookingEstimate from './pages/book/PersonalBookingEstimate';
import PersonalBookingOptions from './pages/book/PersonalBookingOptions';
import PersonalBookingConfirm from './pages/book/PersonalBookingConfirm';
import PersonalBookingSearching from './pages/book/PersonalBookingSearching';
import PersonalBookingScheduled from './pages/book/PersonalBookingScheduled';
import PersonalBookingDriverMatched from './pages/book/PersonalBookingDriverMatched';
import PersonalBookingTracking from './pages/book/PersonalBookingTracking';
import PersonalBookingComplete from './pages/book/PersonalBookingComplete';
import PersonalBookingRating from './pages/book/PersonalBookingRating';
import RecurringBooking from './pages/book/RecurringBooking';
import ManageRecurring from './pages/book/ManageRecurring';
import Wallet from './pages/Wallet';
import Trips from './pages/Trips';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// On-Spot Booking Pages
import OnSpotHome from './pages/book/OnSpotHome';
import OnSpotWalkUp from './pages/book/OnSpotWalkUp';
import OnSpotTracking from './pages/book/OnSpotTracking';
import OnSpotComplete from './pages/book/OnSpotComplete';
import OnSpotRating from './pages/book/OnSpotRating';

// Subscription Pages
import SubscriptionHome from './pages/subscription/SubscriptionHome';
import SubscriptionCheckout from './pages/subscription/SubscriptionCheckout';
import SubscriptionHistory from './pages/subscription/SubscriptionHistory';
import TapAndRide from './pages/subscription/TapAndRide';
import FareEstimator from './pages/FareEstimator';

// Recurring Booking Pages
import RecurringBookingHome from './pages/book/RecurringBookingHome';
import RecurringBookingCreate from './pages/book/RecurringBookingCreate';
import RecurringBookingDetail from './pages/book/RecurringBookingDetail';
import RecurringBookingEdit from './pages/book/RecurringBookingEdit';

// Driver Pages
import DriverHome from './pages/driver/DriverHome';

// Tracking Flows
import LiveTracking from './pages/tracking/LiveTracking';
import DestinationAlarm from './pages/tracking/DestinationAlarm';
import SOSScreen from './pages/tracking/SOSScreen';
import TripComplete from './pages/tracking/TripComplete';

// Trip Sub-pages
import TripDetail from './pages/trips/TripDetail';
import Receipt from './pages/trips/Receipt';
import DisputeFiling from './pages/trips/DisputeFiling';
import LostAndFound from './pages/trips/LostAndFound';

// Wallet Sub-pages
import WalletTopup from './pages/wallet/WalletTopup';
import WalletTransfer from './pages/wallet/WalletTransfer';
import TransactionPIN from './pages/wallet/TransactionPIN';
import GreenWallet from './pages/wallet/GreenWallet';
import WalletHistory from './pages/wallet/WalletHistory';

// Notification Sub-pages
import NotificationSettings from './pages/notifications/NotificationSettings';

// Profile Sub-pages
import MyCard from './pages/profile/MyCard';
import PhysicalCard from './pages/profile/PhysicalCard';
import SavedPlaces from './pages/profile/SavedPlaces';
import GuardianMode from './pages/profile/GuardianMode';
import WatchARide from './pages/profile/WatchARide';
import GreenRewards from './pages/profile/GreenRewards';
import Referrals from './pages/profile/Referrals';
import PaymentMethods from './pages/profile/PaymentMethods';
import CorporateAccount from './pages/profile/CorporateAccount';
import LanguageSettings from './pages/profile/LanguageSettings';
import ThemeSettings from './pages/profile/ThemeSettings';
import HelpSupport from './pages/profile/HelpSupport';
import SupportChat from './pages/profile/SupportChat';

// Overlays and Global UI
import ActiveTripBanner from './components/ActiveTripBanner';
import DriverPanel from './components/DriverPanel';
import SOSButton from './components/SOSButton';
import SOSOverlay from './components/SOSOverlay';
import CallOverlay from './components/CallOverlay';
import ChatOverlay from './components/ChatOverlay';
import CancelTripModal from './components/CancelTripModal';
import AddPaymentMethodSheet from './components/AddPaymentMethodSheet';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';

const ProtectedRoute = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/register" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return <Outlet />;
};

const GlobalLayout = () => {
  const theme = useStore((state) => state.theme);
  const booking = useStore((state) => state.booking);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showBanner = booking.status !== 'IDLE' && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';
  const showPanel = ['ACCEPTED', 'EN_ROUTE', 'ARRIVING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETING'].includes(booking.status);
  const showSOS = booking.status === 'IN_PROGRESS';
  const showBottomNav = ['/home', '/trips', '/wallet', '/notifications', '/profile'].some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans flex flex-col relative overflow-hidden">
      
      {showBanner && <ActiveTripBanner />}

      <div className="flex-1 relative overflow-y-auto">
        <Outlet />
      </div>

      {showPanel && (
        booking.driver ? <DriverPanel /> : (
          <div id="driver-panel" className="fixed bottom-0 inset-x-0 h-20 bg-[var(--color-surface-1)] flex items-center justify-center border-t border-[var(--color-border-subtle)]">
            <RefreshCw className="animate-spin text-[var(--color-primary)]" />
          </div>
        )
      )}
      {showSOS && <SOSButton />}

      <CallOverlay />
      <ChatOverlay />
      <CancelTripModal />
      <Toast />
      <TripComplete />
      <SOSOverlay />
      <AddPaymentMethodSheet />
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/splash" element={<Splash />} />

          <Route element={<PublicRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/home" element={<Home />} />
            
            {/* New On-Spot Booking Flow */}
            <Route path="/book/onspot" element={<OnSpotHome />} />
            <Route path="/book/onspot/walkup" element={<OnSpotWalkUp />} />
            <Route path="/book/onspot/tracking/:bookingId" element={<OnSpotTracking />} />
            <Route path="/book/onspot/complete/:bookingId" element={<OnSpotComplete />} />
            <Route path="/book/onspot/rating/:bookingId" element={<OnSpotRating />} />
            
            {/* New Personal Booking Flow */}
            <Route path="/book/personal" element={<PersonalBookingLocation />} />
            <Route path="/book/personal/estimate" element={<PersonalBookingEstimate />} />
            <Route path="/book/personal/options" element={<PersonalBookingOptions />} />
            <Route path="/book/personal/confirm" element={<PersonalBookingConfirm />} />
            <Route path="/book/personal/searching" element={<PersonalBookingSearching />} />
            <Route path="/book/personal/scheduled" element={<PersonalBookingScheduled />} />
            <Route path="/book/personal/matched" element={<PersonalBookingDriverMatched />} />
            <Route path="/book/personal/tracking/:bookingId" element={<PersonalBookingTracking />} />
            <Route path="/book/personal/complete/:bookingId" element={<PersonalBookingComplete />} />
            <Route path="/book/personal/rate/:bookingId" element={<PersonalBookingRating />} />

            <Route path="/book/recurring" element={<RecurringBookingHome />} />
            <Route path="/book/recurring/create" element={<RecurringBookingCreate />} />
            <Route path="/book/recurring/:scheduleId" element={<RecurringBookingDetail />} />
            <Route path="/book/recurring/:scheduleId/edit" element={<RecurringBookingEdit />} />
            <Route path="/book/recurring/manage" element={<ManageRecurring />} />

            {/* Subscription Flow */}
            <Route path="/subscription" element={<SubscriptionHome />} />
            <Route path="/subscription/checkout/:tierId" element={<SubscriptionCheckout />} />
            <Route path="/subscription/history" element={<SubscriptionHistory />} />
            <Route path="/subscription/estimate" element={<FareEstimator />} />
            <Route path="/tap-and-ride" element={<TapAndRide />} />

            {/* Driver Flow */}
            <Route path="/driver/home" element={<DriverHome />} />

            <Route path="/tracking/:rideId" element={<LiveTracking />} />
            <Route path="/tracking/:rideId/alarm" element={<DestinationAlarm />} />
            <Route path="/trip-complete/:rideId" element={<TripComplete />} />

            <Route path="/wallet" element={<Wallet />} />
            <Route path="/wallet/topup" element={<WalletTopup />} />
            <Route path="/wallet/transfer" element={<WalletTransfer />} />
            <Route path="/wallet/pin" element={<TransactionPIN />} />
            <Route path="/wallet/green" element={<GreenWallet />} />
            <Route path="/wallet/history" element={<WalletHistory />} />

            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/:tripId" element={<TripDetail />} />
            <Route path="/trips/:tripId/receipt" element={<Receipt />} />
            <Route path="/trips/:tripId/dispute" element={<DisputeFiling />} />
            <Route path="/trips/:tripId/lost-item" element={<LostAndFound />} />

            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notifications/settings" element={<NotificationSettings />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/card" element={<MyCard />} />
            <Route path="/profile/card/physical" element={<PhysicalCard />} />
            <Route path="/profile/saved-places" element={<SavedPlaces />} />
            <Route path="/profile/guardians" element={<GuardianMode />} />
            <Route path="/profile/guardians/watch" element={<WatchARide />} />
            <Route path="/profile/green-rewards" element={<GreenRewards />} />
            <Route path="/profile/referrals" element={<Referrals />} />
            <Route path="/profile/payments" element={<PaymentMethods />} />
            <Route path="/profile/corporate" element={<CorporateAccount />} />
            <Route path="/profile/language" element={<LanguageSettings />} />
            <Route path="/profile/theme" element={<ThemeSettings />} />
            <Route path="/profile/help" element={<HelpSupport />} />
            <Route path="/profile/help/chat" element={<SupportChat />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

