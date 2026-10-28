const express = require('express');
const { Resource } = require('../models');
const authenticateAdmin = require('../middleware/authenticateAdmin');

const router = express.Router();

const slugify = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 255);

const isValidSections = (sections) => Array.isArray(sections)
  && sections.length > 0
  && sections.every((section) => (
    section
    && typeof section.title === 'string'
    && section.title.trim()
    && ['paragraphs', 'bullets'].every((key) => (
      section[key] === undefined
      || (Array.isArray(section[key]) && section[key].every((item) => typeof item === 'string'))
    ))
  ));

const validateResource = (body, partial = false) => {
  if (!partial && !['free', 'ebooks'].includes(body.type)) return 'A valid resource type is required';
  if (!partial && !(typeof body.title === 'string' && body.title.trim())) return 'A title is required';
  if (!partial && !(typeof body.description === 'string' && body.description.trim())) return 'A description is required';
  if (!partial && !isValidSections(body.sections)) return 'At least one valid content section is required';
  if (body.type !== undefined && !['free', 'ebooks'].includes(body.type)) return 'A valid resource type is required';
  if (body.title !== undefined && (typeof body.title !== 'string' || !body.title.trim())) return 'A title is required';
  if (body.description !== undefined && (typeof body.description !== 'string' || !body.description.trim())) return 'A description is required';
  if (body.sections !== undefined && !isValidSections(body.sections)) return 'At least one valid content section is required';
  if (body.isPublished !== undefined && typeof body.isPublished !== 'boolean') return 'isPublished must be a boolean';
  return null;
};

router.get('/', async (req, res) => {
  try {
    const where = { isPublished: true };
    if (req.query.type !== undefined) {
      if (!['free', 'ebooks'].includes(req.query.type)) {
        return res.status(400).json({ success: false, message: 'type must be free or ebooks' });
      }
      where.type = req.query.type;
    }
    const resources = await Resource.findAll({ where, order: [['created_at', 'ASC']] });
    return res.json({ success: true, data: resources });
  } catch (error) {
    console.error('Error fetching published resources:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
});

router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const resources = await Resource.findAll({ order: [['updated_at', 'DESC']] });
    return res.json({ success: true, data: resources });
  } catch (error) {
    console.error('Error fetching all resources:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch resources' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const validationError = validateResource(req.body);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  const id = slugify(req.body.id || req.body.title);
  if (!id) return res.status(400).json({ success: false, message: 'A URL-safe resource ID is required' });

  try {
    const resource = await Resource.create({
      id,
      type: req.body.type,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      sections: req.body.sections,
      isPublished: req.body.isPublished !== false,
    });
    return res.status(201).json({ success: true, data: resource });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'That resource ID is already in use' });
    }
    console.error('Error creating resource:', error);
    return res.status(500).json({ success: false, message: 'Failed to create resource' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const validationError = validateResource(req.body, true);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });

    const updates = {};
    for (const field of ['type', 'sections', 'isPublished']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    for (const field of ['title', 'description']) {
      if (typeof req.body[field] === 'string') updates[field] = req.body[field].trim();
    }
    await resource.update(updates);
    return res.json({ success: true, data: resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    return res.status(500).json({ success: false, message: 'Failed to update resource' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    await resource.destroy();
    return res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete resource' });
  }
});

module.exports = router;
