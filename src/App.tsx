import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { FarmerModeProvider } from './context/FarmerModeContext';
import { BuyerModeProvider } from './context/BuyerModeContext';
import { LogisticsModeProvider } from './context/LogisticsModeContext';
import Navbar from './components/shared/Navbar';
import LoadingSpinner from './components/shared/LoadingSpinner';
import ProtectedRoute from './components/shared/ProtectedRoute';

// ── Lazy imports ──────────────────────────────────────────────────────────────
const LandingPage        = lazy(() => import('./components/landing/LandingPage'));
const AuthPage           = lazy(() => import('./components/auth/AuthPage'));

// Farmer
const FarmerDashboard    = lazy(() => import('./components/farmer/FarmerDashboard'));
const FarmerProfile      = lazy(() => import('./components/farmer/FarmerProfile'));
const RegisterStraw      = lazy(() => import('./components/farmer/RegisterStraw'));
const FindBuyers         = lazy(() => import('./components/farmer/FindBuyers'));
const MyTransactions     = lazy(() => import('./components/farmer/MyTransactions'));
const GreenCertificates  = lazy(() => import('./components/farmer/GreenCertificates'));
const FireAlertsPage     = lazy(() => import('./pages/FireAlertsPage'));

// Buyer
const BuyerDashboard     = lazy(() => import('./components/buyer/BuyerDashboard'));
const BuyerOverview      = lazy(() => import('./components/buyer/BuyerOverview'));
const PostDemand         = lazy(() => import('./components/buyer/PostDemand'));
const IncomingRequests   = lazy(() => import('./components/buyer/IncomingRequests'));
const TrackDeliveries    = lazy(() => import('./components/buyer/TrackDeliveries'));
const ComplianceReport   = lazy(() => import('./components/buyer/ComplianceReport'));
const PaymentHistory     = lazy(() => import('./components/buyer/PaymentHistory'));

// Logistics
const LogisticsDashboard    = lazy(() => import('./components/baler/LogisticsDashboard'));
const LogisticsProfile      = lazy(() => import('./components/baler/LogisticsProfile'));
const AvailableJobs         = lazy(() => import('./components/baler/AvailableJobs'));
const CurrentJob            = lazy(() => import('./components/baler/CurrentJob'));
const LogisticsEarnings     = lazy(() => import('./components/baler/LogisticsEarnings'));
const LogisticsPaymentHistory = lazy(() => import('./components/baler/LogisticsPaymentHistory'));

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AuthProvider>
          <FarmerModeProvider>
            <BuyerModeProvider>
              <LogisticsModeProvider>
                <div className="font-body text-[#1c1c1a] antialiased">
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: { background: '#1c1c1a', color: '#fff', borderRadius: '12px', fontFamily: '"DM Sans", sans-serif' },
                      success: { iconTheme: { primary: '#2d8a47', secondary: '#fff' } },
                    }}
                  />
                  <Navbar />
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Public */}
                      <Route path="/"     element={<LandingPage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/fire-alerts" element={<FireAlertsPage />} />

                      {/* Farmer */}
                      <Route path="/farmer" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>}>
                        <Route index               element={<FarmerProfile />} />
                        <Route path="register"     element={<RegisterStraw />} />
                        <Route path="buyers"       element={<FindBuyers />} />
                        <Route path="transactions" element={<MyTransactions />} />
                        <Route path="certificates" element={<GreenCertificates />} />
                      </Route>

                      {/* Buyer */}
                      <Route path="/buyer" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>}>
                        <Route index             element={<BuyerOverview />} />
                        <Route path="demand"     element={<PostDemand />} />
                        <Route path="requests"   element={<IncomingRequests />} />
                        <Route path="track"      element={<TrackDeliveries />} />
                        <Route path="compliance" element={<ComplianceReport />} />
                        <Route path="payments"   element={<PaymentHistory />} />
                      </Route>

                      {/* Logistics — /baler redirects to /logistics */}
                      <Route path="/baler" element={<Navigate to="/logistics" replace />} />
                      <Route path="/logistics" element={<ProtectedRoute role="baler"><LogisticsDashboard /></ProtectedRoute>}>
                        <Route index           element={<LogisticsProfile />} />
                        <Route path="jobs"     element={<AvailableJobs />} />
                        <Route path="current"  element={<CurrentJob />} />
                        <Route path="earnings" element={<LogisticsEarnings />} />
                        <Route path="history"  element={<LogisticsPaymentHistory />} />
                      </Route>

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              </LogisticsModeProvider>
            </BuyerModeProvider>
          </FarmerModeProvider>
        </AuthProvider>
      </LangProvider>
    </BrowserRouter>
  );
}

