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

// User validation rules
const validateUserCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('pin')
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage('PIN must be exactly 4 digits'),
  body('role')
    .optional()
    .isIn(['USER', 'STAFF', 'ADMIN'])
    .withMessage('Role must be USER, STAFF, or ADMIN'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('pin')
    .optional()
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage('PIN must be exactly 4 digits'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

// Item validation rules
const validateItemCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  handleValidationErrors
];

const validateItemUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .optional()
    .notEmpty()
    .withMessage('Category ID cannot be empty'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  handleValidationErrors
];

// Category validation rules
const validateCategoryCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
  handleValidationErrors
];

// Order validation rules
const validateOrderCreation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.itemId')
    .notEmpty()
    .withMessage('Item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  handleValidationErrors
];

// Wallet validation rules
const validateWalletRecharge = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  handleValidationErrors
];

// Auth validation rules
const validateQRScan = [
  body('qrData')
    .notEmpty()
    .withMessage('QR data is required'),
  handleValidationErrors
];

const validatePINVerification = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('pin')
    .isLength({ min: 4, max: 4 })
    .isNumeric()
    .withMessage('PIN must be exactly 4 digits'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .notEmpty()
    .withMessage('ID parameter is required'),
  handleValidationErrors
];

const validateUserId = [
  param('userId')
    .notEmpty()
    .withMessage('User ID parameter is required'),
  handleValidationErrors
];

// Query validation
const validateDateQuery = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format'),
  handleValidationErrors
];

const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserCreation,
  validateUserUpdate,
  validateItemCreation,
  validateItemUpdate,
  validateCategoryCreation,
  validateOrderCreation,
  validateWalletRecharge,
  validateQRScan,
  validatePINVerification,
  validateObjectId,
  validateUserId,
  validateDateQuery,
  validatePaginationQuery
};