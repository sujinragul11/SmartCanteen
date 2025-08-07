const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: {
        id,
        userId: req.user.id
      },
      data: { isRead: true }
    });

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: {
        id,
        userId: req.user.id
      }
    });

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      // Create default settings
      settings = await prisma.notificationSettings.create({
        data: {
          userId: req.user.id,
          orderUpdates: true,
          walletUpdates: true,
          promotions: true,
          systemUpdates: true,
          emailNotifications: true,
          pushNotifications: false
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const {
      orderUpdates,
      walletUpdates,
      promotions,
      systemUpdates,
      emailNotifications,
      pushNotifications
    } = req.body;

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: req.user.id },
      update: {
        orderUpdates,
        walletUpdates,
        promotions,
        systemUpdates,
        emailNotifications,
        pushNotifications
      },
      create: {
        userId: req.user.id,
        orderUpdates: orderUpdates ?? true,
        walletUpdates: walletUpdates ?? true,
        promotions: promotions ?? true,
        systemUpdates: systemUpdates ?? true,
        emailNotifications: emailNotifications ?? true,
        pushNotifications: pushNotifications ?? false
      }
    });

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Send notification (Admin only)
router.post('/send', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { title, message, type = 'info', userIds, broadcast = false } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    let targetUserIds = [];

    if (broadcast) {
      // Send to all users
      const users = await prisma.user.findMany({
        where: { role: 'USER', isActive: true },
        select: { id: true }
      });
      targetUserIds = users.map(user => user.id);
    } else if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else {
      return res.status(400).json({ error: 'Either userIds array or broadcast flag is required' });
    }

    // Create notifications for all target users
    const notifications = await Promise.all(
      targetUserIds.map(userId =>
        prisma.notification.create({
          data: {
            userId,
            title,
            message,
            type,
            isRead: false
          }
        })
      )
    );

    res.json({
      success: true,
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Get notification statistics (Admin only)
router.get('/stats', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      recentActivity
    ] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.groupBy({
        by: ['type'],
        _count: { id: true }
      }),
      prisma.notification.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, userId: true }
          }
        }
      })
    ]);

    res.json({
      totalNotifications,
      unreadNotifications,
      readRate: totalNotifications > 0 ? ((totalNotifications - unreadNotifications) / totalNotifications * 100).toFixed(2) : 0,
      notificationsByType: notificationsByType.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {}),
      recentActivity
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

module.exports = router;