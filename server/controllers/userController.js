const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateUserId, generateQRCode } = require('../utils/helpers');

const prisma = new PrismaClient();

class UserController {
  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 50, search, role } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { userId: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
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
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Create new user (Admin only)
  static async createUser(req, res) {
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
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // Update user
  static async updateUser(req, res) {
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
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Get user profile
  static async getUserProfile(req, res) {
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

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  // Update own profile
  static async updateProfile(req, res) {
    try {
      const { name, email, phone, photo } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { name, email, phone, photo },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          photo: true,
          role: true,
          walletBalance: true,
          createdAt: true
        }
      });

      res.json({ success: true, user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Change PIN
  static async changePIN(req, res) {
    try {
      const { currentPin, newPin } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current PIN
      const isValidPin = await bcrypt.compare(currentPin, user.pin);
      if (!isValidPin) {
        return res.status(401).json({ error: 'Current PIN is incorrect' });
      }

      // Hash new PIN
      const hashedNewPin = await bcrypt.hash(newPin, 10);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { pin: hashedNewPin }
      });

      res.json({ success: true, message: 'PIN changed successfully' });
    } catch (error) {
      console.error('Change PIN error:', error);
      res.status(500).json({ error: 'Failed to change PIN' });
    }
  }

  // Delete user (Admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user has any orders
      const orderCount = await prisma.order.count({
        where: { userId: id }
      });

      if (orderCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete user with existing orders' 
        });
      }

      await prisma.user.delete({
        where: { id }
      });

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // Get user statistics (Admin only)
  static async getUserStats(req, res) {
    try {
      const stats = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      });

      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { isActive: true }
      });

      const recentUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          id: true,
          name: true,
          userId: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      res.json({
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        roleDistribution: stats,
        recentUsers
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  }
}

module.exports = UserController;