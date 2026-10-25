const express = require('express');
const router = express.Router();
const { Career } = require('../models');

/** GET /api/careers — public, only active */
router.get('/', async (req, res) => {
  try {
    const careers = await Career.findAll({
      where: { isActive: true },
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: careers });
  } catch (err) {
    console.error('❌ Error fetching careers:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch careers' });
  }
});

/** GET /api/careers/all — admin, all including inactive */
router.get('/all', async (req, res) => {
  try {
    const careers = await Career.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: careers });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch careers' });
  }
});

/** GET /api/careers/:id */
router.get('/:id', async (req, res) => {
  try {
    const career = await Career.findByPk(req.params.id);
    if (!career) return res.status(404).json({ success: false, error: 'Career not found' });
    res.json({ success: true, data: career });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch career' });
  }
});

/** POST /api/careers — admin create */
router.post('/', async (req, res) => {
  try {
    const { title, department, location, type, experience, description, requirements, isActive } = req.body;
    if (!title || !department || !description) {
      return res.status(400).json({ success: false, error: 'title, department and description are required' });
    }
    const career = await Career.create({ title, department, location, type, experience, description, requirements, isActive });
    res.status(201).json({ success: true, data: career });
  } catch (err) {
    console.error('❌ Error creating career:', err);
    res.status(500).json({ success: false, error: 'Failed to create career' });
  }
});

/** PUT /api/careers/:id — admin update */
router.put('/:id', async (req, res) => {
  try {
    const career = await Career.findByPk(req.params.id);
    if (!career) return res.status(404).json({ success: false, error: 'Career not found' });
    await career.update(req.body);
    res.json({ success: true, data: career });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update career' });
  }
});

/** DELETE /api/careers/:id — admin delete */
router.delete('/:id', async (req, res) => {
  try {
    const career = await Career.findByPk(req.params.id);
    if (!career) return res.status(404).json({ success: false, error: 'Career not found' });
    await career.destroy();
    res.json({ success: true, message: 'Career deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete career' });
  }
});

module.exports = router;
