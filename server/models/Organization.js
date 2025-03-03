const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  versionKey: false
});

schema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret._id;
    return ret;
  },
});

const Organization = mongoose.model('Organization', schema);

module.exports = Organization;