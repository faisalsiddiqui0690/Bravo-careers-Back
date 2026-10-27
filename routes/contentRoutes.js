const express = require('express');
const authenticateAdmin = require('../middleware/authenticateAdmin');

const slugify = (value) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 255);

const createContentRouter = (Model, label, supportsExternalUrl = false) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const entries = await Model.findAll({
        where: { isPublished: true },
        order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      });
      return res.json({ success: true, data: entries });
    } catch (error) {
      console.error(`Error fetching published ${label}:`, error);
      return res.status(500).json({ success: false, message: `Failed to fetch ${label}` });
    }
  });

  router.get('/admin/all', authenticateAdmin, async (req, res) => {
    try {
      const entries = await Model.findAll({ order: [['updated_at', 'DESC']] });
      return res.json({ success: true, data: entries });
    } catch (error) {
      console.error(`Error fetching all ${label}:`, error);
      return res.status(500).json({ success: false, message: `Failed to fetch ${label}` });
    }
  });

  router.get('/:slug', async (req, res) => {
    try {
      const entry = await Model.findOne({ where: { slug: req.params.slug, isPublished: true } });
      if (!entry) return res.status(404).json({ success: false, message: `${label} not found` });
      return res.json({ success: true, data: entry });
    } catch (error) {
      console.error(`Error fetching ${label} entry:`, error);
      return res.status(500).json({ success: false, message: `Failed to fetch ${label}` });
    }
  });

  router.post('/', authenticateAdmin, async (req, res) => {
    try {
      const { title, excerpt, content } = req.body;
      if (![title, excerpt, content].every((value) => typeof value === 'string' && value.trim())) {
        return res.status(400).json({ success: false, message: 'Title, summary and content are required' });
      }
      const slug = slugify(req.body.slug || title);
      if (!slug) return res.status(400).json({ success: false, message: 'A URL-safe slug is required' });

      const isPublished = req.body.isPublished === true || req.body.isPublished === 'true';
      const entry = await Model.create({
        title: title.trim(),
        slug,
        category: typeof req.body.category === 'string' && req.body.category.trim()
          ? req.body.category.trim()
          : (supportsExternalUrl ? 'UK updates' : 'Career guidance'),
        excerpt: excerpt.trim(),
        content: content.trim(),
        image: typeof req.body.image === 'string' ? req.body.image.trim() : '',
        imageAlt: typeof req.body.imageAlt === 'string' ? req.body.imageAlt.trim() : '',
        ...(supportsExternalUrl && {
          externalUrl: typeof req.body.externalUrl === 'string' ? req.body.externalUrl.trim() : '',
        }),
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      });
      return res.status(201).json({ success: true, data: entry });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'That URL slug is already in use' });
      }
      console.error(`Error creating ${label}:`, error);
      return res.status(500).json({ success: false, message: `Failed to create ${label}` });
    }
  });

  router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
      const entry = await Model.findByPk(req.params.id);
      if (!entry) return res.status(404).json({ success: false, message: `${label} not found` });

      for (const field of ['title', 'excerpt', 'content']) {
        if (req.body[field] !== undefined && (typeof req.body[field] !== 'string' || !req.body[field].trim())) {
          return res.status(400).json({ success: false, message: `${field} is required` });
        }
      }

      const updates = {};
      for (const field of ['title', 'category', 'excerpt', 'content', 'image', 'imageAlt']) {
        if (typeof req.body[field] === 'string') updates[field] = req.body[field].trim();
      }
      if (req.body.slug !== undefined || req.body.title !== undefined) {
        updates.slug = slugify(req.body.slug || req.body.title || entry.title);
        if (!updates.slug) return res.status(400).json({ success: false, message: 'A URL-safe slug is required' });
      }
      if (supportsExternalUrl && typeof req.body.externalUrl === 'string') {
        updates.externalUrl = req.body.externalUrl.trim();
      }
      if (req.body.isPublished !== undefined) {
        updates.isPublished = req.body.isPublished === true || req.body.isPublished === 'true';
        updates.publishedAt = updates.isPublished
          ? (entry.publishedAt || new Date())
          : null;
      }

      await entry.update(updates);
      return res.json({ success: true, data: entry });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'That URL slug is already in use' });
      }
      console.error(`Error updating ${label}:`, error);
      return res.status(500).json({ success: false, message: `Failed to update ${label}` });
    }
  });

  router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
      const entry = await Model.findByPk(req.params.id);
      if (!entry) return res.status(404).json({ success: false, message: `${label} not found` });
      await entry.destroy();
      return res.json({ success: true, message: `${label} deleted` });
    } catch (error) {
      console.error(`Error deleting ${label}:`, error);
      return res.status(500).json({ success: false, message: `Failed to delete ${label}` });
    }
  });

  return router;
};

module.exports = createContentRouter;
