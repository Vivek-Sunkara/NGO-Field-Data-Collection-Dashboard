import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { WorkerLanguageProvider } from '@/context/WorkerLanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
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
import SubmissionsPage from './pages/admin/SubmissionsPage';
import SubmissionDetailViewer from './components/admin/SubmissionDetailViewer';
import AuditLogViewer from './pages/admin/AuditLogViewer';
import CreateEventPage from './pages/admin/CreateEventPage';
import CreateFormPage from './pages/admin/CreateFormPage';
import EventDetailsPage from './pages/admin/EventDetailsPage';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import FieldWorkerDashboard from './pages/worker/FieldWorkerDashboard';
import FieldSubmissionForm from './pages/worker/FieldSubmissionForm';
import WorkerEvents from './pages/worker/WorkerEvents';
import WorkerEventDetail from './pages/worker/WorkerEventDetail';
import WorkerFormPage from './pages/worker/WorkerFormPage';
import WorkerSubmissions from './pages/worker/WorkerSubmissions';
import WorkerDrafts from './pages/worker/WorkerDrafts';
import WorkerAnalytics from './pages/worker/WorkerAnalytics';
import WorkersDirectoryPage from './pages/profiles/WorkersDirectoryPage';
import WorkerProfilePage from './pages/profiles/WorkerProfilePage';
import WorkerProfileRedirect from './pages/profiles/WorkerProfileRedirect';

// Error Pages
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import HomePage from './pages/HomePage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <WorkerLanguageProvider>
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
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <AdminAnalytics />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <SubmissionsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions/:submissionId"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <SubmissionDetailViewer />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <RoleProtectedRoute allowedRoles={['Admin']}>
                <AuditLogViewer />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/create-event"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <CreateEventPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/create-form"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <CreateFormPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:eventId"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <EventDetailsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/workers"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <WorkersDirectoryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/workers/:workerId"
            element={
              <RoleProtectedRoute allowedRoles={['Admin', 'NGO_Manager']}>
                <WorkerProfilePage />
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
          <Route
            path="/worker/events"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerEvents />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/event/:eventId"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerEventDetail />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/forms/:formId"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerFormPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/submit-form"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <FieldSubmissionForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/submit-form/:draftId"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <FieldSubmissionForm />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/submissions"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerSubmissions />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/submissions/pending"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerSubmissions />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/drafts"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerDrafts />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/submissions/:submissionId"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <SubmissionDetailViewer isWorkerView={true} />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/analytics"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerAnalytics />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/workers"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkersDirectoryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/workers/:workerId"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerProfilePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/worker/profile"
            element={
              <RoleProtectedRoute allowedRoles={['Field Worker']}>
                <WorkerProfileRedirect />
              </RoleProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/not-found" element={<NotFound />} />

          {/* Public home */}
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
        </WorkerLanguageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
