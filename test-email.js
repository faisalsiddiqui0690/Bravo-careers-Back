const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

console.log('🔍 Testing Nodemailer Configuration...\n');

// Check if credentials are set
console.log('📋 Checking Environment Variables:');
console.log('   EMAIL_HOST:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set (using default)');
console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || '465');
console.log('   EMAIL_USER:', process.env.EMAIL_USER || '❌ Not configured');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set (hidden)' : '❌ Not configured');
console.log('   OWNER_EMAIL:', process.env.OWNER_EMAIL || '❌ Not configured\n');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ ERROR: Email credentials not configured in .env file!');
  console.log('   Please update server/.env with your actual email credentials.\n');
  process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.ipshopy.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true, // true for port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true
  }
});

// Test connection
console.log('🔄 Testing SMTP connection...\n');

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection Failed!');
    console.log('   Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check if EMAIL_USER and EMAIL_PASS are correct in .env');
    console.log('   2. Verify SMTP settings: host=mail.ipshopy.com, port=465');
    console.log('   3. Check firewall settings for port 465');
    console.log('   4. Login to webmail to verify credentials work:');
    console.log('      https://d12692.bom1.stableserver.net:2096/cpsess6372496181/webmail/jupiter/index.html');
    console.log('\n   See GMAIL_APP_PASSWORD_GUIDE.md for detailed instructions.\n');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('   Email server is ready to send messages\n');
    
    // Send test email
    console.log('📧 Sending test email...\n');
    
    const testEmail = {
      from: `"IP Technologies Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: '✅ Nodemailer Test Successful!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a3cff 0%, #0029d6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; }
            .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .info-box { background: #e7f3ff; border-left: 4px solid #1a3cff; padding: 15px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Test Successful!</h1>
              <p>Your Nodemailer configuration is working correctly</p>
            </div>
            
            <div class="content">
              <div class="success-box">
                <h2>✅ Email Sent Successfully!</h2>
                <p>This is a test email to verify that your Nodemailer setup is working properly.</p>
              </div>
              
              <h3>Configuration Details:</h3>
              <ul>
                <li><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST || 'smtp.hostinger.com'}</li>
                <li><strong>SMTP Port:</strong> ${process.env.EMAIL_PORT || 465}</li>
                <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>To:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Sent At:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              
              <div class="info-box">
                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li>✅ If you received this email, your configuration is correct!</li>
                  <li>✅ You can now use the contact form to send real emails</li>
                  <li>✅ Both owner and customer emails will be sent automatically</li>
                </ol>
              </div>
              
              <p><strong>Contact Form Integration:</strong></p>
              <p>Your backend is configured to send TWO emails when someone submits the contact form:</p>
              <ul>
                <li>📧 <strong>Owner Email:</strong> ${process.env.OWNER_EMAIL || 'Not configured'} - Receives inquiry details</li>
                <li>📧 <strong>Customer Email:</strong> Auto-reply with confirmation message</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This is an automated test email from IP Technologies Contact Form System</p>
              <p>Generated at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Nodemailer Test Successful!

This is a test email to verify that your Nodemailer setup is working properly.

Configuration Details:
- SMTP Host: ${process.env.EMAIL_HOST || 'smtp.hostinger.com'}
- SMTP Port: ${process.env.EMAIL_PORT || 465}
- From: ${process.env.EMAIL_USER}
- To: ${process.env.EMAIL_USER}
- Sent At: ${new Date().toLocaleString()}

Next Steps:
1. If you received this email, your configuration is correct!
2. You can now use the contact form to send real emails
3. Both owner and customer emails will be sent automatically

Contact Form Integration:
Your backend sends TWO emails when someone submits the contact form:
- Owner Email: ${process.env.OWNER_EMAIL || 'Not configured'} - Receives inquiry details
- Customer Email: Auto-reply with confirmation message

This is an automated test email from IP Technologies Contact Form System
Generated at: ${new Date().toLocaleString()}
      `
    };
    
    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.log('❌ Failed to send test email!');
        console.log('   Error:', error.message);
        console.log('\n💡 Possible issues:');
        console.log('   - Email quota exceeded');
        console.log('   - SMTP authentication issue');
        console.log('   - Network connectivity problem\n');
        process.exit(1);
      } else {
        console.log('✅ Test Email Sent Successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('\n📬 Check your inbox:', process.env.EMAIL_USER);
        console.log('   Subject: "✅ Nodemailer Test Successful!"\n');
        console.log('🎉 Your Nodemailer setup is working perfectly!\n');
        console.log('💡 Now you can:');
        console.log('   1. Start the frontend: npm run dev (in root directory)');
        console.log('   2. Go to http://localhost:5173/contact');
        console.log('   3. Submit the contact form');
        console.log('   4. Both owner and customer will receive emails\n');
        process.exit(0);
      }
    });
  }
});
