import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastContainer } from '@/components/Toast';

// Route Guards
import { ProtectedRoute, RoleProtectedRoute, AuthRoute } from '@/routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyRegistrationOTP from './pages/auth/VerifyRegistrationOTP';
import VerifyLoginOTP from './pages/auth/VerifyLoginOTP';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import FieldWorkerDashboard from './pages/worker/FieldWorkerDashboard';

// Error Pages
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route path="/verify-registration-otp" element={<VerifyRegistrationOTP />} />
          <Route path="/verify-login-otp" element={<VerifyLoginOTP />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Field Worker Routes */}
          <Route
            path="/worker/dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <FieldWorkerDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
