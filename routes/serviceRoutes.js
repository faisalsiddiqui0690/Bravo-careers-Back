const express = require('express');
const { Op } = require('sequelize');
const { Service } = require('../models');
const authenticateAdmin = require('../middleware/authenticateAdmin');

const router = express.Router();
const slugify = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 255);
const toList = (value) => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? toList(parsed) : [];
  } catch {
    return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  }
};

const serviceValues = (body, existing = {}) => {
  const title = typeof body.title === 'string' ? body.title.trim() : existing.title;
  const description = typeof body.description === 'string' ? body.description.trim() : existing.description;
  return {
    icon: typeof body.icon === 'string' ? body.icon.trim() : existing.icon || '',
    title,
    description,
    slug: slugify(typeof body.slug === 'string' && body.slug.trim() ? body.slug : title),
    image: typeof body.image === 'string' ? body.image.trim() : existing.image || '',
    imageAlt: typeof body.imageAlt === 'string' ? body.imageAlt.trim() : existing.imageAlt || '',
    points: body.points !== undefined ? toList(body.points) : existing.points || [],
    detailIntro: typeof body.detailIntro === 'string' ? body.detailIntro.trim() : existing.detailIntro || '',
    detailDescription: typeof body.detailDescription === 'string'
      ? body.detailDescription.trim()
      : existing.detailDescription || '',
    outcomes: body.outcomes !== undefined ? toList(body.outcomes) : existing.outcomes || [],
    isPublished: body.isPublished === undefined
      ? Boolean(existing.isPublished)
      : body.isPublished === true || body.isPublished === 'true',
  };
};

router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isPublished: true, slug: { [Op.ne]: null } },
      order: [['id', 'ASC']],
    });
    return res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching published services:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { slug: { [Op.ne]: null } },
      order: [['id', 'ASC']],
    });
    return res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching admin services:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

router.post('/upload', authenticateAdmin, (req, res) => {
  const upload = require('multer')({
    storage: require('multer').diskStorage({
      destination: (request, file, callback) => {
        const path = require('path');
        const fs = require('fs');
        const uploadsDir = path.join(__dirname, '../uploads/services');
        fs.mkdirSync(uploadsDir, { recursive: true });
        callback(null, uploadsDir);
      },
      filename: (request, file, callback) => {
        const path = require('path');
        callback(null, `service-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (request, file, callback) => {
      if (file.mimetype.startsWith('image/')) return callback(null, true);
      return callback(new Error('Only image files are allowed'));
    },
  }).single('image');

  upload(req, res, (error) => {
    if (error) return res.status(400).json({ success: false, message: error.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    return res.json({
      success: true,
      data: { imageUrl: `/uploads/services/${req.file.filename}`, filename: req.file.filename },
    });
  });
});

router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({
      where: { id: req.params.id, isPublished: true },
    });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    return res.json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch service' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const values = serviceValues(req.body);
    if (!values.title || !values.description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    const service = await Service.create(values);
    return res.status(201).json({ success: true, data: service });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'That service URL is already in use' });
    }
    console.error('Error creating service:', error);
    return res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    const values = serviceValues(req.body, service);
    if (!values.title || !values.description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }
    await service.update(values);
    return res.json({ success: true, data: service });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'That service URL is already in use' });
    }
    console.error('Error updating service:', error);
    return res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    await service.destroy();
    return res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

module.exports = router;
