const nodemailer = require('nodemailer');

async function sendOtpEmail(email, code, purpose) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
    const error = new Error('Email delivery is not configured');
    error.statusCode = 503;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
  });
  const subject = purpose === 'verification' ? 'Verify your Bookstore email' : 'Reset your Bookstore password';
  const action = purpose === 'verification' ? 'verify your email' : 'reset your password';

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject,
    text: `Use this code to ${action}: ${code}. It expires in 10 minutes.`,
  });
}

module.exports = { sendOtpEmail };