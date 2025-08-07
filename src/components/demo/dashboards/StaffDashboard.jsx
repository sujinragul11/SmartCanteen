import React, { useState } from 'react';
import { useDemoAuth } from '../../../contexts/DemoAuthContext';
import { 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  LogOut,
  Calendar,
  Tasks,
  MessageSquare,
  Bell
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, logout } = useDemoAuth();
  const [activeTab, setActiveTab] = useState('tasks');

  const tabs = [
    { id: 'tasks', label: 'My Tasks', icon: Tasks },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const tasks = [
    { id: 1, title: 'Process user registrations', status: 'pending', priority: 'high', dueDate: '2024-01-15' },
    { id: 2, title: 'Update system documentation', status: 'in-progress', priority: 'medium', dueDate: '2024-01-16' },
    { id: 3, title: 'Review QR code requests', status: 'completed', priority: 'low', dueDate: '2024-01-14' },
    { id: 4, title: 'Assist with user support', status: 'pending', priority: 'high', dueDate: '2024-01-15' },
  ];

  const schedule = [
    { time: '09:00', task: 'Team standup meeting', type: 'meeting' },
    { time: '10:30', task: 'User support session', type: 'support' },
    { time: '14:00', task: 'System maintenance', type: 'maintenance' },
    { time: '16:00', task: 'Documentation review', type: 'review' },
  ];

  const messages = [
    { from: 'Manager', subject: 'Weekly report due', time: '10 minutes ago', unread: true },
    { from: 'Admin', subject: 'System update scheduled', time: '1 hour ago', unread: false },
    { from: 'Support Team', subject: 'User feedback summary', time: '2 hours ago', unread: true },
  ];

  const notifications = [
    { type: 'info', message: 'New user registration pending approval', time: '5 minutes ago' },
    { type: 'success', message: 'Task completed successfully', time: '30 minutes ago' },
    { type: 'warning', message: 'System maintenance in 2 hours', time: '1 hour ago' },
  ];

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Bell className="h-5 w-5 text-blue-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Staff Dashboard</h1>
                  <p className="text-sm text-gray-500">Daily Operations</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <span className="text-blue-700 font-medium">{user.name}</span>
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'messages' && messages.filter(m => m.unread).length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {messages.filter(m => m.unread).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
              <div className="flex space-x-2">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tasks.filter(t => t.status === 'pending').length} Pending
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {tasks.filter(t => t.status === 'in-progress').length} In Progress
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <div key={task.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTaskStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    {task.status !== 'completed' && (
                      <>
                        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                          {task.status === 'pending' ? 'Start' : 'Continue'}
                        </button>
                        {task.status === 'in-progress' && (
                          <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors">
                            Complete
                          </button>
                        )}
                      </>
                    )}
                    {task.status === 'completed' && (
                      <div className="flex-1 flex items-center justify-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
            
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {schedule.map((item, index) => (
                  <div key={index} className="p-6 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.task}</h3>
                          <p className="text-sm text-gray-500">{item.time}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                          item.type === 'support' ? 'bg-green-100 text-green-800' :
                          item.type === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y divide-gray-200">
                {messages.map((message, index) => (
                  <div key={index} className={`p-6 hover:bg-gray-50 ${message.unread ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="bg-gray-300 rounded-full h-10 w-10 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.from}
                          </h3>
                          <span className="text-sm text-gray-500">{message.time}</span>
                        </div>
                        <p className={`text-sm mt-1 ${message.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {message.subject}
                        </p>
                        {message.unread && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y divide-gray-200">
                {notifications.map((notification, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;