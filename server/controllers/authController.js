const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { sendQREmail } = require('../utils/email');

const prisma = new PrismaClient();

class AuthController {
  // QR Code Login - Step 1: Scan QR
  static async scanQR(req, res) {
    try {
      const { qrData } = req.body;

      const user = await prisma.user.findUnique({
        where: { qrCode: qrData },
        select: {
          id: true,
          userId: true,
          name: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return res.status(404).json({ 
          error: 'Invalid QR code or user inactive' 
        });
      }

      res.json({
        success: true,
        userId: user.userId,
        name: user.name,
        message: 'QR code verified. Please enter PIN.'
      });
    } catch (error) {
      console.error('QR scan error:', error);
      res.status(500).json({ error: 'QR scan failed' });
    }
  }

  // QR Code Login - Step 2: Verify PIN
  static async verifyPIN(req, res) {
    try {
      const { userId, pin } = req.body;

      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          _count: {
            select: { orders: true }
          }
        }
      });

      if (!user || !user.isActive) {
        return res.status(404).json({ 
          error: 'User not found or inactive' 
        });
      }

      const isValidPin = await bcrypt.compare(pin, user.pin);
      if (!isValidPin) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.walletBalance,
          totalOrders: user._count.orders
        }
      });
    } catch (error) {
      console.error('PIN verification error:', error);
      res.status(500).json({ error: 'PIN verification failed' });
    }
  }

  // Generate QR Code for user
  static async generateQR(req, res) {
    try {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate QR code as Data URL
      const qrCodeDataURL = await QRCode.toDataURL(user.qrCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Send QR code via email
      const emailSent = await sendQREmail(user.email, user.name, qrCodeDataURL);

      res.json({
        success: true,
        qrCode: qrCodeDataURL,
        emailSent,
        message: emailSent ? 
          'QR code generated and sent to email' : 
          'QR code generated but email failed'
      });
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(500).json({ error: 'QR generation failed' });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          role: true,
          walletBalance: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return res.status(403).json({ error: 'User not found or inactive' });
      }

      const newToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        token: newToken,
        user
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  }

  // Logout (optional - mainly for cleanup)
  static async logout(req, res) {
    try {
      // In a more complex system, you might want to blacklist the token
      // For now, we'll just return success
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

module.exports = AuthController;