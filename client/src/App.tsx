import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Suspense, lazy } from 'react';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import FacilitiesPage from './pages/public/FacilitiesPage';
import MembershipPage from './pages/public/MembershipPage';
import ContactPage from './pages/public/ContactPage';
import RegisterPage from './pages/public/RegisterPage';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Student portal
import PortalPage from './pages/student/PortalPage';

// Admin pages
import DashboardPage from './pages/admin/DashboardPage';
import StudentsPage from './pages/admin/StudentsPage';
import StudentDetailPage from './pages/admin/StudentDetailPage';
import AddStudentPage from './pages/admin/AddStudentPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import RecordPaymentPage from './pages/admin/RecordPaymentPage';
import PlansPage from './pages/admin/PlansPage';
import MessagesPage from './pages/admin/MessagesPage';
import SettingsPage from './pages/admin/SettingsPage';
import ApprovalsPage from './pages/admin/ApprovalsPage';

// Route guards
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireStudent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-ivory)',
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '3px solid var(--color-gold)',
        borderTop: '3px solid transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/rules" element={<Navigate to="/" replace />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Student portal */}
      <Route path="/portal" element={
        <RequireStudent><PortalPage /></RequireStudent>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <RequireAdmin><AdminLayout /></RequireAdmin>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<AddStudentPage />} />
        <Route path="students/add" element={<AddStudentPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="payments/record" element={<RecordPaymentPage />} />
        <Route path="payments/reports" element={<PaymentsPage />} />
        <Route path="memberships" element={<PlansPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="plans" element={<Navigate to="/admin/messages" replace />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-container',
            style: {
              fontFamily: 'var(--font-ui)',
              borderRadius: '8px',
              border: '1px solid rgba(201, 168, 76, 0.2)',
            },
            success: { iconTheme: { primary: '#2D6A4F', secondary: '#fff' } },
            error: { iconTheme: { primary: '#991B1B', secondary: '#fff' } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
