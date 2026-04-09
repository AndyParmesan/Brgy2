const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DocumentRequest = require('../models/DocumentRequest');

// Public route to track a specific document request by ID
// Ensure this is placed BEFORE any middleware that blocks public access
router.get('/public/track-document/:id', async (req, res) => {
  try {
    const trackingId = req.params.id;

    // 1. Find the request using Mongoose
    // We check both referenceNo and _id just in case
    const request = await DocumentRequest.findOne({
      $or: [
        { referenceNo: trackingId },
        // Only check _id if the trackingId is a valid 24-character MongoDB ObjectId
        ...(trackingId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: trackingId }] : [])
      ]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found or invalid ID.' });
    }

    // 2. Map the Mongoose fields to the format the React frontend TrackRequest.js expects
    const mappedRequest = {
      id: request.referenceNo || request._id,
      full_name: request.requesterName || 'Resident', 
      document_type: request.documentType || request.type || 'Document Request',
      purpose: request.purpose || 'Not specified',
      status: request.status,
      created_at: request.dateFiled || request.createdAt || new Date()
    };

    res.json({ success: true, request: mappedRequest });
  } catch (error) {
    console.error('Error tracking document:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tracking info' });
  }
});
// Get all document requests
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { requesterName: { $regex: search, $options: 'i' } },
        { referenceNo: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await DocumentRequest.find(query)
      .populate('residentId', 'fullName')
      .sort({ dateFiled: -1 })
      .limit(100);

    res.json(requests);
  } catch (error) {
    console.error('Error fetching document requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

