const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendQREmail = async (email, name, qrCodeDataURL) => {
  try {
    // Convert data URL to attachment
    const base64Data = qrCodeDataURL.split(',')[1];
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Smart Canteen QR Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Welcome to Smart Canteen System!</h2>
          <p>Dear ${name},</p>
          <p>Your account has been created successfully. Please find your QR code attached to this email.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>How to use your QR code:</h3>
            <ol>
              <li>Save the QR code image to your phone</li>
              <li>Visit the Smart Canteen login page</li>
              <li>Click "Scan QR Code" and show your QR code to the scanner</li>
              <li>Enter your 4-digit PIN when prompted</li>
              <li>Start ordering!</li>
            </ol>
          </div>
          
          <p><strong>Important:</strong> Keep your QR code secure and don't share it with others.</p>
          
          <p>If you have any questions, please contact the canteen administrator.</p>
          
          <p>Best regards,<br>Smart Canteen Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'qr-code.png',
          content: base64Data,
          encoding: 'base64',
          cid: 'qrcode'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = { sendQREmail };