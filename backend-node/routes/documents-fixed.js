const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;
const { logActivity } = require('../utils/activityLogger');
const crypto = require('crypto'); // Built-in Node.js module — no install needed
const { transporter } = require('../utils/email.js');

/**
 * Generates a cryptographically secure, collision-safe reference number.
 *
 * Format: DOC-{YEAR}-{8 random uppercase alphanumeric chars}
 * Example: DOC-2026-K4RX92BT
 *
 * Uses crypto.randomBytes() (Node.js built-in) — cryptographically secure,
 * not Math.random() which is predictable.
 * Loops on the rare chance of a DB collision (practically never happens).
 */
async function generateReferenceNumber() {
  const year = new Date().getFullYear();
  let referenceNo;

  do {
    // 6 random bytes → 12 hex chars, slice to 8 for DOC-YEAR-XXXXXXXX format
    const token = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
    referenceNo = `DOC-${year}-${token}`;

    // Check for collision
    const existing = await query(
      'SELECT id FROM document_requests WHERE reference_no = ?',
      [referenceNo]
    );

    if (existing.length === 0) break; // Unique — use it
  } while (true);

  return referenceNo;
}

// Public: Get document types
router.get('/public/documents', (req, res) => {
  const documents = [
    {
      type: 'Barangay Clearance',
      icon: '📄',
      description: 'Required for employment, business permits, and other legal purposes',
      requirements: [
        'Valid ID (Government-issued)',
        'Barangay Residency Certificate or Proof of Address',
        '1x1 ID Picture (2 copies)',
        'Cedula or Community Tax Certificate',
        'Processing Fee: ₱50.00'
      ],
      processing_time: '3-5 working days'
    },
    // ... (rest of documents array unchanged)
    {
      type: 'First-Time Jobseeker Certificate',
      icon: '📑',
      description: 'For first-time employment seekers',
      requirements: [
        'Valid ID',
        'Barangay Clearance',
        'Proof of being a first-time jobseeker',
        'Processing Fee: Free'
      ],
      processing_time: '3-5 working days'
    }
  ];

  res.json(documents);
});

// Public: Submit document request (authenticated or unauthenticated)
router.post('/public/document-request', async (req, res) => {
  try {
    // Try to get user from token if available
    let userEmail = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userEmail = decoded.email;
      }
    } catch (err) {
      // Token not provided or invalid — continue as public request
    }

    const { requester_name, document_type, purpose, contact_number, email, address, additional_info } = req.body;

    // Use email from token if available, otherwise use provided email
    const finalEmail = userEmail || email;

    // Validation
    if (!requester_name || !document_type || !purpose || !contact_number || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // FIX: Replaced sequential counter with secure random reference number
    const referenceNo = await generateReferenceNumber();

    // Insert document request
    const result = await query(
      `INSERT INTO document_requests 
       (reference_no, requester_name, document_type, purpose, contact_number, email, address, status, date_filed, additional_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', CURDATE(), ?)`,
      [referenceNo, requester_name, document_type, purpose, contact_number, finalEmail || null, address, additional_info || null]
    );

    // Log activity
    await logActivity({
      actorName: requester_name,
      action: 'Requested',
      module: 'Document',
      referenceId: referenceNo,
      details: `${document_type} - ${purpose}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: finalEmail,
      actorRole: 'resident'
    });

    res.status(201).json({
      message: 'Document request submitted successfully',
      reference_no: referenceNo,
      data: {
        id: result.insertId,
        reference_no: referenceNo,
        requester_name,
        document_type,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('Submit document request error:', error);
    res.status(500).json({ error: 'Failed to submit document request' });
  }
});

// ... rest of routes unchanged, using transporter

module.exports = router;
