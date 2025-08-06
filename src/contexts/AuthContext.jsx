import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  const API_BASE_URL = 'http://localhost:3001/api';
  axios.defaults.baseURL = API_BASE_URL;

  // Set auth token in axios headers
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/users/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const scanQR = async (qrData) => {
    try {
      const response = await axios.post('/auth/scan-qr', { qrData });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'QR scan failed');
    }
  };

  const verifyPIN = async (userId, pin) => {
    try {
      const response = await axios.post('/auth/verify-pin', { userId, pin });
      
      const { token, user: userData } = response.data;
      
      // Store token and set auth header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'PIN verification failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUserBalance = (newBalance) => {
    setUser(prev => prev ? { ...prev, walletBalance: newBalance } : null);
  };

  const value = {
    user,
    loading,
    scanQR,
    verifyPIN,
    logout,
    updateUserBalance,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};