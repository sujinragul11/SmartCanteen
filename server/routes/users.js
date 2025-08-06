const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { generateUserId, generateQRCode } = require('../utils/helpers');

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, email, phone, photo, pin, role = 'USER' } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate unique user ID
    const userId = await generateUserId(role);
    
    // Generate QR code data
    const qrCode = generateQRCode(userId);
    
    // Hash PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    const user = await prisma.user.create({
      data: {
        userId,
        name,
        email,
        phone,
        photo,
        qrCode,
        pin: hashedPin,
        role
      },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, photo, isActive, pin } = req.body;

    const updateData = { name, email, phone, photo, isActive };
    
    // Hash new PIN if provided
    if (pin) {
      updateData.pin = await bcrypt.hash(pin, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalance: true,
        isActive: true,
        createdAt: true
      }
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        photo: true,
        role: true,
        walletBalance: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;