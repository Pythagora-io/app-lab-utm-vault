const Organization = require('../models/Organization.js');

class OrganizationService {
  static async create(name) {
    try {
      console.log(`Creating new organization with name: ${name}`);
      const organization = new Organization({
        name
      });
      await organization.save();
      console.log(`Successfully created organization with ID: ${organization._id}`);
      return organization;
    } catch (err) {
      console.error('Error creating organization:', err);
      throw new Error(`Database error while creating new organization: ${err}`);
    }
  }

  static async get(id) {
    try {
      console.log(`Getting organization with ID: ${id}`);
      const organization = await Organization.findById(id);
      if (!organization) {
        console.warn(`Organization with ID ${id} not found`);
        throw new Error('Organization not found');
      }
      return organization;
    } catch (err) {
      console.error('Error getting organization:', err);
      throw new Error(`Database error while getting organization: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      console.log(`Updating organization ${id} with data:`, data);
      const organization = await Organization.findByIdAndUpdate(id, data, { new: true });
      if (!organization) {
        console.warn(`Organization with ID ${id} not found for update`);
        throw new Error('Organization not found');
      }
      console.log(`Successfully updated organization ${id}`);
      return organization;
    } catch (err) {
      console.error('Error updating organization:', err);
      throw new Error(`Database error while updating organization: ${err}`);
    }
  }
}

module.exports = OrganizationService;