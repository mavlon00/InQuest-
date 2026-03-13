import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDriverStore } from './driverStore';

// Auth screens
import DriverSplash         from '../screens/auth/DriverSplash';
import DriverPhoneEntry     from '../screens/auth/DriverPhoneEntry';
import DriverOTPVerify      from '../screens/auth/DriverOTPVerify';
import DriverProfileSetup   from '../screens/auth/DriverProfileSetup';
import DriverVehicleSetup   from '../screens/auth/DriverVehicleSetup';
import DriverDocumentUpload from '../screens/auth/DriverDocumentUpload';
import DriverPendingApproval from '../screens/auth/DriverPendingApproval';
import DriverKYC            from '../screens/auth/DriverKYC';
import DriverKYCPending     from '../screens/auth/DriverKYCPending';
import DriverKYCRejected    from '../screens/auth/DriverKYCRejected';
import DriverKYCExpired     from '../screens/auth/DriverKYCExpired';

// Main app screens
import DriverHome           from '../screens/home/DriverHome';
import ActiveTrip           from '../screens/booking/ActiveTrip';
import DriverEarnings       from '../screens/earnings/DriverEarnings';
import DriverTripHistory    from '../screens/history/DriverTripHistory';
import DriverProfile        from '../screens/profile/DriverProfile';
import DriverSettings       from '../screens/settings/DriverSettings';
import WorkingBalance       from '../screens/wallet/WorkingBalance';
import MainWallet           from '../screens/wallet/MainWallet';
import MaintenanceWallet    from '../screens/wallet/MaintenanceWallet';

import '../styles/driver-tokens.css';

// ── Toast config ─────────────────────────────────────────────────
const toastOptions = {
  style: {
    background: 'var(--color-surface-2)',
    color:      'var(--color-text-primary)',
    border:     '1px solid var(--color-surface-3)',
    fontFamily: 'var(--font-sans)',
    fontSize:   '14px',
    borderRadius: '12px',
  },
  success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-surface-2)' } },
  error:   { iconTheme: { primary: 'var(--color-error)',   secondary: 'var(--color-surface-2)' } },
};

// ── Guard: Requires login ─────────────────────────────────────────
function AuthGuard() {
  const { accessToken } = useDriverStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ── Guard: KYC gate ───────────────────────────────────────────────
// Enforces the KYC state machine for all main-app routes.
// If NOT_STARTED   → /kyc
// If SUBMITTED     → /kyc/pending
// If REJECTED      → /kyc/rejected
// If EXPIRED       → /kyc/expired
// If APPROVED      → allow through
function KYCGuard() {
  const { kycStatus } = useDriverStore();

  switch (kycStatus) {
    case 'NOT_STARTED': return <Navigate to="/kyc"          replace />;
    case 'SUBMITTED':   return <Navigate to="/kyc/pending"  replace />;
    case 'REJECTED':    return <Navigate to="/kyc/rejected" replace />;
    case 'EXPIRED':     return <Navigate to="/kyc/expired"  replace />;
    case 'APPROVED':    return <Outlet />;
    default:            return <Navigate to="/kyc"          replace />;
  }
}

// ── Guard: Onboarding order ───────────────────────────────────────
// Each setup step checks the previous step is complete.
// For this demo we use driver profile completeness as the proxy.
// In production, each step marks a flag in the store / backend.
function ProfileSetupGuard() {
  const { accessToken } = useDriverStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function VehicleSetupGuard() {
  // In production: check driver.profileComplete
  // For demo we allow through (onboarding is sequential via UI)
  const { accessToken } = useDriverStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function DocumentUploadGuard() {
  const { accessToken } = useDriverStore();
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ── App ───────────────────────────────────────────────────────────
export default function DriverApp() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" gutter={8} toastOptions={toastOptions} />
      <Routes>

        {/* — Public routes — */}
        <Route path="/"            element={<DriverSplash />}    />
        <Route path="/login"       element={<DriverPhoneEntry />} />
        <Route path="/verify-otp"  element={<DriverOTPVerify />}  />

        {/* — Onboarding (requires login, no KYC check yet) — */}
        <Route element={<ProfileSetupGuard />}>
          <Route path="/setup/profile"   element={<DriverProfileSetup />}   />
        </Route>
        <Route element={<VehicleSetupGuard />}>
          <Route path="/setup/vehicle"   element={<DriverVehicleSetup />}   />
        </Route>
        <Route element={<DocumentUploadGuard />}>
          <Route path="/setup/documents" element={<DriverDocumentUpload />} />
          <Route path="/setup/pending"   element={<DriverPendingApproval />} />
        </Route>

        {/* — KYC flow (requires login, no KYC approved needed) — */}
        <Route element={<AuthGuard />}>
          <Route path="/kyc"          element={<DriverKYC />}         />
          <Route path="/kyc/pending"  element={<DriverKYCPending />}  />
          <Route path="/kyc/rejected" element={<DriverKYCRejected />} />
          <Route path="/kyc/expired"  element={<DriverKYCExpired />}  />
        </Route>

        {/* — Main app (requires login + KYC APPROVED) — */}
        <Route element={<AuthGuard />}>
          <Route element={<KYCGuard />}>
            <Route path="/home"               element={<DriverHome />}         />
            <Route path="/trip/:tripId"        element={<ActiveTrip />}         />
            <Route path="/earnings"            element={<DriverEarnings />}     />
            <Route path="/history"             element={<DriverTripHistory />}  />
            <Route path="/profile"             element={<DriverProfile />}      />
            <Route path="/settings"            element={<DriverSettings />}     />
            <Route path="/wallet/working"      element={<WorkingBalance />}     />
            <Route path="/wallet/main"         element={<MainWallet />}         />
            <Route path="/wallet/maintenance"  element={<MaintenanceWallet />}  />
          </Route>
        </Route>

        {/* — Fallback — */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
