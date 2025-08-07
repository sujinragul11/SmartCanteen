import React from 'react';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import UserDashboard from './dashboards/UserDashboard';
import LoadingSpinner from '../common/LoadingSpinner';

const DemoDashboard = () => {
  const { user, loading } = useDemoAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No User Data</h2>
          <p className="text-gray-600">Please login to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'user':
      return <UserDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unknown Role</h2>
            <p className="text-gray-600">
              Role "{user.role}" is not recognized. Please contact support.
            </p>
          </div>
        </div>
      );
  }
};

export default DemoDashboard;