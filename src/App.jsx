import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DemoAuthProvider } from './contexts/DemoAuthContext';
import { useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import UserDashboard from './components/user/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import DemoLogin from './components/demo/DemoLogin';
import DemoDashboard from './components/demo/DemoDashboard';
import QRGenerator from './components/demo/QRGenerator';
import ProtectedRoute from './components/demo/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
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
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/unauthorized" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-red-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                <p className="text-red-500 mb-6">You don't have permission to access this page.</p>
                <button 
                  onClick={() => window.history.back()} 
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DemoAuthProvider>
        <Router>
          <Routes>
            {/* Original Smart Canteen Routes */}
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
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
            
            {/* Role-based demo routes */}
            <Route 
              path="/admin-demo" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DemoDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/manager-demo" 
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <DemoDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/staff-demo" 
              element={
                <ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                  <DemoDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/unauthorized" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-red-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                    <p className="text-red-500 mb-6">You don't have permission to access this page.</p>
                    <button 
                      onClick={() => window.history.back()} 
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } 
            />
            
            {/* Default redirect to demo login */}
            <Route path="/" element={<Navigate to="/demo-login" replace />} />
            <Route path="*" element={<Navigate to="/demo-login" replace />} />
          </Routes>
          
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
  );
}

export default App;