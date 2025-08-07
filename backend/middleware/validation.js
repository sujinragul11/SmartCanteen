@@ .. @@
 const { body, param, query, validationResult } = require('express-validator');

 // Middleware to handle validation errors
 const handleValidationErrors = (req, res, next) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({
       error: 'Validation failed',
       details: errors.array()
     });
   }
   next();
 };

+// Enhanced user validation rules
+const validateUserRegistration = [
+  body('name')
+    .trim()
+    .isLength({ min: 2, max: 100 })
+    .withMessage('Name must be between 2 and 100 characters')
+    .matches(/^[a-zA-Z\s]+$/)
+    .withMessage('Name can only contain letters and spaces'),
+  body('email')
+    .isEmail()
+    .normalizeEmail()
+    .withMessage('Please provide a valid email address')
+    .custom(async (email) => {
+      const { PrismaClient } = require('@prisma/client');
+      const prisma = new PrismaClient();
+      const existingUser = await prisma.user.findUnique({ where: { email } });
+      if (existingUser) {
+        throw new Error('Email is already registered');
+      }
+      await prisma.$disconnect();
+    }),
+  body('phone')
+    .optional()
+    .isMobilePhone('en-IN')
+    .withMessage('Please provide a valid Indian mobile number'),
+  body('pin')
+    .isLength({ min: 4, max: 4 })
+    .isNumeric()
+    .withMessage('PIN must be exactly 4 digits'),
+  body('role')
+    .optional()
+    .isIn(['USER', 'STAFF', 'ADMIN'])
+    .withMessage('Role must be USER, STAFF, or ADMIN'),
+  handleValidationErrors
+];

 // User validation rules
 const validateUserCreation = [
@@ .. @@
   handleValidationErrors
 ];

+// Enhanced order validation
+const validateOrderCreation = [
+  body('items')
+    .isArray({ min: 1 })
+    .withMessage('Order must contain at least one item'),
+  body('items.*.itemId')
+    .notEmpty()
+    .isUUID()
+    .withMessage('Valid item ID is required'),
+  body('items.*.quantity')
+    .isInt({ min: 1, max: 50 })
+    .withMessage('Quantity must be between 1 and 50'),
+  handleValidationErrors
+];

-// Order validation rules
-const validateOrderCreation = [
-  body('items')
-    .isArray({ min: 1 })
-    .withMessage('Order must contain at least one item'),
-  body('items.*.itemId')
-    .notEmpty()
-    .withMessage('Item ID is required'),
-  body('items.*.quantity')
-    .isInt({ min: 1 })
-    .withMessage('Quantity must be a positive integer'),
-  handleValidationErrors
-];

+// Enhanced wallet validation
+const validateWalletRecharge = [
+  body('userId')
+    .notEmpty()
+    .withMessage('User ID is required'),
+  body('amount')
+    .isFloat({ min: 1, max: 10000 })
+    .withMessage('Amount must be between ₹1 and ₹10,000'),
+  body('description')
+    .optional()
+    .trim()
+    .isLength({ max: 200 })
+    .withMessage('Description must not exceed 200 characters'),
+  handleValidationErrors
+];

-// Wallet validation rules
-const validateWalletRecharge = [
-  body('userId')
-    .notEmpty()
-    .withMessage('User ID is required'),
-  body('amount')
-    .isFloat({ min: 0.01 })
-    .withMessage('Amount must be a positive number'),
-  body('description')
-    .optional()
-    .trim()
-    .isLength({ max: 200 })
-    .withMessage('Description must not exceed 200 characters'),
-  handleValidationErrors
-];

+// Notification validation
+const validateNotification = [
+  body('title')
+    .trim()
+    .isLength({ min: 1, max: 100 })
+    .withMessage('Title must be between 1 and 100 characters'),
+  body('message')
+    .trim()
+    .isLength({ min: 1, max: 500 })
+    .withMessage('Message must be between 1 and 500 characters'),
+  body('type')
+    .optional()
+    .isIn(['info', 'success', 'warning', 'error'])
+    .withMessage('Type must be info, success, warning, or error'),
+  body('userIds')
+    .optional()
+    .isArray()
+    .withMessage('User IDs must be an array'),
+  body('broadcast')
+    .optional()
+    .isBoolean()
+    .withMessage('Broadcast must be a boolean'),
+  handleValidationErrors
+];

 module.exports = {
   handleValidationErrors,
+  validateUserRegistration,
   validateUserCreation,
   validateUserUpdate,
   validateItemCreation,
   validateItemUpdate,
   validateCategoryCreation,
   validateOrderCreation,
   validateWalletRecharge,
+  validateNotification,
   validateQRScan,
   validatePINVerification,
   validateObjectId,
   validateUserId,
   validateDateQuery,
   validatePaginationQuery
 };