import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/public/LandingPage';
import { UserLoginPage } from '@/pages/auth/UserLoginPage';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Dashboard Pages
import Overview from '@/pages/dashboard/Overview';
import ReportIncident from '@/pages/dashboard/ReportIncident';
import LiveMap from '@/pages/dashboard/LiveMap';
import Volunteer from '@/pages/dashboard/Volunteer';
import Alerts from '@/pages/dashboard/Alerts';
import UserProfile from '@/pages/dashboard/UserProfile';

// Admin Pages
import AdminOverview from '@/pages/admin/AdminOverview';
import VerificationQueue from '@/pages/admin/VerificationQueue';
import EmergencyControl from '@/pages/admin/EmergencyControl';
import AdminLiveMap from '@/pages/admin/AdminLiveMap';
import UserManagement from '@/pages/admin/UserManagement';
import AuditLogs from '@/pages/admin/AuditLogs';

// Auth Context
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Protected Route Component (Bypassed for mock mode effectively, but keeps structure)
const ProtectedRoute = ({ children, requireAdmin = false }: { children: JSX.Element, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();

  // In mock mode, we might want to auto-login a default user if none exists, or just redirect
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Strict role check
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Unified Login Page */}
      <Route path="/login" element={<UserLoginPage />} />

      {/* Redirect old routes to new unified login */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route path="/verify-otp" element={<Navigate to="/login" replace />} />

      {/* User Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Overview />} />
        <Route path="report" element={<ReportIncident />} />
        <Route path="map" element={<LiveMap />} />
        <Route path="volunteer" element={<Volunteer />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminOverview />} />
        <Route path="verification" element={<VerificationQueue />} />
        <Route path="emergency" element={<EmergencyControl />} />
        <Route path="map" element={<AdminLiveMap />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="logs" element={<AuditLogs />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
