const express = require('express');
const router = express.Router();
const { Review } = require('../models');

/**
 * GET /api/reviews - Get all reviews
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      order: [['id', 'ASC']],
    });
    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
    });
  }
});

/**
 * GET /api/reviews/:id - Get a single review
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }
    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('❌ Error fetching review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch review',
    });
  }
});

/**
 * POST /api/reviews - Create a new review
 */
router.post('/', async (req, res) => {
  try {
    const { name, role, rating, comment } = req.body;
    
    if (!name || !role || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }
    
    const review = await Review.create({
      name,
      role,
      rating,
      comment,
    });
    
    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create review',
    });
  }
});

/**
 * PUT /api/reviews/:id - Update a review
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, role, rating, comment } = req.body;
    
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }
    
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5',
      });
    }
    
    await review.update({
      name: name || review.name,
      role: role || review.role,
      rating: rating !== undefined ? rating : review.rating,
      comment: comment || review.comment,
    });
    
    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('❌ Error updating review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update review',
    });
  }
});

/**
 * DELETE /api/reviews/:id - Delete a review
 */
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found',
      });
    }
    
    await review.destroy();
    
    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review',
    });
  }
});

module.exports = router;
