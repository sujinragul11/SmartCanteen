const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Daily sales report
router.get('/daily-sales', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'CANCELLED' }
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true
          }
        },
        orderItems: {
          include: {
            item: {
              select: {
                name: true,
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Item-wise sales
    const itemSales = {};
    orders.forEach(order => {
      order.orderItems.forEach(orderItem => {
        const itemName = orderItem.item.name;
        if (!itemSales[itemName]) {
          itemSales[itemName] = {
            name: itemName,
            category: orderItem.item.category.name,
            quantity: 0,
            revenue: 0
          };
        }
        itemSales[itemName].quantity += orderItem.quantity;
        itemSales[itemName].revenue += orderItem.price * orderItem.quantity;
      });
    });

    res.json({
      date: targetDate.toISOString().split('T')[0],
      totalSales,
      totalOrders,
      orders,
      itemSales: Object.values(itemSales)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily sales report' });
  }
});

// Wallet transactions report
router.get('/wallet-transactions', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { id: true }
      });
      if (user) {
        where.userId = user.id;
      }
    }

    const transactions = await prisma.walletTransaction.findMany({
      where,
      include: {
        user: {
          select: {
            userId: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = {
      totalCredit: 0,
      totalDebit: 0,
      totalTransactions: transactions.length
    };

    transactions.forEach(tx => {
      if (tx.type === 'CREDIT') {
        summary.totalCredit += tx.amount;
      } else {
        summary.totalDebit += Math.abs(tx.amount);
      }
    });

    res.json({
      transactions,
      summary
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet transactions report' });
  }
});

// User activity report
router.get('/user-activity', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        userId: true,
        name: true,
        email: true,
        walletBalance: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            transactions: true
          }
        }
      }
    });

    // Get total spent by each user
    const userStats = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await prisma.walletTransaction.aggregate({
          where: {
            userId: user.id,
            type: 'DEBIT'
          },
          _sum: {
            amount: true
          }
        });

        return {
          ...user,
          totalSpent: Math.abs(totalSpent._sum.amount || 0)
        };
      })
    );

    res.json(userStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user activity report' });
  }
});

module.exports = router;