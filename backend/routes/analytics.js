const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard analytics (Admin only)
router.get('/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get basic counts
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      activeUsers,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.user.count({ 
        where: { 
          role: 'USER',
          isActive: true,
          orders: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } })
    ]);

    // Get orders trend data
    const ordersTrend = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      },
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    // Process trend data by day
    const trendData = {};
    ordersTrend.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      if (!trendData[date]) {
        trendData[date] = { orders: 0, revenue: 0 };
      }
      trendData[date].orders += item._count.id;
      trendData[date].revenue += item._sum.totalAmount || 0;
    });

    // Get top selling items
    const topItems = await prisma.orderItem.groupBy({
      by: ['itemId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      },
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    // Get item details for top items
    const topItemsWithDetails = await Promise.all(
      topItems.map(async (item) => {
        const itemDetails = await prisma.item.findUnique({
          where: { id: item.itemId },
          select: { name: true, price: true, category: { select: { name: true } } }
        });
        return {
          ...itemDetails,
          totalQuantity: item._sum.quantity,
          totalOrders: item._count.id,
          revenue: itemDetails.price * item._sum.quantity
        };
      })
    );

    // Get user registration trend
    const userRegistrations = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
        role: 'USER'
      },
      _count: { id: true }
    });

    const registrationTrend = {};
    userRegistrations.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      registrationTrend[date] = (registrationTrend[date] || 0) + item._count.id;
    });

    // Get category performance
    const categoryPerformance = await prisma.orderItem.groupBy({
      by: ['itemId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      },
      _sum: { quantity: true, price: true }
    });

    // Group by category
    const categoryStats = {};
    for (const item of categoryPerformance) {
      const itemDetails = await prisma.item.findUnique({
        where: { id: item.itemId },
        select: { category: { select: { name: true } } }
      });
      
      const categoryName = itemDetails.category.name;
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = { quantity: 0, revenue: 0 };
      }
      categoryStats[categoryName].quantity += item._sum.quantity || 0;
      categoryStats[categoryName].revenue += item._sum.price || 0;
    }

    res.json({
      period,
      summary: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        activeUsers,
        pendingOrders,
        completedOrders,
        averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.totalAmount || 0) / totalOrders : 0
      },
      trends: {
        orders: trendData,
        registrations: registrationTrend
      },
      topItems: topItemsWithDetails,
      categoryPerformance: Object.entries(categoryStats).map(([name, stats]) => ({
        category: name,
        ...stats
      }))
    });
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get real-time metrics (Admin/Staff)
router.get('/realtime', authenticateToken, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [
      todayOrders,
      todayRevenue,
      activeOrders,
      avgPreparationTime,
      peakHours
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: todayStart },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: todayStart },
          status: { not: 'CANCELLED' }
        }
      }),
      prisma.order.count({
        where: {
          status: { in: ['PENDING', 'PREPARING'] }
        }
      }),
      // Calculate average preparation time (mock data for now)
      Promise.resolve(12), // minutes
      // Get peak hours data
      prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: todayStart }
        },
        _count: { id: true }
      })
    ]);

    // Process peak hours
    const hourlyData = {};
    peakHours.forEach(order => {
      const hour = order.createdAt.getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + order._count.id;
    });

    res.json({
      today: {
        orders: todayOrders,
        revenue: todayRevenue._sum.totalAmount || 0,
        activeOrders,
        avgPreparationTime
      },
      hourlyDistribution: hourlyData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch real-time data' });
  }
});

// Get user behavior analytics (Admin only)
router.get('/user-behavior', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get user segments
    const userSegments = await prisma.user.findMany({
      where: {
        role: 'USER',
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        createdAt: true,
        walletBalance: true,
        _count: {
          select: { orders: true }
        },
        orders: {
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    });

    // Analyze user behavior
    const behaviorAnalysis = userSegments.map(user => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const avgOrderValue = user._count.orders > 0 ? totalSpent / user._count.orders : 0;
      const daysSinceLastOrder = user.orders.length > 0 
        ? Math.floor((now - new Date(Math.max(...user.orders.map(o => new Date(o.createdAt))))) / (1000 * 60 * 60 * 24))
        : null;

      return {
        userId: user.id,
        totalOrders: user._count.orders,
        totalSpent,
        avgOrderValue,
        walletBalance: user.walletBalance,
        daysSinceLastOrder,
        segment: user._count.orders === 0 ? 'inactive' :
                user._count.orders < 3 ? 'new' :
                user._count.orders < 10 ? 'regular' : 'loyal'
      };
    });

    // Segment statistics
    const segments = {
      inactive: behaviorAnalysis.filter(u => u.segment === 'inactive').length,
      new: behaviorAnalysis.filter(u => u.segment === 'new').length,
      regular: behaviorAnalysis.filter(u => u.segment === 'regular').length,
      loyal: behaviorAnalysis.filter(u => u.segment === 'loyal').length
    };

    // Retention analysis
    const retentionData = await prisma.user.findMany({
      where: {
        role: 'USER',
        orders: {
          some: {
            createdAt: { gte: startDate }
          }
        }
      },
      select: {
        createdAt: true,
        orders: {
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.json({
      period,
      segments,
      behaviorAnalysis: behaviorAnalysis.slice(0, 100), // Limit for performance
      retention: {
        totalUsers: retentionData.length,
        activeUsers: retentionData.filter(u => u.orders.length > 0).length
      }
    });
  } catch (error) {
    console.error('User behavior analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user behavior data' });
  }
});

module.exports = router;