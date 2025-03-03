const express = require('express');
const router = express.Router();
const { requireRole } = require('./middleware/auth');
const googleAnalyticsService = require('../services/googleAnalyticsService');

router.get('/utm-performance', requireRole(['Admin', 'Editor', 'Viewer']), async (req, res) => {
  console.log('Received request to /api/analytics/utm-performance with query:', req.query);
  try {
    const { medium, source, campaign } = req.query;
    const userId = req.user.id;

    console.log('Fetching UTM performance for:', { medium, source, campaign });

    const performance = await googleAnalyticsService.getUtmPerformance({
      medium,
      source,
      campaign
    }, userId);

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching UTM performance:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch UTM performance data'
    });
  }
});

router.get('/overall', requireRole(['Admin', 'Editor', 'Viewer']), async (req, res) => {
  console.log('Received request to /api/analytics/overall with query:', req.query);
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    console.log('Fetching overall analytics:', { startDate, endDate });

    const dateRange = {
      startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: endDate ? new Date(endDate) : new Date()
    };

    const [analytics, dailyClicks] = await Promise.all([
      googleAnalyticsService.getOverallAnalytics(dateRange, userId),
      googleAnalyticsService.getDailyCampaignClicks(dateRange, userId)
    ]);

    res.json({
      success: true,
      data: {
        ...analytics,
        dailyClicks
      }
    });
  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch analytics data'
    });
  }
});

module.exports = router;