const express = require('express');
const router = express.Router();
const { requireUser } = require('./middleware/auth');
const GoogleAnalyticsProperty = require('../models/GoogleAnalyticsProperty');

router.post('/property', requireUser, async (req, res) => {
  try {
    console.log('Saving GA property ID for user:', req.user.id);
    const { propertyId } = req.body;
    if (!propertyId || !/^\d+$/.test(propertyId)) {
      console.error('Invalid property ID format:', propertyId);
      return res.status(400).json({ error: 'Invalid property ID format' });
    }

    await GoogleAnalyticsProperty.findOneAndUpdate(
      { userId: req.user.id },
      { propertyId },
      { upsert: true }
    );
    console.log('Successfully saved GA property ID for user:', req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving GA property ID:', error);
    res.status(500).json({ error: 'Failed to save property ID' });
  }
});

router.get('/property', requireUser, async (req, res) => {
  try {
    console.log('Fetching GA property ID for user:', req.user.id);
    const property = await GoogleAnalyticsProperty.findOne({ userId: req.user.id });
    console.log('Found GA property:', property?.propertyId || 'none');
    res.json({ propertyId: property?.propertyId || null });
  } catch (error) {
    console.error('Error fetching GA property ID:', error);
    res.status(500).json({ error: 'Failed to fetch property ID' });
  }
});

module.exports = router;