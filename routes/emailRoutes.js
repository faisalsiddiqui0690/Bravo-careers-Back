const express = require('express');
const router = express.Router();

// Use REAL email service (from .env file)
const { sendEmail } = require('../utils/emailService');
const { createOwnerEmailTemplate, createUserEmailTemplate } = require('../utils/emailTemplates');

/**
 * Validate contact form data
 */
const validateContactData = (data) => {
  const errors = [];
  
  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Please provide a valid email address');
  }
  
  // Message validation
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * POST /api/send-email
 * Send contact form emails to both owner and user
 */
router.post('/send-email', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;
    
    // Validate input data
    const validation = validateContactData({ name, email, message });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }
    
    console.log('📧 Processing contact form submission from:', email);
    
    // Prepare data for templates
    const templateData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      service: service?.trim() || 'General Inquiry',
      message: message.trim(),
    };
    
    // Create HTML email content
    const ownerHtml = createOwnerEmailTemplate(templateData);
    const userHtml = createUserEmailTemplate(templateData);
    
    // Send emails in parallel
    const emailPromises = [
      // Email to owner
      sendEmail({
        to: process.env.OWNER_EMAIL || 'info@iptechnologies.com',
        subject: `📨 New Contact Form Submission - ${templateData.service}`,
        html: ownerHtml,
      }),
      
      // Auto-reply email to user
      sendEmail({
        to: templateData.email,
        subject: 'Thank You for Contacting IP Technologies',
        html: userHtml,
      }),
    ];
    
    const results = await Promise.all(emailPromises);
    
    console.log('✅ Emails sent successfully!');
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Emails sent successfully',
      data: {
        emailsSent: results.length,
        recipient: templateData.email,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('❌ Error in send-email endpoint:', error);
    
    // Handle specific error types
    if (error.code === 'EAUTH') {
      return res.status(500).json({
        success: false,
        error: 'Email authentication failed',
        details: 'Please check your SMTP credentials',
      });
    }
    
    if (error.code === 'ENOTFOUND') {
      return res.status(500).json({
        success: false,
        error: 'SMTP connection failed',
        details: 'Unable to connect to email server',
      });
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      error: 'Failed to send emails',
      details: error.message,
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Email service is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
