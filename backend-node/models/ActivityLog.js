const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actorName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    enum: ['Resident', 'Document', 'Blotter', 'Announcement', 'System'],
    required: true
  },
  referenceId: String,
  loggedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);

