const express = require('express');
const router = express.Router();
const dropdownValueService = require('../services/dropdownValueService');
const { requireRole } = require('./middleware/auth');

// Get all dropdown values
router.get('/values', requireRole(['Admin', 'Editor', 'Viewer']), async (req, res) => {
  try {
    console.log('Fetching dropdown values');
    const values = await dropdownValueService.getDropdownValues(req.user.organization);

    console.log(`Successfully retrieved ${values.length} dropdown values`);
    res.status(200).json({
      success: true,
      values
    });
  } catch (error) {
    console.error('Error in get dropdown values route:', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Add new dropdown value
router.post('/values', requireRole(['Admin']), async (req, res) => {
  try {
    const { value, type } = req.body;

    if (!value || !type) {
      return res.status(400).json({
        error: 'Value and type are required'
      });
    }

    if (!['medium', 'source', 'campaign'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type. Must be one of: medium, source, campaign'
      });
    }

    console.log(`Adding new dropdown value: ${value} (${type})`);
    const newValue = await dropdownValueService.addDropdownValue(
      { value, type },
      req.user.id,
      req.user.organization
    );

    console.log('Successfully added new dropdown value:', newValue);
    res.status(201).json({
      success: true,
      value: newValue
    });
  } catch (error) {
    console.error('Error in add dropdown value route:', error);
    res.status(400).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Edit dropdown value
router.put('/values/:id', requireRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({
        error: 'Value is required'
      });
    }

    console.log(`Editing dropdown value ${id} to: ${value}`);
    const updatedValue = await dropdownValueService.editDropdownValue(id, value, req.user.organization);

    console.log('Successfully edited dropdown value:', updatedValue);
    res.status(200).json({
      success: true,
      value: updatedValue
    });
  } catch (error) {
    console.error('Error in edit dropdown value route:', error);
    res.status(error.message === 'Dropdown value not found' ? 404 : 500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Delete dropdown value
router.delete('/values/:id', requireRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deleting dropdown value with ID: ${id}`);
    await dropdownValueService.deleteDropdownValue(id, req.user.organization);

    console.log('Successfully deleted dropdown value');
    res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error in delete dropdown value route:', error);
    res.status(error.message === 'Dropdown value not found' ? 404 : 500).json({
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;