/**
 * Email Templates for Contact Form
 * Professional HTML templates with inline styling
 */

/**
 * Owner Notification Email Template
 * Sent to business owner when contact form is submitted
 */
const createOwnerEmailTemplate = (data) => {
  const { name, email, phone, service, message } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a3cff 0%, #0029d6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">📬 New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">You have a new inquiry from your website</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">Contact Details</h2>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Name</strong>
                    <p style="margin: 5px 0 0 0; color: #1a3cff; font-size: 16px; font-weight: 500;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</strong>
                    <p style="margin: 5px 0 0 0; color: #1a3cff; font-size: 16px; font-weight: 500;">${email}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</strong>
                    <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${phone || 'Not provided'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Service Interested In</strong>
                    <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">${service || 'General Inquiry'}</p>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #ffffff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-top: 20px;">
                <strong style="color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</strong>
                <p style="margin: 10px 0 0 0; color: #333333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">This inquiry was submitted through your website's contact form.</p>
              <p style="margin: 0; color: #999999; font-size: 12px;">© ${new Date().getFullYear()} IP Technologies. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * User Auto-Reply Email Template
 * Sent to the user who submitted the contact form
 */
const createUserEmailTemplate = (data) => {
  const { name, message, service } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You - IP Technologies</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a3cff 0%, #0029d6 100%); padding: 50px 30px; text-align: center;">
              <div style="background-color: #ffffff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✅</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 600;">Thank You!</h1>
              <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">We've received your message</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 15px 0; color: #1a3cff; font-size: 24px; font-weight: 600;">Dear ${name},</h2>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for reaching out to <strong>IP Technologies</strong>. We're delighted to hear from you!
              </p>
              
              <div style="background-color: #e8f0ff; border-left: 4px solid #1a3cff; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #1a3cff; font-size: 15px; font-weight: 600;">✨ What happens next?</p>
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                  Our team will review your message and get back to you within <strong>24 hours</strong> during business days.
                </p>
              </div>
              
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 16px; font-weight: 600;">Your Message Summary:</h3>
                ${service ? `
                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                  <strong>Service Interest:</strong> <span style="color: #1a3cff;">${service}</span>
                </p>
                ` : ''}
                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="background-color: #fff9e6; border: 1px solid #ffd700; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px; font-weight: 600;">📞 Need immediate assistance?</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  If your matter is urgent, please call us at:<br>
                  <strong style="color: #1a3cff; font-size: 16px;">093425 25252</strong>
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We look forward to working with you!
              </p>
              
              <p style="margin: 20px 0 0 0; color: #333333; font-size: 16px;">
                Best regards,<br>
                <strong style="color: #1a3cff; font-size: 18px;">The IP Technologies Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e0e0e0;">
              <div style="text-align: center; margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #1a3cff; font-size: 14px; font-weight: 600;">IP Technologies</p>
                <p style="margin: 0 0 5px 0; color: #666666; font-size: 13px;">hello@iptechnologies.in</p>
                <p style="margin: 0; color: #999999; font-size: 12px;">Gyanpeeth - Campus II, Chhatrapati Sambhajinagar</p>
              </div>
              <p style="margin: 15px 0 0 0; text-align: center; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} IP Technologies. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

module.exports = {
  createOwnerEmailTemplate,
  createUserEmailTemplate,
};
