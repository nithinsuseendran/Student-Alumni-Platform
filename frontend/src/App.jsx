import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useSocketStore from './store/socketStore';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const AlumniDashboard = lazy(() => import('./pages/AlumniDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AlumniDirectory = lazy(() => import('./pages/AlumniDirectory'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const MentorshipPage = lazy(() => import('./pages/MentorshipPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#050510] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
      <p className="text-purple-400 text-sm font-medium tracking-widest uppercase">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'alumni') return <Navigate to="/alumni-dashboard" replace />;
  return <Navigate to="/student-dashboard" replace />;
};

function App() {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
  const { initSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchMe();
      initSocket(user._id);
    }
    return () => { if (!isAuthenticated) disconnectSocket(); };
  }, [isAuthenticated, user?._id]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10,10,31,0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(168,85,247,0.3)',
            backdropFilter: 'blur(20px)',
          },
          success: { iconTheme: { primary: '#a855f7', secondary: '#050510' } },
          error: { iconTheme: { primary: '#ec4899', secondary: '#050510' } },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <DashboardRedirect /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <DashboardRedirect /> : <RegisterPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          
          <Route path="/student-dashboard" element={
            <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/alumni-dashboard" element={
            <ProtectedRoute roles={['alumni']}><AlumniDashboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/alumni" element={
            <ProtectedRoute><AlumniDirectory /></ProtectedRoute>
          } />
          <Route path="/profile/:id" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute><ChatPage /></ProtectedRoute>
          } />
          <Route path="/chat/:userId" element={
            <ProtectedRoute><ChatPage /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute><EventsPage /></ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute><JobsPage /></ProtectedRoute>
          } />
          <Route path="/mentorship" element={
            <ProtectedRoute><MentorshipPage /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><NotificationsPage /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
