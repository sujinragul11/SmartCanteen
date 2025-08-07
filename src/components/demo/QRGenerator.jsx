import React, { useState, useEffect } from 'react';
import { useDemoAuth } from '../../contexts/DemoAuthContext';
import { QrCode, Download, User, Copy, Check } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const QRGenerator = () => {
  const { getDemoUsers, generateQR } = useDemoAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState({});
  const [copiedCredentials, setCopiedCredentials] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const demoUsers = await getDemoUsers();
      setUsers(demoUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (userId) => {
    try {
      const result = await generateQR(userId);
      setQrCodes(prev => ({
        ...prev,
        [userId]: result.qrCode
      }));
      toast.success(`QR code generated for ${result.user.name}`);
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const downloadQR = (userId, qrCode) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qr-code-${userId}.png`;
    link.click();
    toast.success('QR code downloaded');
  };

  const copyCredentials = (user) => {
    const credentials = JSON.stringify({
      id: user.id,
      password: getPasswordForDemo(user.id),
      role: user.role
    });
    
    navigator.clipboard.writeText(credentials).then(() => {
      setCopiedCredentials(prev => ({ ...prev, [user.id]: true }));
      toast.success('Credentials copied to clipboard');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedCredentials(prev => ({ ...prev, [user.id]: false }));
      }, 2000);
    }).catch(() => {
      toast.error('Failed to copy credentials');
    });
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
          <p className="text-gray-600">Generate QR codes for demo authentication</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow-lg p-6">
              {/* User Info */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{user.id}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {user.role.toUpperCase()}
                </span>
              </div>

              {/* Credentials */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Login Credentials:</div>
                <div className="text-sm font-mono">
                  <div>ID: {user.id}</div>
                  <div>Password: {getPasswordForDemo(user.id)}</div>
                </div>
                <button
                  onClick={() => copyCredentials(user)}
                  className="mt-2 w-full flex items-center justify-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  {copiedCredentials[user.id] ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code Display */}
              {qrCodes[user.id] ? (
                <div className="text-center mb-4">
                  <img
                    src={qrCodes[user.id]}
                    alt={`QR Code for ${user.name}`}
                    className="w-full max-w-48 mx-auto mb-3 border rounded-lg"
                  />
                  <button
                    onClick={() => downloadQR(user.id, qrCodes[user.id])}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download QR</span>
                  </button>
                </div>
              ) : (
                <div className="text-center mb-4">
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                  <button
                    onClick={() => handleGenerateQR(user.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Generate QR</span>
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="text-xs text-gray-500 text-center">
                <p>Scan this QR code with the demo login page to authenticate instantly</p>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use QR Codes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Generate QR Code</h3>
              <p className="text-sm text-gray-600">Click "Generate QR" for any demo user to create their authentication QR code.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Scan with Login Page</h3>
              <p className="text-sm text-gray-600">Go to the demo login page and use the QR scanner to scan the generated code.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Instant Login</h3>
              <p className="text-sm text-gray-600">The user will be automatically logged in and redirected to their role-based dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;