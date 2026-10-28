const express = require('express');
const router = express.Router();
const { Enquiry, Resource } = require('../models');
const authenticateAdmin = require('../middleware/authenticateAdmin');

/** GET /api/enquiries — admin, all enquiries */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

/** GET /api/enquiries/:id */
router.get('/:id', authenticateAdmin, async (req, res) => {
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
    const { name, email, phone, subject, message, careerId, careerTitle, resourceId, type = 'General' } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'name, email, subject and message are required' });
    }
    if (!['General', 'Career', 'Resource'].includes(type)) {
      return res.status(400).json({ success: false, error: 'type must be General, Career or Resource' });
    }
    let resource;
    if (type === 'Resource') {
      if (!resourceId) {
        return res.status(400).json({ success: false, error: 'resourceId is required for resource requests' });
      }
      resource = await Resource.findOne({ where: { id: resourceId, isPublished: true } });
      if (!resource) {
        return res.status(404).json({ success: false, error: 'The selected resource is no longer available' });
      }
    }
    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      subject,
      message,
      careerId,
      careerTitle,
      resourceId: resource?.id,
      resourceTitle: resource?.title,
      resourceType: resource?.type,
      type,
    });
    res.status(201).json({ success: true, data: enquiry });
  } catch (err) {
    console.error('❌ Error creating enquiry:', err);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
  }
});

/** PUT /api/enquiries/:id — admin update status */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
    const { status } = req.body;
    if (!['New', 'Read', 'Replied', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'A valid enquiry status is required' });
    }
    await enquiry.update({ status });
    res.json({ success: true, data: enquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
});

/** DELETE /api/enquiries/:id — admin delete */
router.delete('/:id', authenticateAdmin, async (req, res) => {
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
