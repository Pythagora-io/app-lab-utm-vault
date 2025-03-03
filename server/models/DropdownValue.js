const mongoose = require('mongoose');

const dropdownValueSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['medium', 'source', 'campaign']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure uniqueness of value within each type and organization
dropdownValueSchema.index({ value: 1, type: 1, organization: 1 }, { unique: true });

module.exports = mongoose.model('DropdownValue', dropdownValueSchema);