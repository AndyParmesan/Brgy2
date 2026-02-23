const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  householdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Household',
    default: null
  },
  fullName: {
    type: String,
    required: true
  },
  gender: String,
  residentType: {
    type: String,
    enum: ['Permanent', 'Temporary'],
    default: 'Permanent'
  },
  dateOfBirth: Date,
  placeOfBirth: String,
  civilStatus: String,
  nationality: {
    type: String,
    default: 'Filipino'
  },
  religion: String,
  contactMobile: String,
  contactEmail: String,
  isSeniorCitizen: {
    type: Boolean,
    default: false
  },
  isPwd: {
    type: Boolean,
    default: false
  },
  pwdType: String,
  chronicIllnesses: String,
  registeredVoter: {
    type: Boolean,
    default: false
  },
  voterPrecinctNo: String,
  // Embedded documents
  identification: {
    govIdType: String,
    govIdNumber: String,
    philhealthNumber: String,
    sssGsisNumber: String,
    barangayIdNumber: String,
    picturePath: String,
    signaturePath: String
  },
  employment: {
    employmentStatus: String,
    natureOfWork: String,
    employerName: String,
    workAddress: String,
    monthlyIncomeRange: String
  },
  residency: {
    yearMovedIn: Number,
    originalCityOrProvince: String,
    residencyType: String,
    residencyDocuments: String
  },
  emergencyContacts: [{
    name: String,
    contactNumber: String,
    relationship: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Resident', residentSchema);

