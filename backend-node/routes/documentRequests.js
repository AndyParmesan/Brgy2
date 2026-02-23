const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DocumentRequest = require('../models/DocumentRequest');

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

