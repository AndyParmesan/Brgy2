const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DocumentRequest = require('../models/DocumentRequest');
const nodemailer = require('nodemailer');

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lasseterjohn75@gmail.com', // Replace with your barangay/testing Gmail
    pass: 'yycd ihkm fffv llej '     // Use an app password for security
  }
});

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

// Protected: Update Document Status and Send Email
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find and update the request
    const request = await DocumentRequest.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('residentId'); // Assuming you linked the resident model

    if (!request) {
      return res.status(404).json({ message: 'Document request not found' });
    }

    // Attempt to grab the email from the request itself, or the populated resident profile
    const targetEmail = request.contactEmail || request.email || (request.residentId && request.residentId.email);

    // If we found an email, send the notification!
    if (targetEmail) {
      const mailOptions = {
        from: '"Barangay 853 Admin" <YOUR_EMAIL@gmail.com>', // Must match the user email above
        to: targetEmail,
        subject: `Update on your Barangay Document Request: ${status}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #2563eb;">Document Request Update</h2>
            <p>Hello <strong>${request.requesterName || 'Resident'}</strong>,</p>
            <p>Your request for a <strong>${request.documentType || request.type || 'Document'}</strong> has been updated to:</p>
            <h3 style="background: #f3f4f6; padding: 10px; text-align: center; border-radius: 5px; color: #1f2937;">
              STATUS: ${status.toUpperCase()}
            </h3>
            <p>Tracking Reference Number: <strong>${request.referenceNo || request._id}</strong></p>
            <p>You can track the exact details anytime on the Barangay 853 Public Portal.</p>
            <br/>
            <p style="color: #6b7280; font-size: 12px;">Thank you,<br/>Barangay 853 Administration</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error('⚠️ Error sending email:', error);
        else console.log('✅ Email notification sent to:', targetEmail);
      });
    } else {
      console.log('⚠️ No email address found for this resident. Status updated silently.');
    }

    res.json({ success: true, request, message: 'Status updated and email sent.' });
  } catch (error) {
    console.error('Error updating document request:', error);
    res.status(500).json({ message: 'Server error while updating request' });
  }
});

module.exports = router;

