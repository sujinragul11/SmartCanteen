// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

// Transaction Types
export const TRANSACTION_TYPES = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT'
};

// Payment Methods
export const PAYMENT_METHODS = {
  ADMIN_RECHARGE: 'ADMIN_RECHARGE',
  UPI: 'UPI',
  CASH: 'CASH'
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  THEME: 'theme_preference'
};

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  WALLET: '/wallet',
  ORDERS: '/orders',
  MENU: '/menu',
  ADMIN: '/admin',
  STAFF: '/staff',
  UNAUTHORIZED: '/unauthorized'
};

// Validation Rules
export const VALIDATION = {
  PIN_LENGTH: 4,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PRICE: 0.01,
  MAX_PRICE: 10000,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 50
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 1
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right',
  MAX_TOASTS: 5
};

// QR Code Configuration
export const QR_CONFIG = {
  SIZE: 300,
  MARGIN: 2,
  ERROR_CORRECTION_LEVEL: 'M'
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss'
};

// Currency
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  DECIMAL_PLACES: 2
};

// Status Colors
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ORDER_STATUS.PREPARING]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ORDER_STATUS.READY]: 'bg-green-100 text-green-800 border-green-200',
  [ORDER_STATUS.DELIVERED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800 border-red-200'
};

// Role Colors
export const ROLE_COLORS = {
  [USER_ROLES.USER]: 'bg-green-100 text-green-800',
  [USER_ROLES.STAFF]: 'bg-blue-100 text-blue-800',
  [USER_ROLES.ADMIN]: 'bg-red-100 text-red-800'
};

// Default Images
export const DEFAULT_IMAGES = {
  USER_AVATAR: '/images/default-avatar.png',
  FOOD_PLACEHOLDER: '/images/food-placeholder.png',
  CATEGORY_PLACEHOLDER: '/images/category-placeholder.png'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance.',
  INVALID_QR: 'Invalid QR code.',
  INVALID_PIN: 'Invalid PIN.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  ORDER_PLACED: 'Order placed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully.',
  WALLET_RECHARGED: 'Wallet recharged successfully.',
  PIN_CHANGED: 'PIN changed successfully.',
  USER_CREATED: 'User created successfully.',
  ITEM_CREATED: 'Item created successfully.',
  CATEGORY_CREATED: 'Category created successfully.'
};

// Feature Flags
export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false,
  ENABLE_ANALYTICS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_BIOMETRIC_AUTH: false
};

export default {
  API_CONFIG,
  USER_ROLES,
  ORDER_STATUS,
  TRANSACTION_TYPES,
  PAYMENT_METHODS,
  TRANSACTION_STATUS,
  STORAGE_KEYS,
  ROUTES,
  VALIDATION,
  FILE_LIMITS,
  PAGINATION,
  TOAST_CONFIG,
  QR_CONFIG,
  DATE_FORMATS,
  CURRENCY,
  STATUS_COLORS,
  ROLE_COLORS,
  DEFAULT_IMAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURES
};