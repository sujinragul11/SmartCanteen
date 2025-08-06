const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories with items
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        items: {
          where: { isAvailable: true },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            isAvailable: true
          }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create category (Admin only)
router.post('/categories', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, image } = req.body;

    const category = await prisma.category.create({
      data: { name, image }
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Create item (Admin only)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description, price, image, categoryId } = req.body;

    const item = await prisma.item.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item (Admin only)
router.put('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId, isAvailable } = req.body;

    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        image,
        categoryId,
        isAvailable
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item (Admin only)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.item.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;