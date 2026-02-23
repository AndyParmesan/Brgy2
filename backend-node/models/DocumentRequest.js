const mongoose = require('mongoose');

const documentRequestSchema = new mongoose.Schema({
  referenceNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    default: null
  },
  requesterName: {
    type: String,
    required: true
  },
  contactNumber: String,
  documentType: {
    type: String,
    required: true
  },
  purpose: String,
  intendedRecipient: String,
  status: {
    type: String,
    enum: ['Pending', 'Review', 'Approved', 'Released', 'Rejected'],
    default: 'Pending'
  },
  dateFiled: {
    type: Date,
    default: Date.now
  },
  receivingStaff: String,
  remarks: String,
  attachments: [{
    label: String,
    value: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DocumentRequest', documentRequestSchema);

