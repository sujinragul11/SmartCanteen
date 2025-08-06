const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate unique user ID
const generateUserId = async (role) => {
  const prefix = role === 'ADMIN' ? 'ADM' : role === 'STAFF' ? 'STF' : 'STU';
  
  let counter = 1;
  let userId;
  let exists = true;

  while (exists) {
    userId = `${prefix}${counter.toString().padStart(3, '0')}`;
    const user = await prisma.user.findUnique({ where: { userId } });
    exists = !!user;
    if (exists) counter++;
  }

  return userId;
};

// Generate QR code data
const generateQRCode = (userId) => {
  return `CANTEEN_${userId}_${Date.now()}`;
};

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  return `ORD${timestamp}`;
};

// Generate token number
const generateTokenNumber = () => {
  const date = new Date();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 99).toString().padStart(2, '0');
  return `T${hour}${minute}${random}`;
};

module.exports = {
  generateUserId,
  generateQRCode,
  generateOrderNumber,
  generateTokenNumber
};