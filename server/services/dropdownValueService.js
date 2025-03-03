const DropdownValue = require('../models/DropdownValue');

class DropdownValueService {
  async getDropdownValues(organizationId) {
    try {
      console.log('Fetching dropdown values for organization:', organizationId);

      const values = await DropdownValue.find({ organization: organizationId })
        .sort({ type: 1, value: 1 })
        .select('-createdBy -createdAt -updatedAt -__v -organization');

      console.log(`Successfully retrieved ${values.length} dropdown values`);

      return values.map(value => ({
        id: value._id,
        value: value.value,
        type: value.type
      }));
    } catch (error) {
      console.error('Error in getDropdownValues:', error);
      throw new Error('Failed to retrieve dropdown values');
    }
  }

  async addDropdownValue(data, userId, organizationId) {
    try {
      console.log('Adding new dropdown value:', data);

      // Normalize the value - trim spaces, replace remaining spaces with hyphens, and convert to lowercase
      const normalizedValue = data.value.trim().replace(/\s+/g, '-').toLowerCase();

      const value = await DropdownValue.create({
        value: normalizedValue,
        type: data.type,
        organization: organizationId,
        createdBy: userId
      });

      console.log('Successfully added new dropdown value with ID:', value._id);

      return {
        id: value._id,
        value: value.value,
        type: value.type
      };
    } catch (error) {
      console.error('Error in addDropdownValue:', error);
      if (error.code === 11000) {
        throw new Error(`A ${data.type} with value "${data.value}" already exists in your organization`);
      }
      throw new Error('Failed to add dropdown value');
    }
  }

  async editDropdownValue(id, newValue, organizationId) {
    try {
      console.log('Editing dropdown value:', id, newValue);

      // Convert the new value to lowercase
      const normalizedValue = newValue.trim().toLowerCase();

      const value = await DropdownValue.findOneAndUpdate(
        { _id: id, organization: organizationId },
        { value: normalizedValue },
        { new: true }
      ).select('-createdBy -createdAt -updatedAt -__v -organization');

      if (!value) {
        throw new Error('Dropdown value not found');
      }

      console.log('Successfully updated dropdown value:', id);

      return {
        id: value._id,
        value: value.value,
        type: value.type
      };
    } catch (error) {
      console.error('Error in editDropdownValue:', error);
      throw error;
    }
  }

  async deleteDropdownValue(id, organizationId) {
    try {
      console.log('Deleting dropdown value:', id);

      const result = await DropdownValue.findOneAndDelete({
        _id: id,
        organization: organizationId
      });

      if (!result) {
        throw new Error('Dropdown value not found');
      }

      console.log('Successfully deleted dropdown value:', id);

      return true;
    } catch (error) {
      console.error('Error in deleteDropdownValue:', error);
      throw error;
    }
  }
}

module.exports = new DropdownValueService();