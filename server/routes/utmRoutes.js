const express = require('express');
const router = express.Router();
const utmService = require('../services/utmService');
const { requireRole } = require('./middleware/auth');
const { generateCsvFile, generateExcelFile } = require('../utils/fileExport');

// Create new UTM link (Admin and Editor only)
router.post('/links', requireRole(['Admin', 'Editor']), async (req, res) => {
  try {
    const { destination, medium, source, campaign, term, content } = req.body;

    console.log('Creating new UTM link:', { destination, medium, source, campaign });

    // Basic validation
    if (!destination || !medium || !source || !campaign) {
      console.warn('Missing required fields in UTM link creation');
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // URL validation
    try {
      new URL(destination);
    } catch (e) {
      console.warn('Invalid destination URL provided:', destination);
      return res.status(400).json({
        error: 'Invalid destination URL'
      });
    }

    // Create link through service
    const link = await utmService.createLink(
      { destination, medium, source, campaign, term, content },
      req.user.id
    );

    console.log('Successfully created UTM link with ID:', link.id);

    res.status(201).json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Error in create UTM link route:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Get all UTM links
router.get('/links', requireRole(['Admin', 'Editor', 'Viewer']), async (req, res) => {
  try {
    console.log('Fetching all UTM links');

    const links = await utmService.getLinks(req.user.id);

    console.log(`Successfully retrieved ${links.length} UTM links`);

    res.status(200).json({
      success: true,
      links
    });
  } catch (error) {
    console.error('Error in get UTM links route:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Delete UTM link (Admin and Editor only)
router.delete('/links/:id', requireRole(['Admin', 'Editor']), async (req, res) => {
  try {
    console.log('Deleting UTM link:', req.params.id);

    const deleted = await utmService.deleteLink(req.params.id, req.user.id);

    if (deleted) {
      console.log('Successfully deleted UTM link:', req.params.id);
      res.status(200).json({
        success: true
      });
    } else {
      console.warn('UTM link not found:', req.params.id);
      res.status(404).json({
        error: 'UTM link not found'
      });
    }
  } catch (error) {
    console.error('Error in delete UTM link route:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Export UTM links (All roles can export)
router.post('/links/export', requireRole(['Admin', 'Editor', 'Viewer']), async (req, res) => {
  try {
    const { fileFormat, filters } = req.body;
    console.log('Exporting UTM links:', { fileFormat, filters });

    if (!['csv', 'excel'].includes(fileFormat)) {
      return res.status(400).json({
        error: 'Invalid file format. Must be either "csv" or "excel".'
      });
    }

    const exportData = await utmService.exportLinks(filters, req.user.id);

    if (fileFormat === 'csv') {
      const csvContent = await generateCsvFile(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=utm_links.csv');
      return res.send(csvContent);
    } else {
      const excelBuffer = await generateExcelFile(exportData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=utm_links.xlsx');
      return res.send(excelBuffer);
    }

  } catch (error) {
    console.error('Error in export UTM links route:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Get dashboard statistics
router.get('/stats', requireRole(['Admin', 'Editor', 'Viewer']), async (req, res) => {
  try {
    console.log('Fetching dashboard statistics');
    const stats = await utmService.getStats(req.user.id);
    console.log('Successfully retrieved dashboard statistics:', stats);
    res.status(200).json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error in get dashboard stats route:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;