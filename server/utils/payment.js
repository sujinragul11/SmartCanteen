const QRCode = require('qrcode');

const generateUPIQR = async (amount, userId) => {
  try {
    const upiId = process.env.UPI_ID || 'canteen@paytm';
    const name = process.env.UPI_NAME || 'Smart Canteen';
    const transactionId = `TXN_${userId}_${Date.now()}`;
    
    // UPI payment string format
    const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Wallet Recharge - ${transactionId}`)}&tr=${transactionId}`;
    
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate UPI QR code');
  }
};

module.exports = { generateUPIQR };