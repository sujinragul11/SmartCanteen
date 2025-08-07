import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  User, 
  Lock, 
  QrCode, 
  Camera, 
  Eye, 
  EyeOff,
  LogIn,
  Smartphone,
  Shield
} from 'lucide-react';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const DemoLogin = () => {
  const [loginMethod, setLoginMethod] = useState('credentials'); // 'credentials' or 'qr'
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const scannerRef = useRef(null);
  const navigate = useNavigate();
  
  const { login, qrLogin, getDemoUsers, isAuthenticated } = useDemoAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/demo-dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadDemoUsers();
  }, []);

  const loadDemoUsers = async () => {
    try {
      const users = await getDemoUsers();
      setDemoUsers(users);
    } catch (error) {
      console.error('Failed to load demo users:', error);
    }
  };

  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    
    if (!credentials.id || !credentials.password) {
      toast.error('Please enter both ID and password');
      return;
    }

    setLoading(true);
    try {
      await login(credentials);
      navigate('/demo-dashboard');
    } catch (error) {
      // Error is already handled in the context
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUserLogin = async (user) => {
    setLoading(true);
    try {
      await login({ id: user.id, password: getPasswordForDemo(user.id) });
      navigate('/demo-dashboard');
    } catch (error) {
      // Error is already handled in the context
    } finally {
      setLoading(false);
    }
  };

  const getPasswordForDemo = (userId) => {
    const passwordMap = {
      'admin001': 'admin123',
      'user001': 'user123',
      'manager001': 'manager123',
      'staff001': 'staff123'
    };
    return passwordMap[userId] || 'demo123';
  };

  const initScanner = () => {
    setShowScanner(true);
    
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      scanner.render(
        async (decodedText) => {
          await handleQRScan(decodedText);
          scanner.clear();
          setShowScanner(false);
        },
        (error) => {
          // Ignore scan errors - they're frequent during scanning
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setShowScanner(false);
  };

  const handleQRScan = async (qrData) => {
    setLoading(true);
    try {
      await qrLogin(qrData);
      navigate('/demo-dashboard');
    } catch (error) {
      // Error is already handled in the context
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Shield;
      case 'manager': return User;
      case 'staff': return User;
      case 'user': return User;
      default: return User;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Demo Auth System</h1>
          <p className="text-indigo-100">Complete authentication with QR code support</p>
        </div>

        {/* Login Method Toggle */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-2 mb-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setLoginMethod('credentials');
                stopScanner();
              }}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                loginMethod === 'credentials'
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <LogIn className="h-4 w-4 inline mr-2" />
              ID & Password
            </button>
            <button
              onClick={() => {
                setLoginMethod('qr');
                setCredentials({ id: '', password: '' });
              }}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                loginMethod === 'qr'
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <QrCode className="h-4 w-4 inline mr-2" />
              QR Code
            </button>
          </div>
        </div>

        {/* Credentials Login */}
        {loginMethod === 'credentials' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white border-opacity-20 mb-6">
            <form onSubmit={handleCredentialLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  User ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-white text-opacity-70" />
                  <input
                    type="text"
                    name="id"
                    value={credentials.id}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Enter your ID (e.g., admin001)"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-white text-opacity-70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-white text-opacity-70 hover:text-opacity-100"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-indigo-600 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? <LoadingSpinner size="small" color="blue" /> : <LogIn className="h-5 w-5" />}
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>
          </div>
        )}

        {/* QR Code Scanner */}
        {loginMethod === 'qr' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white border-opacity-20 mb-6">
            {!showScanner ? (
              <div className="text-center">
                <button
                  onClick={initScanner}
                  disabled={loading}
                  className="inline-flex items-center justify-center w-32 h-32 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 mb-4"
                >
                  <Camera className="h-16 w-16 text-white" />
                </button>
                <p className="text-white mb-4">Click to start QR scanner</p>
                <div className="flex items-center justify-center space-x-2 text-indigo-100 text-sm">
                  <Smartphone className="h-4 w-4" />
                  <span>Scan QR code to login instantly</span>
                </div>
              </div>
            ) : (
              <div>
                <div id="qr-reader" className="rounded-lg overflow-hidden mb-4"></div>
                <button
                  onClick={stopScanner}
                  className="w-full bg-red-500 bg-opacity-80 text-white py-2 px-4 rounded-lg hover:bg-opacity-100 transition-colors"
                >
                  Stop Scanner
                </button>
              </div>
            )}
          </div>
        )}

        {/* Demo Users */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20">
          <h3 className="text-white font-semibold mb-4 text-center">Demo Accounts</h3>
          <div className="space-y-3">
            {demoUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <button
                  key={user.id}
                  onClick={() => handleDemoUserLogin(user)}
                  disabled={loading}
                  className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <RoleIcon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm opacity-70">{user.id}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-white bg-opacity-10 rounded-lg">
            <p className="text-xs text-indigo-100 text-center">
              Click any demo account to login instantly, or use the credentials above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;