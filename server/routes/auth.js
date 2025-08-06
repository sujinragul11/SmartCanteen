const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { sendQREmail } = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

// QR Code Login - Step 1: Scan QR
router.post('/scan-qr', async (req, res) => {
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
      return res.status(404).json({ error: 'Invalid QR code or user inactive' });
    }

    res.json({
      success: true,
      userId: user.userId,
      name: user.name,
      message: 'QR code verified. Please enter PIN.'
    });
  } catch (error) {
    res.status(500).json({ error: 'QR scan failed' });
  }
});

// QR Code Login - Step 2: Verify PIN
router.post('/verify-pin', async (req, res) => {
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
      return res.status(404).json({ error: 'User not found or inactive' });
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
    res.status(500).json({ error: 'PIN verification failed' });
  }
});

// Generate QR Code for user
router.post('/generate-qr/:userId', async (req, res) => {
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
      message: emailSent ? 'QR code generated and sent to email' : 'QR code generated but email failed'
    });
  } catch (error) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

module.exports = router;