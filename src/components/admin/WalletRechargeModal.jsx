import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import axios from 'axios';
import toast from 'react-hot-toast';

const WalletRechargeModal = ({ isOpen, onClose, user, onRechargeComplete }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const rechargeAmount = parseFloat(amount);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/wallet/recharge', {
        userId: user.userId,
        amount: rechargeAmount,
        description: description || `Admin wallet recharge for ${user.name}`
      });

      toast.success(`Wallet recharged successfully! New balance: ₹${response.data.newBalance.toFixed(2)}`);
      onRechargeComplete();
      onClose();
      setAmount('');
      setDescription('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to recharge wallet');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recharge Wallet</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Recharging wallet for:</div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.userId} • {user.email}</div>
            <div className="text-sm text-green-600 font-medium">
              Current Balance: ₹{user.walletBalance.toFixed(2)}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recharge Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Reason for recharge..."
              />
            </div>

            {amount && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">
                  New balance will be: ₹{(user.walletBalance + parseFloat(amount || 0)).toFixed(2)}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !amount}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? <LoadingSpinner size="small" color="white" /> : null}
                <span>Recharge Wallet</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WalletRechargeModal;