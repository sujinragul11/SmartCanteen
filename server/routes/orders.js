const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { generateOrderNumber, generateTokenNumber } = require('../utils/helpers');

const router = express.Router();
const prisma = new PrismaClient();

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;

    // Calculate total amount
    const itemIds = items.map(item => item.itemId);
    const itemDetails = await prisma.item.findMany({
      where: { id: { in: itemIds } }
    });

    let totalAmount = 0;
    const orderItems = [];

    for (const orderItem of items) {
      const item = itemDetails.find(i => i.id === orderItem.itemId);
      if (!item || !item.isAvailable) {
        return res.status(400).json({ error: `Item ${item?.name || 'unknown'} is not available` });
      }

      const itemTotal = item.price * orderItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        itemId: orderItem.itemId,
        quantity: orderItem.quantity,
        price: item.price
      });
    }

    // Check wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true }
    });

    if (user.walletBalance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Create order and deduct from wallet
    const orderNumber = generateOrderNumber();
    const tokenNumber = generateTokenNumber();

    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          tokenNumber,
          orderItems: {
            create: orderItems
          }
        },
        include: {
          orderItems: {
            include: {
              item: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      });

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: totalAmount
          }
        }
      });

      // Create wallet transaction
      await tx.walletTransaction.create({
        data: {
          userId,
          amount: -totalAmount,
          type: 'DEBIT',
          description: `Order payment - ${orderNumber}`,
          status: 'SUCCESS'
        }
      });

      return order;
    });

    res.status(201).json({
      success: true,
      order: result,
      message: 'Order placed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: {
            item: {
              select: {
                name: true,
                price: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all orders (Admin/Staff)
router.get('/', authenticateToken, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
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
                price: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (Staff/Admin)
router.put('/:id/status', authenticateToken, requireRole(['ADMIN', 'STAFF']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
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
                price: true
              }
            }
          }
        }
      }
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;