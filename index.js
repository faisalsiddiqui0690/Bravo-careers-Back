const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const { verifyConnection } = require('./utils/emailService');

const { sequelize, testConnection } = require('./config/database');
const migrate = require('./scripts/migrate');
const emailRoutes = require('./routes/emailRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const createContentRouter = require('./routes/contentRoutes');
const { Blog, News } = require('./models');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const careerRoutes   = require('./routes/careerRoutes');
const enquiryRoutes  = require('./routes/enquiryRoutes');
const adminManagementRoutes = require('./routes/adminManagementRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', emailRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', createContentRouter(Blog, 'blogs'));
app.use('/api/news', createContentRouter(News, 'news', true));
app.use('/api/careers',   careerRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin/manage', adminManagementRoutes);

console.log('✅ Email routes loaded');
console.log('✅ Service routes loaded at /api/services');
console.log('✅ Review routes loaded at /api/reviews');
console.log('✅ Blog and news routes loaded');
console.log('✅ Admin auth routes loaded at /api/v1/admin/auth');
console.log('✅ Admin management routes loaded at /api/v1/admin/manage');

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bravo Careers API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      sendEmail: 'POST /api/send-email',
      services: {
        list: 'GET /api/services',
        get: 'GET /api/services/:id',
        create: 'POST /api/services',
        update: 'PUT /api/services/:id',
        delete: 'DELETE /api/services/:id',
      },
      reviews: {
        list: 'GET /api/reviews',
        get: 'GET /api/reviews/:id',
        create: 'POST /api/reviews',
        update: 'PUT /api/reviews/:id',
        delete: 'DELETE /api/reviews/:id',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, async () => {
  console.log('\n🚀 ========================================');
  console.log(`🌐 Bravo Careers API running on port ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log('========================================\n');

  // Verify email config after env is fully loaded
  verifyConnection();

  // Connect to DB and run migrations + seed (creates tables & super admin if not exist)
  await migrate();
});
