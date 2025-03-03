const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const OrganizationService = require('./organizationService.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

const VALID_ROLES = ['Admin', 'Editor', 'Viewer'];

class UserService {
  static async list() {
    try {
      return User.find();
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async listByOrganization(organizationId) {
    try {
      console.log(`Fetching users for organization ${organizationId}`);
      const users = await User.find({ organization: organizationId })
        .select('-password -refreshToken')
        .exec();
      console.log('Users fetched from database:', users);
      return users;
    } catch (err) {
      console.error('Error listing organization users:', err);
      throw new Error(`Database error while listing organization users: ${err}`);
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      // Validate role if it's being updated
      if (data.role && !VALID_ROLES.includes(data.role)) {
        throw new Error('Invalid role specified');
      }
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await User.findOne({email}).exec();
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '', role = 'Viewer', organizationName = null, organization = null }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    if (!VALID_ROLES.includes(role)) {
      throw new Error('Invalid role specified');
    }

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await generatePasswordHash(password);

    try {
      // Create organization if name provided (for new registrations)
      let organizationId = organization;
      if (organizationName) {
        const newOrg = await OrganizationService.create(organizationName);
        organizationId = newOrg._id;
      }

      const user = new User({
        email,
        password: hash,
        name,
        role,
        organization: organizationId
      });

      await user.save();
      return user;
    } catch (err) {
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
}

module.exports = UserService;