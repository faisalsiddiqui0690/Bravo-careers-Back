const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Project } = require('../models');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/projects');
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
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log('📎 File upload attempt:', {
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
 * POST /api/projects/upload - Upload project image
 */
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    console.log('📤 Upload endpoint hit!');
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }
    
    console.log('✅ File received:', req.file.filename);
    const imageUrl = `/uploads/projects/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        imageUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
    });
  }
});

console.log('✅ Upload route registered at POST /api/projects/upload');

/**
 * GET /api/projects - Get all projects
 */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['id', 'ASC']],
    });
    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
    });
  }
});

/**
 * GET /api/projects/:id - Get a single project
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
    });
  }
});

/**
 * POST /api/projects - Create a new project
 */
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating project with data:', req.body);
    const { title, category, client, description, technologies, image } = req.body;
    
    if (!title || !category || !client || !description) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    const project = await Project.create({
      title,
      category,
      client,
      description,
      technologies: technologies || [],
      image: image || '',
    });
    
    console.log('✅ Project created successfully:', project.id);
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create project',
      details: error.message,
    });
  }
});

/**
 * PUT /api/projects/:id - Update a project
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, category, client, description, technologies, image } = req.body;
    
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    await project.update({
      title: title || project.title,
      category: category || project.category,
      client: client || project.client,
      description: description || project.description,
      technologies: technologies !== undefined ? technologies : project.technologies,
      image: image || project.image,
    });
    
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
});

/**
 * DELETE /api/projects/:id - Delete a project
 */
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }
    
    await project.destroy();
    
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
});

module.exports = router;
