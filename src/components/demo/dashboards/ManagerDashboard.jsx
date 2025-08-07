import React, { useState, useEffect } from 'react';
import { useDemoAuth } from '../../../contexts/DemoAuthContext';
import { 
  Users, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';

const ManagerDashboard = () => {
  const { user, logout, getDemoUsers } = useDemoAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Team Members', value: demoUsers.filter(u => u.role !== 'admin').length, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Staff', value: demoUsers.filter(u => u.role === 'staff').length, icon: Activity, color: 'bg-green-500' },
    { label: 'Regular Users', value: demoUsers.filter(u => u.role === 'user').length, icon: User, color: 'bg-purple-500' },
    { label: 'Tasks Completed', value: '12', icon: CheckCircle, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { action: 'Staff member logged in', user: 'Staff User', time: '2 minutes ago', type: 'login' },
    { action: 'User registration approved', user: 'New User', time: '15 minutes ago', type: 'approval' },
    { action: 'Report generated', user: 'System', time: '1 hour ago', type: 'report' },
    { action: 'Team meeting scheduled', user: 'Manager', time: '2 hours ago', type: 'schedule' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Manager Dashboard</h1>
                  <p className="text-sm text-gray-500">Team & Operations Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
                <span className="text-purple-700 font-medium">{user.name}</span>
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
                      ? 'border-purple-500 text-purple-600'
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Overview</h2>
              
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`rounded-full p-2 ${
                            activity.type === 'login' ? 'bg-green-100' :
                            activity.type === 'approval' ? 'bg-blue-100' :
                            activity.type === 'report' ? 'bg-purple-100' :
                            'bg-orange-100'
                          }`}>
                            {activity.type === 'login' && <Activity className="h-4 w-4 text-green-600" />}
                            {activity.type === 'approval' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'report' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                            {activity.type === 'schedule' && <Clock className="h-4 w-4 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">Manage Team</p>
                            <p className="text-sm text-gray-500">View and manage team members</p>
                          </div>
                        </div>
                      </button>
                      
                      <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900">Generate Report</p>
                            <p className="text-sm text-gray-500">Create performance reports</p>
                          </div>
                        </div>
                      </button>
                      
                      <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Settings className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">System Settings</p>
                            <p className="text-sm text-gray-500">Configure system preferences</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
              <button
                onClick={loadDemoUsers}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Refresh Team</span>
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
                        Team Member
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
                    {demoUsers.filter(u => u.role !== 'admin').map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-600" />
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

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Staff Productivity</span>
                    <span className="text-sm font-medium text-green-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">User Satisfaction</span>
                    <span className="text-sm font-medium text-blue-600">4.8/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Task Completion</span>
                    <span className="text-sm font-medium text-purple-600">87%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Active Users</span>
                    <span className="text-sm font-medium text-gray-900">{demoUsers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Login Success Rate</span>
                    <span className="text-sm font-medium text-green-600">99.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">System Uptime</span>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Manager Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Auto-approve new users</span>
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Email notifications</span>
                    <span className="text-sm font-medium text-blue-600">Daily digest</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Report frequency</span>
                    <span className="text-sm font-medium text-gray-900">Weekly</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Control</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Manage Staff</span>
                    <span className="text-sm font-medium text-green-600">Full Access</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">View Reports</span>
                    <span className="text-sm font-medium text-green-600">Full Access</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">System Settings</span>
                    <span className="text-sm font-medium text-yellow-600">Limited</span>
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

export default ManagerDashboard;