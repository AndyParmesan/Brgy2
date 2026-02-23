const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  referenceNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  summary: String,
  body: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Normal', 'Low'],
    default: 'Normal'
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft'
  },
  targetAudience: String,
  postedBy: String,
  publishedOn: Date,
  expiresOn: Date,
  actionItems: [{
    description: String,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);

