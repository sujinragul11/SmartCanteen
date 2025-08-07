import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode,
  CreditCard,
  History
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const WalletPage = () => {
  const { user, updateUserBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [upiQR, setUpiQR] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/wallet/transactions');
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const generateUPIQR = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setGeneratingQR(true);
    try {
      const response = await axios.post('/wallet/generate-upi-qr', {
        amount: parseFloat(rechargeAmount)
      });
      
      setUpiQR(response.data);
      toast.success('UPI QR code generated successfully');
    } catch (error) {
      toast.error('Failed to generate UPI QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const simulatePayment = async () => {
    if (!upiQR) return;

    try {
      const response = await axios.post('/wallet/verify-payment', {
        transactionId: `TXN_${Date.now()}`,
        amount: upiQR.amount,
        userId: user.id,
        status: 'SUCCESS'
      });

      toast.success(`Payment successful! New balance: ₹${response.data.newBalance.toFixed(2)}`);
      updateUserBalance(response.data.newBalance);
      setUpiQR(null);
      setRechargeAmount('');
      setShowRecharge(false);
      fetchTransactions();
    } catch (error) {
      toast.error('Payment verification failed');
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'CREDIT' ? (
      <ArrowDownLeft className="h-5 w-5 text-green-600" />
    ) : (
      <ArrowUpRight className="h-5 w-5 text-red-600" />
    );
  };

  const getTransactionColor = (type) => {
    return type === 'CREDIT' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Wallet Balance</h2>
            </div>
            <p className="text-3xl font-bold">₹{user.walletBalance.toFixed(2)}</p>
            <p className="text-blue-100 text-sm mt-1">Available for orders</p>
          </div>
          <button
            onClick={() => setShowRecharge(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Money</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowRecharge(true)}
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Add Money</h3>
              <p className="text-sm text-gray-500">Recharge your wallet</p>
            </div>
          </div>
        </button>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Transactions</h3>
              <p className="text-sm text-gray-500">{transactions.length} total</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <QrCode className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Quick Pay</h3>
              <p className="text-sm text-gray-500">Scan & pay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {transaction.description}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                      {transaction.paymentMethod && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-1">
                          {transaction.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'CREDIT' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.status === 'SUCCESS' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recharge Modal */}
      {showRecharge && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Money to Wallet</h3>
                <button
                  onClick={() => {
                    setShowRecharge(false);
                    setUpiQR(null);
                    setRechargeAmount('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {!upiQR ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to Add
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 200, 500].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setRechargeAmount(amount.toString())}
                        className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={generateUPIQR}
                    disabled={generatingQR || !rechargeAmount}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {generatingQR ? <LoadingSpinner size="small" color="white" /> : <QrCode className="h-4 w-4" />}
                    <span>Generate UPI QR</span>
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <img
                      src={upiQR.qrCode}
                      alt="UPI QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  
                  <div>
                    <p className="text-lg font-semibold text-gray-900">₹{upiQR.amount}</p>
                    <p className="text-sm text-gray-600 mb-4">{upiQR.instructions}</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={simulatePayment}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      Simulate Payment Success
                    </button>
                    <button
                      onClick={() => setUpiQR(null)}
                      className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Generate New QR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;