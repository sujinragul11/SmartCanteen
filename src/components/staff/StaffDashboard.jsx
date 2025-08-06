import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  LogOut,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/orders', {
        params: { status: filter }
      });
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PREPARING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READY': return 'bg-green-100 text-green-800 border-green-200';
      case 'DELIVERED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => order.status !== 'DELIVERED' && order.status !== 'CANCELLED');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Kitchen Dashboard</h1>
              <button
                onClick={fetchOrders}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                title="Refresh orders"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Staff: {user.name}</span>
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

      {/* Status Filter */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['PENDING', 'PREPARING', 'READY'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  filter === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {status} ({orders.filter(o => o.status === status).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KOT Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredOrders().map(order => (
            <div 
              key={order.id} 
              className={`bg-white rounded-lg shadow-md border-l-4 ${
                order.status === 'PENDING' ? 'border-l-yellow-400' :
                order.status === 'PREPARING' ? 'border-l-blue-400' :
                'border-l-green-400'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Token #{order.tokenNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Order #{order.orderNumber}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{order.user.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">ID: {order.user.userId}</p>
                  <p className="text-sm text-gray-600">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-800 border-b pb-2">Items to Prepare:</h4>
                  {order.orderItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.item.name}</h5>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600 bg-blue-50 rounded-full w-8 h-8 flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Start Preparing</span>
                    </button>
                  )}
                  
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark as Ready</span>
                    </button>
                  )}
                  
                  {order.status === 'READY' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Mark as Delivered</span>
                    </button>
                  )}
                </div>

                {/* Total Amount */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {getFilteredOrders().length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {filter.toLowerCase()} orders</h3>
            <p className="text-gray-600">
              {filter === 'PENDING' 
                ? 'All caught up! No new orders to prepare.' 
                : `No orders in ${filter.toLowerCase()} status.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;