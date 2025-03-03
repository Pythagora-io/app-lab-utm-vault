const express = require('express');
const { requireRole, requireUser } = require('./middleware/auth.js');
const OrganizationService = require('../services/organizationService.js');
const UserService = require('../services/userService.js');

const router = express.Router();

// Get organization details
router.get('/', requireUser, async (req, res) => {
  try {
    const organization = await OrganizationService.get(req.user.organization);
    return res.json(organization);
  } catch (error) {
    console.error('Error getting organization:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Update organization name
router.put('/', requireRole(['Admin']), async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const organization = await OrganizationService.update(req.user.organization, { name });
    return res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all users in organization
router.get('/users', requireRole(['Admin']), async (req, res) => {
  try {
    const users = await UserService.listByOrganization(req.user.organization);
    console.log('Users fetched from database:', users);
    return res.json(users);
  } catch (error) {
    console.error('Error getting organization users:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Create new user in organization
router.post('/users', requireRole(['Admin']), async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required' });
  }

  try {
    const user = await UserService.create({
      email,
      password,
      role,
      organization: req.user.organization
    });
    return res.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(400).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:userId', requireRole(['Admin']), async (req, res) => {
  const { role } = req.body;
  const { userId } = req.params;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    // Verify user belongs to same organization
    const user = await UserService.get(userId);
    if (!user || user.organization.toString() !== req.user.organization) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await UserService.update(userId, { role });
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', requireRole(['Admin']), async (req, res) => {
  const { userId } = req.params;

  try {
    // Verify user belongs to same organization
    const user = await UserService.get(userId);
    if (!user || user.organization.toString() !== req.user.organization) {
      return res.status(404).json({ error: 'User not found' });
    }

    await UserService.delete(userId);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;