const mongoose = require('mongoose');

const utmLinkSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true,
    trim: true
  },
  medium: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  campaign: {
    type: String,
    required: true,
    trim: true
  },
  term: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
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

module.exports = mongoose.model('UtmLink', utmLinkSchema);