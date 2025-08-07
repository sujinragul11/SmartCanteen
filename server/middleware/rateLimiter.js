const rateLimit = require('express-rate-limit');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// PIN verification rate limiter (very restrictive)
const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 PIN attempts per windowMs
  message: {
    error: 'Too many PIN attempts',
    message: 'Too many PIN verification attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation rate limiter
const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 orders per minute
  message: {
    error: 'Too many orders',
    message: 'Too many order attempts, please wait before placing another order.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Wallet recharge rate limiter
const walletLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 wallet operations per 5 minutes
  message: {
    error: 'Too many wallet operations',
    message: 'Too many wallet operations, please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  pinLimiter,
  orderLimiter,
  walletLimiter
};