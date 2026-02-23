const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;
const { logActivity } = require('../utils/activityLogger');

// Public: Submit incident report
router.post('/public/report', async (req, res) => {
  try {
    const {
      reporter_name,
      reporter_contact,
      reporter_email,
      reporter_address,
      incident_type,
      incident_date,
      incident_time,
      incident_location,
      incident_description,
      persons_involved,
      witnesses
    } = req.body;

    // Validation
    if (!reporter_name || !reporter_contact || !reporter_address || !incident_type || 
        !incident_date || !incident_time || !incident_location || !incident_description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate case number
    const year = new Date().getFullYear();
    const countResult = await query(
      'SELECT COUNT(*) as count FROM blotter_cases WHERE YEAR(created_at) = ?',
      [year]
    );
    const count = countResult[0].count + 1;
    const caseNo = `BR-${year}-${String(count).padStart(3, '0')}`;

    const caseTitle = `${incident_type} at ${incident_location}`;
    const summary = incident_description.substring(0, 255);

    // Insert blotter case
    const result = await query(
      `INSERT INTO blotter_cases 
       (case_no, case_title, category, location, date_reported, incident_date, incident_time, 
        status, priority, summary, description, reporter_name, reporter_contact, reporter_email, 
        reporter_address, persons_involved, witnesses)
       VALUES (?, ?, ?, ?, NOW(), ?, ?, 'Pending', 'Normal', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caseNo, caseTitle, incident_type, incident_location, incident_date, incident_time,
        summary, incident_description, reporter_name, reporter_contact, reporter_email || null,
        reporter_address, persons_involved || null, witnesses || null
      ]
    );

    // Log activity
    await logActivity({
      actorName: reporter_name,
      action: 'Reported',
      module: 'Blotter',
      referenceId: caseNo,
      details: `${incident_type} at ${incident_location}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: reporter_email,
      actorRole: 'resident'
    });

    res.status(201).json({
      message: 'Incident report submitted successfully',
      reference_no: caseNo,
      data: {
        id: result.insertId,
        case_no: caseNo,
        case_title: caseTitle,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to submit incident report' });
  }
});

// Protected: Get all blotter cases (admin/staff)
router.get('/blotter-cases', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let sql = 'SELECT * FROM blotter_cases WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (case_title LIKE ? OR case_no LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY date_reported DESC LIMIT 25';

    const cases = await query(sql, params);
    res.json(cases);
  } catch (error) {
    console.error('Get blotter cases error:', error);
    res.status(500).json({ error: 'Failed to fetch blotter cases' });
  }
});

// Protected: Get my blotter cases (resident)
router.get('/my-blotter-cases', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { status } = req.query;
    
    let sql = 'SELECT * FROM blotter_cases WHERE reporter_email = ?';
    const params = [userEmail];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY date_reported DESC';

    const cases = await query(sql, params);
    res.json(cases);
  } catch (error) {
    console.error('Get my blotter cases error:', error);
    res.status(500).json({ error: 'Failed to fetch blotter cases' });
  }
});

// Protected: Update blotter case status (admin/staff)
router.put('/blotter-cases/:id', authenticateToken, async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);
    const { status, priority, notes, investigator_name, next_hearing_date } = req.body;

    if (!status) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Status is required.'
      });
    }

    // Valid statuses
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if case exists
    const cases = await query('SELECT * FROM blotter_cases WHERE id = ?', [caseId]);
    if (cases.length === 0) {
      return res.status(404).json({ 
        error: 'Blotter case not found',
        message: 'The blotter case does not exist.'
      });
    }

    const case_ = cases[0];

    // Update case
    await query(
      `UPDATE blotter_cases SET 
       status = ?, priority = ?, notes = ?, investigator_name = ?, 
       next_hearing_date = ?, updated_at = NOW() 
       WHERE id = ?`,
      [
        status,
        priority || cases[0].priority || 'Normal',
        notes || null,
        investigator_name || null,
        next_hearing_date || null,
        caseId
      ]
    );

    console.log(`✅ Blotter case ${caseId} updated to ${status} by ${req.user.email}`);

    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: status === 'Resolved' ? 'Resolved' : `Updated to ${status}`,
      module: 'Blotter',
      referenceId: case_.case_no || `BR-${caseId}`,
      details: case_.case_title,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({
      message: 'Blotter case updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Update blotter case error:', error);
    res.status(500).json({ 
      error: 'Failed to update blotter case',
      message: 'An error occurred while updating the blotter case.'
    });
  }
});

// Protected: Get blotter case by ID
router.get('/blotter-cases/:id', authenticateToken, async (req, res) => {
  try {
    const caseId = parseInt(req.params.id);
    
    const cases = await query('SELECT * FROM blotter_cases WHERE id = ?', [caseId]);
    
    if (cases.length === 0) {
      return res.status(404).json({ 
        error: 'Blotter case not found',
        message: 'The blotter case does not exist.'
      });
    }

    res.json(cases[0]);
  } catch (error) {
    console.error('Get blotter case error:', error);
    res.status(500).json({ error: 'Failed to fetch blotter case' });
  }
});

module.exports = router;

