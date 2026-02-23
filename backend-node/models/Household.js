const mongoose = require('mongoose');

const householdSchema = new mongoose.Schema({
  householdCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  addressLine: {
    type: String,
    required: true
  },
  purokSitio: String,
  zone: String,
  barangay: {
    type: String,
    default: 'Brgy. 853'
  },
  city: {
    type: String,
    default: 'Manila City'
  },
  province: {
    type: String,
    default: 'Metro Manila'
  },
  postalCode: String,
  profileNotes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Household', householdSchema);

