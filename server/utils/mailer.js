const nodemailer = require('nodemailer');

const emailService = process.env.EMAIL_SERVICE || 'smtp';
const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587;
const emailSecure = process.env.EMAIL_SECURE === 'true';

const transporterConfig = emailService === 'sendgrid'
  ? {
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    }
  : {
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };

const transporter = nodemailer.createTransport(transporterConfig);

transporter.verify()
  .then(() => console.log('Mailer transporter is ready'))
  .catch((err) => console.error('Mailer transporter error:', err));

async function sendVerificationEmail(userEmail, token) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:19006';
  const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `Smartnest <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Verify your Smartnest account',
    html: `
      <h1>Verify Your Email</h1>
      <p>Thank you for creating a Smartnest account. Click the link below to verify your email address:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email Sent', { to: userEmail, messageId: info.messageId });
  return info;
}

module.exports = {
  transporter,
  sendVerificationEmail
};
