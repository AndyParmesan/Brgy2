const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BlotterCase = require('../models/BlotterCase');

// Get all blotter cases
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { caseTitle: { $regex: search, $options: 'i' } },
        { caseNo: { $regex: search, $options: 'i' } },
        { 'parties.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const cases = await BlotterCase.find(query)
      .populate('parties.residentId', 'fullName')
      .sort({ dateReported: -1 })
      .limit(100);

    res.json(cases);
  } catch (error) {
    console.error('Error fetching blotter cases:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

