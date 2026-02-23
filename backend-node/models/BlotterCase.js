const mongoose = require('mongoose');

const blotterCaseSchema = new mongoose.Schema({
  caseNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  caseTitle: {
    type: String,
    required: true
  },
  category: String,
  status: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  scheduleDatetime: Date,
  scheduleLocation: String,
  investigatorName: String,
  location: String,
  summary: String,
  dateReported: {
    type: Date,
    default: Date.now
  },
  parties: [{
    role: {
      type: String,
      enum: ['Complainant', 'Respondent', 'Witness']
    },
    name: String,
    contact: String,
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      default: null
    }
  }],
  actions: [{
    actionLabel: String,
    actionDetails: String,
    nextHearingDatetime: Date,
    requiredDocuments: String,
    recordedBy: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('BlotterCase', blotterCaseSchema);

