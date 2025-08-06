import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Lock, Camera, User, Utensils } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [step, setStep] = useState('scan'); // 'scan' or 'pin'
  const [scannedData, setScannedData] = useState(null);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();
  
  const { scanQR, verifyPIN } = useAuth();

  // Demo QR codes for testing
  const demoUsers = [
    { userId: 'STU001', name: 'John Doe', qrCode: 'CANTEEN_STU001_1234567890' },
    { userId: 'ADM001', name: 'Admin User', qrCode: 'CANTEEN_ADM001_1234567891' },
    { userId: 'STF001', name: 'Staff User', qrCode: 'CANTEEN_STF001_1234567892' }
  ];

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
        (decodedText) => {
          handleQRScan(decodedText);
          scanner.clear();
          setShowScanner(false);
        },
        (error) => {
          // Ignore scan errors
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
      const result = await scanQR(qrData);
      setScannedData(result);
      setStep('pin');
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePINSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    try {
      await verifyPIN(scannedData.userId, pin);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (user) => {
    setLoading(true);
    try {
      const result = await scanQR(user.qrCode);
      setScannedData(result);
      setStep('pin');
      toast.success(`Demo login for ${user.name}. Use PIN: 1234`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetLogin = () => {
    setStep('scan');
    setScannedData(null);
    setPin('');
    stopScanner();
  };

  if (step === 'pin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Enter PIN</h1>
            <p className="text-blue-100">
              Welcome back, <span className="font-semibold">{scannedData?.name}</span>
            </p>
          </div>

          {/* PIN Form */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white border-opacity-20">
            <form onSubmit={handlePINSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength="4"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="••••"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 4}
                className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Login'}
              </button>
            </form>

            <button
              onClick={resetLogin}
              className="w-full mt-4 text-white text-sm underline hover:no-underline"
            >
              Scan different QR code
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
            <Utensils className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Smart Canteen</h1>
          <p className="text-blue-100">Scan your QR code to login</p>
        </div>

        {/* QR Scanner */}
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
              <p className="text-white mb-4">Click to start camera</p>
              <div className="flex items-center justify-center space-x-2 text-blue-100 text-sm">
                <QrCode className="h-4 w-4" />
                <span>Hold your QR code in front of the camera</span>
              </div>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
              <button
                onClick={stopScanner}
                className="w-full mt-4 bg-red-500 bg-opacity-80 text-white py-2 px-4 rounded-lg hover:bg-opacity-100 transition-colors"
              >
                Stop Scanner
              </button>
            </div>
          )}
        </div>

        {/* Demo Users */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20">
          <h3 className="text-white font-semibold mb-4 text-center">Demo Accounts</h3>
          <div className="space-y-3">
            {demoUsers.map((user) => (
              <button
                key={user.userId}
                onClick={() => handleDemoLogin(user)}
                disabled={loading}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm opacity-70">{user.userId}</div>
                  </div>
                </div>
                <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  PIN: 1234
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;