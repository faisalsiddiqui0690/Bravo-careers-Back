const express = require('express');
const router = express.Router();
const { SiteAnalytics } = require('../models');

/**
 * GET /api/analytics — public, returns the single analytics record
 */
router.get('/', async (req, res) => {
  try {
    let record = await SiteAnalytics.findOne();
    if (!record) {
      record = await SiteAnalytics.create({});
    }
    res.json({ success: true, data: record });
  } catch (err) {
    console.error('❌ Error fetching analytics:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

/**
 * PUT /api/analytics — admin only, update the analytics record
 */
router.put('/', async (req, res) => {
  try {
    let record = await SiteAnalytics.findOne();
    if (!record) record = await SiteAnalytics.create({});

    const {
      projectsCount, clientsCount, statesCount, clientRate,
      projectsChange, clientsChange, statesChange,
      webPct, appPct, crmPct,
      monthlyData,
      activityTitle, activitySub,
    } = req.body;

    await record.update({
      ...(projectsCount  !== undefined && { projectsCount }),
      ...(clientsCount   !== undefined && { clientsCount  }),
      ...(statesCount    !== undefined && { statesCount   }),
      ...(clientRate     !== undefined && { clientRate    }),
      ...(projectsChange !== undefined && { projectsChange }),
      ...(clientsChange  !== undefined && { clientsChange  }),
      ...(statesChange   !== undefined && { statesChange   }),
      ...(webPct         !== undefined && { webPct: Number(webPct) }),
      ...(appPct         !== undefined && { appPct: Number(appPct) }),
      ...(crmPct         !== undefined && { crmPct: Number(crmPct) }),
      ...(monthlyData    !== undefined && { monthlyData }),
      ...(activityTitle  !== undefined && { activityTitle }),
      ...(activitySub    !== undefined && { activitySub   }),
    });

    res.json({ success: true, data: record });
  } catch (err) {
    console.error('❌ Error updating analytics:', err);
    res.status(500).json({ success: false, error: 'Failed to update analytics' });
  }
});

module.exports = router;
