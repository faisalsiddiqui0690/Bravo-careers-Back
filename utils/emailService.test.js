const nodemailer = require('nodemailer');

// Create transporter with Ethereal Email (for testing)
// Ethereal creates FAKE emails you can view online - perfect for development!
const createTransporter = async () => {
  // Generate a REAL Ethereal test account
  const testAccount = await nodemailer.createTestAccount();
  
  console.log('\n🎯 ETHEREAL TEST ACCOUNT CREATED:');
  console.log(`   Username: ${testAccount.user}`);
  console.log(`   Password: ${testAccount.pass}`);
  console.log(`   Inbox: https://ethereal.email/messages\n`);
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
};

let transporter;

// Initialize transporter asynchronously
const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

/**
 * Send email utility function
 */
const sendEmail = async ({ to, subject, html, text = '' }) => {
  const currentTransporter = await getTransporter();
  
  const mailOptions = {
    from: `"IP Technologies (Test)" <test@ethereal.email>`,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await currentTransporter.sendMail(mailOptions);
    console.log(`✅ Test email sent!`);
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error(`❌ Error sending test email:`, error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
  transporter,
};
