const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;
const { logActivity } = require('../utils/activityLogger');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
   user: 'barangay853kahilomiii@gmail.com', // Replace with your barangay/testing Gmail
    pass: 'cjxg vsqn tabk cqzs'     // Use an app password for security
  }
});

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
    {
      type: 'Barangay ID',
      icon: '🆔',
      description: 'Official identification for barangay residents',
      requirements: [
        'Valid ID',
        'Proof of Residency',
        '1x1 ID Picture (2 copies)',
        'Processing Fee: ₱100.00'
      ],
      processing_time: '5-7 working days'
    },
    {
      type: 'Certificate of Residency',
      icon: '🏠',
      description: 'Proof of residence within the barangay',
      requirements: [
        'Valid ID (Government-issued)',
        'Proof of Address (Utility Bill, Lease Contract)',
        '1x1 ID Picture (1 copy)',
        'Processing Fee: ₱30.00'
      ],
      processing_time: '2-3 working days'
    },
    {
      type: 'Certificate of Indigency',
      icon: '💰',
      description: 'For financial assistance and medical purposes',
      requirements: [
        'Valid ID',
        'Proof of Income (if employed)',
        'Medical Certificate (if for medical assistance)',
        'Barangay Clearance',
        'Processing Fee: Free'
      ],
      processing_time: '3-5 working days'
    },
    {
      type: 'Good Moral Certificate',
      icon: '👥',
      description: 'Character reference for employment or school',
      requirements: [
        'Valid ID',
        'Barangay Clearance',
        '1x1 ID Picture (1 copy)',
        'Letter of Request stating purpose',
        'Processing Fee: ₱50.00'
      ],
      processing_time: '3-5 working days'
    },
    {
      type: 'Business Clearance',
      icon: '🏪',
      description: 'Needed for business registration and renewal',
      requirements: [
        'DTI/SEC Registration',
        'Valid ID of Business Owner',
        'Proof of Business Location',
        'Barangay Clearance (Personal)',
        'Processing Fee: ₱200.00'
      ],
      processing_time: '5-7 working days'
    },
    {
      type: 'Construction Clearance',
      icon: '🏗️',
      description: 'Required before starting any construction project',
      requirements: [
        'Building Permit from City Hall',
        'Approved Building Plans',
        'Valid ID of Property Owner',
        'Land Title or Tax Declaration',
        'Processing Fee: ₱500.00'
      ],
      processing_time: '7-10 working days'
    },
    {
      type: 'Community Tax Certificate (Cedula)',
      icon: '📋',
      description: 'Annual tax certificate for residents',
      requirements: [
        'Valid ID',
        'Proof of Income',
        'Processing Fee: Based on income bracket'
      ],
      processing_time: '1-2 working days'
    },
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

// Public: Submit document request (can be authenticated or unauthenticated)
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
      // Token not provided or invalid, continue as public request
    }

    const { requester_name, document_type, purpose, contact_number, email, address, additional_info } = req.body;

    // Use email from token if available, otherwise use provided email
    const finalEmail = userEmail || email;

    // Validation
    if (!requester_name || !document_type || !purpose || !contact_number || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate reference number
    const year = new Date().getFullYear();
    const countResult = await query(
      'SELECT COUNT(*) as count FROM document_requests WHERE YEAR(created_at) = ?',
      [year]
    );
    const count = countResult[0].count + 1;
    const referenceNo = `DOC-${year}-${String(count).padStart(3, '0')}`;

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

// Protected: Get all document requests (admin/staff)
router.get('/document-requests', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let sql = 'SELECT * FROM document_requests WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (requester_name LIKE ? OR reference_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY date_filed DESC LIMIT 25';

    const requests = await query(sql, params);
    res.json(requests);
  } catch (error) {
    console.error('Get document requests error:', error);
    res.status(500).json({ error: 'Failed to fetch document requests' });
  }
});

// Protected: Get my document requests (resident)
router.get('/my-document-requests', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { status } = req.query;
    
    let sql = 'SELECT * FROM document_requests WHERE email = ?';
    const params = [userEmail];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY date_filed DESC';

    const requests = await query(sql, params);
    res.json(requests);
  } catch (error) {
    console.error('Get my document requests error:', error);
    res.status(500).json({ error: 'Failed to fetch document requests' });
  }
});

// Protected: Update document request status (admin/staff)
router.put('/document-requests/:id', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Status is required.'
      });
    }

    // Valid statuses
    const validStatuses = ['Pending', 'Review', 'Approved', 'Rejected', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if request exists
    const requests = await query('SELECT * FROM document_requests WHERE id = ?', [requestId]);
    if (requests.length === 0) {
      return res.status(404).json({ 
        error: 'Document request not found',
        message: 'The document request does not exist.'
      });
    }

    const request = requests[0];

    // Update request
    await query(
      'UPDATE document_requests SET status = ?, notes = ?, updated_at = NOW() WHERE id = ?',
      [status, notes || null, requestId]
    );

    console.log(`✅ Document request ${requestId} updated to ${status} by ${req.user.email}`);

// --- BEGIN NODEMAILER LOGIC ---
    try {
      // 1. Fetch the resident's email and details from MySQL (Fixed column names!)
      const emailQuery = await query(
        'SELECT email, requester_name, document_type, reference_no FROM document_requests WHERE id = ?', 
        [requestId]
      );
      
      const reqData = emailQuery[0];

      // 2. If an email exists in the database, send the notification
      if (reqData && reqData.email) {
        const mailOptions = {
          from: '"Barangay 853 Admin" <barangay853kahilomiii@gmail.com>',
          to: reqData.email,
          subject: `Update on your Barangay Document Request: ${status}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
              <h2 style="color: #2563eb;">Document Request Update</h2>
              <p>Hello <strong>${reqData.requester_name || 'Resident'}</strong>,</p>
              <p>Your request for a <strong>${reqData.document_type || 'Document'}</strong> has been updated to:</p>
              <h3 style="background: #f3f4f6; padding: 10px; text-align: center; border-radius: 5px; color: #1f2937;">
                STATUS: ${status.toUpperCase()}
              </h3>
              <p>Tracking Reference Number: <strong>${reqData.reference_no || requestId}</strong></p>
              <p>You can track the exact details anytime on the Barangay 853 Public Portal.</p>
              <br/>
              <p style="color: #6b7280; font-size: 12px;">Thank you,<br/>Barangay 853 Administration</p>
            </div>
          `
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) console.error('⚠️ Error sending email:', error);
          else console.log('✅ Email notification sent to:', reqData.email);
        });
      } else {
        console.log('⚠️ No email address found for this request in the database.');
      }
    } catch (emailErr) {
      console.error('⚠️ Could not fetch email data:', emailErr);
    }
    // --- END NODEMAILER LOGIC ---
    
    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: status === 'Approved' ? 'Approved' : status === 'Rejected' ? 'Rejected' : `Updated to ${status}`,
      module: 'Document',
      referenceId: request.reference_no || `DOC-${requestId}`,
      details: `${request.document_type} - ${request.requester_name}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({
      message: 'Document request updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Update document request error:', error);
    res.status(500).json({ 
      error: 'Failed to update document request',
      message: 'An error occurred while updating the document request.'
    });
  }
});

// Protected: Get document request by ID
router.get('/document-requests/:id', authenticateToken, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    
    const requests = await query('SELECT * FROM document_requests WHERE id = ?', [requestId]);
    
    if (requests.length === 0) {
      return res.status(404).json({ 
        error: 'Document request not found',
        message: 'The document request does not exist.'
      });
    }

    res.json(requests[0]);
  } catch (error) {
    console.error('Get document request error:', error);
    res.status(500).json({ error: 'Failed to fetch document request' });
  }
});

module.exports = router;

