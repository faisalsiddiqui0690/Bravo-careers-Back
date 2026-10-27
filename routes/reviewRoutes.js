const express = require('express');
const { Review } = require('../models');
const authenticateAdmin = require('../middleware/authenticateAdmin');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { isPublished: true, permissionGranted: true },
      order: [['id', 'ASC']],
    });
    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching published testimonials:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const reviews = await Review.findAll({ order: [['id', 'ASC']] });
    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching admin testimonials:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch testimonials' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findOne({
      where: { id: req.params.id, isPublished: true, permissionGranted: true },
    });
    if (!review) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    return res.json({ success: true, data: review });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch testimonial' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, role, rating, comment } = req.body;
    if (![name, role, comment].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ success: false, message: 'Name, role and comment are required' });
    }
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const permissionGranted = req.body.permissionGranted === true || req.body.permissionGranted === 'true';
    const isPublished = req.body.isPublished === true || req.body.isPublished === 'true';
    if (isPublished && !permissionGranted) {
      return res.status(400).json({
        success: false,
        message: 'Client permission is required before publishing a testimonial',
      });
    }
    const review = await Review.create({
      name: name.trim(),
      role: role.trim(),
      rating: numericRating,
      comment: comment.trim(),
      image: typeof req.body.image === 'string' ? req.body.image.trim() : '',
      permissionGranted,
      isPublished,
    });
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return res.status(500).json({ success: false, message: 'Failed to create testimonial' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Testimonial not found' });

    const updates = {};
    for (const field of ['name', 'role', 'comment']) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== 'string' || !req.body[field].trim()) {
          return res.status(400).json({ success: false, message: `${field} is required` });
        }
        updates[field] = req.body[field].trim();
      }
    }
    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      }
      updates.rating = rating;
    }
    if (req.body.image !== undefined) {
      if (typeof req.body.image !== 'string') {
        return res.status(400).json({ success: false, message: 'Image URL must be text' });
      }
      updates.image = req.body.image.trim();
    }
    if (req.body.permissionGranted !== undefined) {
      updates.permissionGranted = req.body.permissionGranted === true || req.body.permissionGranted === 'true';
    }
    if (req.body.isPublished !== undefined) {
      updates.isPublished = req.body.isPublished === true || req.body.isPublished === 'true';
    }
    if ((updates.isPublished ?? review.isPublished) && !(updates.permissionGranted ?? review.permissionGranted)) {
      return res.status(400).json({
        success: false,
        message: 'Client permission is required before publishing a testimonial',
      });
    }

    await review.update(updates);
    return res.json({ success: true, data: review });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return res.status(500).json({ success: false, message: 'Failed to update testimonial' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    await review.destroy();
    return res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
});

module.exports = router;
