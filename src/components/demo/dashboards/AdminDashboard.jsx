import React, { useState, useEffect } from 'react';
import { useDemoAuth } from '../../../contexts/DemoAuthContext';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  LogOut,
  QrCode,
  Download,
  UserPlus,
  Database,
  Activity
} from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';

const AdminDashboard = () => {
  const { user, logout, generateQR, getDemoUsers } = useDemoAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState({});

  useEffect(() => {
    loadDemoUsers();
  }, []);

  const loadDemoUsers = async () => {
    setLoading(true);
    try {
      const users = await getDemoUsers();
      setDemoUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (userId) => {
    try {
      const result = await generateQR(userId);
      setQrCodes(prev => ({
        ...prev,
        [userId]: result.qrCode
      }));
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const downloadQR = (userId, qrCode) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${userId}.png`;
    link.click();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Total Users', value: demoUsers.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Admin Users', value: demoUsers.filter(u => u.role === 'admin').length, icon: Shield, color: 'bg-red-500' },
    { label: 'Active Sessions', value: '1', icon: Activity, color: 'bg-green-500' },
    { label: 'System Status', value: 'Online', icon: Database, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">System Administration</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="text-red-700 font-medium">{user.name}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center">
                        <div className={`${stat.color} rounded-lg p-3`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Admin login successful</p>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Demo users loaded</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        <Database className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">System initialized</p>
                        <p className="text-xs text-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={loadDemoUsers}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Refresh Users</span>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {demoUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* QR Codes Tab */}
        {activeTab === 'qr-codes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">QR Code Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoUsers.map(user => (
                <div key={user.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.id}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {qrCodes[user.id] ? (
                    <div className="text-center">
                      <img
                        src={qrCodes[user.id]}
                        alt={`QR Code for ${user.name}`}
                        className="w-48 h-48 mx-auto mb-4 border rounded-lg"
                      />
                      <button
                        onClick={() => downloadQR(user.id, qrCodes[user.id])}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download QR</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-gray-400" />
                      </div>
                      <button
                        onClick={() => handleGenerateQR(user.id)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Generate QR</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">QR Code Login</span>
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Session Timeout</span>
                    <span className="text-sm font-medium text-gray-900">8 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Multi-factor Auth</span>
                    <span className="text-sm font-medium text-yellow-600">Optional</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Version</span>
                    <span className="text-sm font-medium text-gray-900">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Environment</span>
                    <span className="text-sm font-medium text-blue-600">Demo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Database</span>
                    <span className="text-sm font-medium text-green-600">In-Memory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;