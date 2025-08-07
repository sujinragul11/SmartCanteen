import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus,
  Utensils,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pin: '',
    confirmPin: ''
  });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // PIN validation
    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (formData.pin.length !== 4) {
      newErrors.pin = 'PIN must be exactly 4 digits';
    } else if (!/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must contain only numbers';
    }

    // Confirm PIN validation
    if (!formData.confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for PIN fields (only allow digits)
    if (name === 'pin' || name === 'confirmPin') {
      const numericValue = value.replace(/\D/g, '').slice(0, 4);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'phone') {
      // Format phone number
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/users', {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone || null,
        pin: formData.pin,
        role: 'USER'
      });

      toast.success('Account created successfully! Please login with your credentials.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      
      // Handle specific errors
      if (error.response?.status === 400 && errorMessage.includes('email')) {
        setErrors({ email: 'This email is already registered' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (fieldName) => {
    if (errors[fieldName]) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (formData[fieldName] && !errors[fieldName]) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
            <Utensils className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Join Smart Canteen</h1>
          <p className="text-blue-100">Create your account to get started</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white border-opacity-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-white text-opacity-70" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border ${
                    errors.name ? 'border-red-400' : 'border-white border-opacity-30'
                  } rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent`}
                  placeholder="Enter your full name"
                  required
                />
                <div className="absolute right-3 top-3">
                  {getFieldIcon('name')}
                </div>
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-300">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-white text-opacity-70" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border ${
                    errors.email ? 'border-red-400' : 'border-white border-opacity-30'
                  } rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent`}
                  placeholder="Enter your email address"
                  required
                />
                <div className="absolute right-3 top-3">
                  {getFieldIcon('email')}
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-300">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-white text-opacity-70" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border ${
                    errors.phone ? 'border-red-400' : 'border-white border-opacity-30'
                  } rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent`}
                  placeholder="Enter your phone number"
                />
                <div className="absolute right-3 top-3">
                  {getFieldIcon('phone')}
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-300">{errors.phone}</p>
              )}
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                4-Digit PIN *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-white text-opacity-70" />
                <input
                  type={showPin ? 'text' : 'password'}
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  maxLength="4"
                  className={`w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border ${
                    errors.pin ? 'border-red-400' : 'border-white border-opacity-30'
                  } rounded-lg text-white placeholder-white placeholder-opacity-70 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent`}
                  placeholder="••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-white text-opacity-70 hover:text-opacity-100"
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.pin && (
                <p className="mt-1 text-sm text-red-300">{errors.pin}</p>
              )}
            </div>

            {/* Confirm PIN Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm PIN *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-white text-opacity-70" />
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  name="confirmPin"
                  value={formData.confirmPin}
                  onChange={handleChange}
                  maxLength="4"
                  className={`w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border ${
                    errors.confirmPin ? 'border-red-400' : 'border-white border-opacity-30'
                  } rounded-lg text-white placeholder-white placeholder-opacity-70 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent`}
                  placeholder="••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3 top-3 text-white text-opacity-70 hover:text-opacity-100"
                >
                  {showConfirmPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPin && (
                <p className="mt-1 text-sm text-red-300">{errors.confirmPin}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="small" color="blue" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium underline hover:no-underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Link */}
        <div className="mt-6 text-center">
          <Link 
            to="/demo-login" 
            className="text-blue-100 text-sm underline hover:no-underline"
          >
            Try Demo Version
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;