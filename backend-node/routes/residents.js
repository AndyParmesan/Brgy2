const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;
const { logActivity } = require('../utils/activityLogger');
const multer = require('multer');
const path = require('path');

// --- MULTER PHOTO STORAGE SETUP ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, 'resident-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 } // 5MB limit
});

// Protected: Get all residents
router.get('/residents', authenticateToken, async (req, res) => {
  try {
    const { search, zone } = req.query;
    
    let sql = `SELECT * FROM residents WHERE 1=1`;
    const params = [];

    if (search) {
      sql += ' AND (full_name LIKE ? OR contact_mobile LIKE ? OR contact_email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (zone) {
      sql += ' AND zone = ?';
      params.push(zone);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const residents = await query(sql, params);
    res.json(residents);
  } catch (error) {
    console.error('Get residents error:', error);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
});

// Protected: Get resident by ID
router.get('/residents/:id', authenticateToken, async (req, res) => {
  try {
    const residentId = parseInt(req.params.id);
    const residents = await query('SELECT * FROM residents WHERE id = ?', [residentId]);
    
    if (residents.length === 0) {
      return res.status(404).json({ error: 'Resident not found' });
    }
    res.json(residents[0]);
  } catch (error) {
    console.error('Get resident error:', error);
    res.status(500).json({ error: 'Failed to fetch resident' });
  }
});

// NEW ROUTE: Get household members for a specific resident
router.get('/residents/:id/household', authenticateToken, async (req, res) => {
  try {
    const residentId = parseInt(req.params.id);
    
    // Find what household this resident belongs to
    const resData = await query('SELECT household_id FROM residents WHERE id = ?', [residentId]);
    
    if (resData.length === 0 || !resData[0].household_id) {
      return res.json([]); // No household ID assigned
    }

    // Fetch all OTHER members in the same household
    const members = await query(
      'SELECT id, full_name, relationship_to_head, date_of_birth, contact_mobile FROM residents WHERE household_id = ? AND id != ? ORDER BY created_at ASC', 
      [resData[0].household_id, residentId]
    );

    res.json(members);
  } catch (error) {
    console.error('Household fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch household members' });
  }
});

// Protected: Create resident (UPDATED WITH PWD & HOUSEHOLD)
router.post('/residents', authenticateToken, async (req, res) => {
  try {
    const { full_name, contact_mobile, contact_email, address, zone, date_of_birth, gender, occupation, is_pwd, household_id, relationship_to_head } = req.body;

    if (!full_name || !contact_mobile || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(
      `INSERT INTO residents 
       (full_name, contact_mobile, contact_email, address, zone, date_of_birth, gender, occupation, is_pwd, household_id, relationship_to_head, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        full_name, contact_mobile, contact_email || null, address, zone || null, 
        date_of_birth || null, gender || null, occupation || null, 
        is_pwd ? 1 : 0, household_id || null, relationship_to_head || 'Head'
      ]
    );

    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Created',
      module: 'Resident',
      referenceId: `RES-${result.insertId}`,
      details: full_name,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.status(201).json({ success: true, resident: { id: result.insertId, full_name } });
  } catch (error) {
    console.error('Create resident error:', error);
    res.status(500).json({ error: 'Failed to create resident' });
  }
});

// Protected: Update resident (UPDATED WITH PWD & HOUSEHOLD)
router.put('/residents/:id', authenticateToken, async (req, res) => {
  try {
    const residentId = parseInt(req.params.id);
    const { full_name, contact_mobile, contact_email, address, zone, date_of_birth, gender, occupation, is_pwd, household_id, relationship_to_head } = req.body;

    const residents = await query('SELECT * FROM residents WHERE id = ?', [residentId]);
    if (residents.length === 0) return res.status(404).json({ error: 'Resident not found' });

    await query(
      `UPDATE residents SET 
       full_name = ?, contact_mobile = ?, contact_email = ?, address = ?, 
       zone = ?, date_of_birth = ?, gender = ?, occupation = ?, is_pwd = ?, household_id = ?, relationship_to_head = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        full_name || residents[0].full_name, contact_mobile || residents[0].contact_mobile, 
        contact_email || residents[0].contact_email, address || residents[0].address, 
        zone || residents[0].zone, date_of_birth || residents[0].date_of_birth, 
        gender || residents[0].gender, occupation || residents[0].occupation, 
        is_pwd !== undefined ? (is_pwd ? 1 : 0) : residents[0].is_pwd,
        household_id !== undefined ? household_id : residents[0].household_id,
        relationship_to_head || residents[0].relationship_to_head,
        residentId
      ]
    );

    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Updated',
      module: 'Resident',
      referenceId: `RES-${residentId}`,
      details: full_name || residents[0].full_name,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({ success: true, message: 'Updated successfully' });
  } catch (error) {
    console.error('Update resident error:', error);
    res.status(500).json({ error: 'Failed to update resident' });
  }
});

// Protected: Delete resident
router.delete('/residents/:id', authenticateToken, async (req, res) => {
  try {
    const residentId = parseInt(req.params.id);
    const residents = await query('SELECT * FROM residents WHERE id = ?', [residentId]);
    if (residents.length === 0) return res.status(404).json({ error: 'Resident not found' });

    await query('DELETE FROM residents WHERE id = ?', [residentId]);

    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Deleted',
      module: 'Resident',
      referenceId: `RES-${residentId}`,
      details: residents[0].full_name,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete resident' });
  }
});

// Protected: Upload a resident photo
router.post('/residents/:id/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
    
    await query('UPDATE residents SET photo_url = ? WHERE id = ?', [req.file.filename, req.params.id]);
    res.json({ success: true, photo_url: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

module.exports = router;