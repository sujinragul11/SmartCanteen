import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DemoAuthContext = createContext();

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};

export const DemoAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configure axios defaults
  const API_BASE_URL = 'http://localhost:3001/api';
  axios.defaults.baseURL = API_BASE_URL;

  // Set auth token in axios headers
  useEffect(() => {
    const token = localStorage.getItem('demo_auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get('/demo-auth/verify');
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post('/demo-auth/login', credentials);
      
      const { token, user: userData, message } = response.data;
      
      // Store token and set auth header
      localStorage.setItem('demo_auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(message);
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const qrLogin = async (qrData) => {
    try {
      setLoading(true);
      const response = await axios.post('/demo-auth/qr-login', { qrData });
      
      const { token, user: userData, message } = response.data;
      
      // Store token and set auth header
      localStorage.setItem('demo_auth_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setIsAuthenticated(true);
      toast.success(message);
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'QR login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async (userId) => {
    try {
      const response = await axios.get(`/demo-auth/generate-qr/${userId}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'QR generation failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getDemoUsers = async () => {
    try {
      const response = await axios.get('/demo-auth/demo-users');
      return response.data.users;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to get demo users';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('demo_auth_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    qrLogin,
    generateQR,
    getDemoUsers,
    logout,
    hasRole,
    hasAnyRole
  };

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
};