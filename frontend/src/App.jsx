import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DemoAuthProvider } from './contexts/DemoAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserDashboard from './components/user/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import DemoLogin from './components/demo/DemoLogin';
import DemoDashboard from './components/demo/DemoDashboard';
import QRGenerator from './components/demo/QRGenerator';
import ProtectedRoute from './components/demo/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';

// Protected Route Component
const ProtectedRouteWrapper = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'USER':
      return <UserDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'STAFF':
      return <StaffDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Main App Component
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRouteWrapper>
              <DashboardRouter />
            </ProtectedRouteWrapper>
          } 
        />
        
        {/* Role-based Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRouteWrapper allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRouteWrapper>
          } 
        />
        
        <Route 
          path="/staff" 
          element={
            <ProtectedRouteWrapper allowedRoles={['STAFF', 'ADMIN']}>
              <StaffDashboard />
            </ProtectedRouteWrapper>
          } 
        />
        
        {/* Demo Authentication System Routes */}
        <Route path="/demo-login" element={<DemoLogin />} />
        <Route 
          path="/demo-dashboard" 
          element={
            <ProtectedRoute>
              <DemoDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/qr-generator" element={<QRGenerator />} />
        
        {/* Error Pages */}
        <Route 
          path="/unauthorized" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-red-50">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-red-800 mb-2">403 - Access Denied</h1>
                <p className="text-red-600 mb-6">You don't have permission to access this page.</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          } 
        />
        
        <Route path="/404" element={<NotFound />} />
        
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/demo-login" replace />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </div>
  );
};

// Root App Component
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DemoAuthProvider>
            <Router>
              <AppContent />
              
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#10B981',
                    },
                  },
                  error: {
                    style: {
                      background: '#EF4444',
                    },
                  },
                }}
              />
            </Router>
          </DemoAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;