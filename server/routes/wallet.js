const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { generateUPIQR } = require('../utils/payment');

const router = express.Router();
const prisma = new PrismaClient();

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { walletBalance: true }
    });

    res.json({ balance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

// Get wallet transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Admin recharge wallet
router.post('/recharge', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { userId, amount, description = 'Admin wallet recharge' } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const user = await tx.user.update({
        where: { userId },
        data: {
          walletBalance: {
            increment: parseFloat(amount)
          }
        }
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          userId: user.id,
          amount: parseFloat(amount),
          type: 'CREDIT',
          description,
          paymentMethod: 'ADMIN_RECHARGE',
          status: 'SUCCESS'
        }
      });

      return { user, transaction };
    });

    res.json({
      success: true,
      newBalance: result.user.walletBalance,
      transaction: result.transaction
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to recharge wallet' });
  }
});

// Generate UPI QR for recharge
router.post('/generate-upi-qr', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const qrData = await generateUPIQR(amount, req.user.id);

    res.json({
      success: true,
      qrCode: qrData,
      amount: parseFloat(amount),
      instructions: 'Scan this QR code with any UPI app to recharge your wallet'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate UPI QR' });
  }
});

// Verify UPI payment (webhook/callback)
router.post('/verify-payment', async (req, res) => {
  try {
    const { transactionId, amount, userId, status } = req.body;

    // This would typically be called by payment gateway webhook
    // For demo purposes, we'll create a simple verification

    if (status === 'SUCCESS') {
      const result = await prisma.$transaction(async (tx) => {
        // Update wallet balance
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            walletBalance: {
              increment: parseFloat(amount)
            }
          }
        });

        // Create transaction record
        const transaction = await tx.walletTransaction.create({
          data: {
            userId,
            amount: parseFloat(amount),
            type: 'CREDIT',
            description: 'UPI wallet recharge',
            paymentMethod: 'UPI',
            transactionId,
            status: 'SUCCESS'
          }
        });

        return { user, transaction };
      });

      res.json({
        success: true,
        newBalance: result.user.walletBalance,
        transaction: result.transaction
      });
    } else {
      // Create failed transaction record
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: parseFloat(amount),
          type: 'CREDIT',
          description: 'Failed UPI wallet recharge',
          paymentMethod: 'UPI',
          transactionId,
          status: 'FAILED'
        }
      });

      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;