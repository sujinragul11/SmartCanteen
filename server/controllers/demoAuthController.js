const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

// Demo users database (in-memory for demo purposes)
const demoUsers = [
  {
    id: 'admin001',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@smartcanteen.com'
  },
  {
    id: 'user001',
    password: 'user123',
    role: 'user',
    name: 'Regular User',
    email: 'user@smartcanteen.com'
  },
  {
    id: 'manager001',
    password: 'manager123',
    role: 'manager',
    name: 'Manager User',
    email: 'manager@smartcanteen.com'
  },
  {
    id: 'staff001',
    password: 'staff123',
    role: 'staff',
    name: 'Staff User',
    email: 'staff@smartcanteen.com'
  }
];

class DemoAuthController {
  // Standard ID/Password login
  static async login(req, res) {
    try {
      const { id, password } = req.body;

      if (!id || !password) {
        return res.status(400).json({ 
          error: 'ID and password are required' 
        });
      }

      // Find user in demo database
      const user = demoUsers.find(u => u.id === id && u.password === password);

      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          name: user.name 
        },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: `Welcome back, ${user.name}!`
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // QR Code login - scan and extract credentials
  static async qrLogin(req, res) {
    try {
      const { qrData } = req.body;

      if (!qrData) {
        return res.status(400).json({ 
          error: 'QR data is required' 
        });
      }

      let credentials;
      try {
        // Parse QR code data (expecting JSON format)
        credentials = JSON.parse(qrData);
      } catch (parseError) {
        return res.status(400).json({ 
          error: 'Invalid QR code format' 
        });
      }

      const { id, password } = credentials;

      if (!id || !password) {
        return res.status(400).json({ 
          error: 'QR code must contain id and password' 
        });
      }

      // Find user in demo database
      const user = demoUsers.find(u => u.id === id && u.password === password);

      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid QR code credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          name: user.name 
        },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        message: `QR Login successful! Welcome, ${user.name}!`
      });
    } catch (error) {
      console.error('QR Login error:', error);
      res.status(500).json({ error: 'QR login failed' });
    }
  }

  // Generate QR code for a user
  static async generateQR(req, res) {
    try {
      const { userId } = req.params;

      // Find user in demo database
      const user = demoUsers.find(u => u.id === userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Create QR code data
      const qrData = JSON.stringify({
        id: user.id,
        password: user.password,
        role: user.role
      });

      // Generate QR code as Data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      res.json({
        success: true,
        qrCode: qrCodeDataURL,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        message: 'QR code generated successfully'
      });
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(500).json({ error: 'QR generation failed' });
    }
  }

  // Get all demo users (for testing purposes)
  static async getDemoUsers(req, res) {
    try {
      const users = demoUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
        // Password excluded for security
      }));

      res.json({
        success: true,
        users,
        message: 'Demo users retrieved successfully'
      });
    } catch (error) {
      console.error('Get demo users error:', error);
      res.status(500).json({ error: 'Failed to get demo users' });
    }
  }

  // Verify token and get user info
  static async verifyToken(req, res) {
    try {
      const user = req.user; // Set by auth middleware

      res.json({
        success: true,
        user: {
          id: user.userId,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ error: 'Token verification failed' });
    }
  }

  // Logout (optional - mainly for cleanup)
  static async logout(req, res) {
    try {
      // In a more complex system, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
}

module.exports = DemoAuthController;