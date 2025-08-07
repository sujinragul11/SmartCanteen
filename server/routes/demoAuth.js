const express = require('express');
const DemoAuthController = require('../controllers/demoAuthController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Standard login with ID and password
router.post('/login', DemoAuthController.login);

// QR code login
router.post('/qr-login', DemoAuthController.qrLogin);

// Generate QR code for a user
router.get('/generate-qr/:userId', DemoAuthController.generateQR);

// Get all demo users (for testing)
router.get('/demo-users', DemoAuthController.getDemoUsers);

// Verify token
router.get('/verify', authenticateToken, DemoAuthController.verifyToken);

// Logout
router.post('/logout', authenticateToken, DemoAuthController.logout);

module.exports = router;