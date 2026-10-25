const express = require('express');
const router = express.Router();
const { Enquiry } = require('../models');

/** GET /api/enquiries — admin, all enquiries */
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

/** GET /api/enquiries/:id */
router.get('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiry' });
  }
});

/** POST /api/enquiries — public, submit enquiry or career application */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, careerId, careerTitle, type } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'name, email, subject and message are required' });
    }
    const enquiry = await Enquiry.create({ name, email, phone, subject, message, careerId, careerTitle, type: type || 'General' });
    res.status(201).json({ success: true, data: enquiry });
  } catch (err) {
    console.error('❌ Error creating enquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
  }
});

/** PUT /api/enquiries/:id — admin update status */
router.put('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
    await enquiry.update(req.body);
    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
});

/** DELETE /api/enquiries/:id — admin delete */
router.delete('/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
    await enquiry.destroy();
    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete enquiry' });
  }
});

module.exports = router;
