const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  // Support both SMTP_ and EMAIL_ prefixes for flexibility
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null; // Return null if not configured properly
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  return transporter;
};

// Verify connection — called once at startup after dotenv is loaded
const verifyConnection = () => {
  const t = getTransporter();
  
  if (!t) {
    console.log('\n⚠️  Email service is not configured properly');
    console.log('   Contact form will not work until email is configured');
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || process.env.EMAIL_HOST || 'NOT SET'}`);
    console.log(`   SMTP_USER: ${process.env.SMTP_USER || process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || process.env.EMAIL_PORT || 'NOT SET'}\n`);
    return;
  }

  t.verify((error) => {
    if (error) {
      console.error('❌ Email configuration error:', error.message);
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check if SMTP_USER and SMTP_PASS are correct in .env');
      console.log(`   2. Current Host: ${process.env.SMTP_HOST || process.env.EMAIL_HOST}`);
      console.log(`   3. Current Port: ${process.env.SMTP_PORT || process.env.EMAIL_PORT || 465}`);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
};

/**
 * Send email utility function
 */
const sendEmail = async ({ to, subject, html, text = '' }) => {
  const t = getTransporter();

  if (!t) {
    console.error('❌ Cannot send email: Transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'IP Technologies'}" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  };

  const info = await t.sendMail(mailOptions);
  console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
};

module.exports = { sendEmail, verifyConnection };
