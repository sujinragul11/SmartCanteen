const { PrismaClient } = require('@prisma/client');

// Create a single instance of PrismaClient
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Handle connection events
prisma.$on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...');
});

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
const disconnect = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};

module.exports = {
  prisma,
  testConnection,
  disconnect
};