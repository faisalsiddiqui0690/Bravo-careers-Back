const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Service } = require('../models');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/services');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log('📎 Service image upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Accept any file that starts with image/ MIME type
    if (file.mimetype.startsWith('image/')) {
      console.log('✅ File accepted');
      return cb(null, true);
    }
    
    // Also check file extension as fallback
    const allowedExtensions = /\.(jpeg|jpg|jfif|jpe|png|gif|webp|bmp|svg)$/i;
    if (allowedExtensions.test(file.originalname)) {
      console.log('✅ File accepted by extension');
      return cb(null, true);
    }
    
    console.log('❌ File rejected');
    cb(new Error('Only image files are allowed'));
  }
});

/**
 * POST /api/services/upload - Upload service image
 */
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    console.log('📤 Service upload endpoint hit!');
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }
    
    console.log('✅ File received:', req.file.filename);
    const imageUrl = `/uploads/services/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        imageUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('❌ Error uploading service image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
    });
  }
});

console.log('✅ Service upload route registered at POST /api/services/upload');

/**
 * GET /api/services - Get all services
 */
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['id', 'ASC']],
    });
    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
    });
  }
});

/**
 * GET /api/services/:id - Get a single service
 */
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }
    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('❌ Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service',
    });
  }
});

/**
 * POST /api/services - Create a new service
 */
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating service with data:', req.body);
    const { icon, title, description } = req.body;
    
    if (!title || !description) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const service = await Service.create({
      icon: icon || '',
      title,
      description,
    });
    
    console.log('✅ Service created successfully:', service.id);
    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('❌ Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      details: error.message,
    });
  }
});

/**
 * PUT /api/services/:id - Update a service
 */
router.put('/:id', async (req, res) => {
  try {
    const { icon, title, description } = req.body;
    
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }
    
    await service.update({
      icon: icon || service.icon,
      title: title || service.title,
      description: description || service.description,
    });
    
    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('❌ Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
    });
  }
});

/**
 * DELETE /api/services/:id - Delete a service
 */
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
      });
    }
    
    await service.destroy();
    
    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
    });
  }
});

module.exports = router;
