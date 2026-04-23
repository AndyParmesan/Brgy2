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
    // This renames the file to something unique like: resident-1678901234.jpg
    cb(null, 'resident-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 } // 5MB limit
});

// Protected: Get all residents (from residents table)
router.get('/residents', authenticateToken, async (req, res) => {
  try {
    const { search, zone } = req.query;
    
    // Fetch from residents table
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
    
    console.log(`✅ Residents fetched: ${residents.length} residents found`);
    
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
      return res.status(404).json({ 
        error: 'Resident not found',
        message: 'The resident does not exist.'
      });
    }

    res.json(residents[0]);
  } catch (error) {
    console.error('Get resident error:', error);
    res.status(500).json({ error: 'Failed to fetch resident' });
  }
});

// Protected: Create resident (admin/staff)
router.post('/residents', authenticateToken, async (req, res) => {
  try {
    console.log('📝 POST /api/residents - Create resident request');
    console.log('   User:', req.user?.email, 'Role:', req.user?.role);
    console.log('   Request body:', JSON.stringify(req.body, null, 2));

    const { full_name, contact_mobile, contact_email, address, zone, date_of_birth, gender, occupation } = req.body;

    // Validation
    if (!full_name || !contact_mobile || !address) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Full name, contact number, and address are required.'
      });
    }

    // Insert resident
    console.log('   Executing INSERT query...');
    const result = await query(
      `INSERT INTO residents 
       (full_name, contact_mobile, contact_email, address, zone, date_of_birth, gender, occupation, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        full_name,
        contact_mobile,
        contact_email || null,
        address,
        zone || null,
        date_of_birth || null,
        gender || null,
        occupation || null
      ]
    );

    console.log(`✅ Resident created by ${req.user.email}: ${full_name} (ID: ${result.insertId})`);

    // Log activity
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

    res.status(201).json({
      message: 'Resident created successfully',
      success: true,
      resident: {
        id: result.insertId,
        full_name,
        contact_mobile
      }
    });
  } catch (error) {
    console.error('❌ Create resident error:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   SQL State:', error.sqlState);
    
    // Check if table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Database table missing',
        message: 'The residents table does not exist. Please contact the administrator to set up the database.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create resident',
      message: error.message || 'An error occurred while creating the resident.'
    });
  }
});

// Protected: Update resident (admin/staff)
router.put('/residents/:id', authenticateToken, async (req, res) => {
  try {
    const residentId = parseInt(req.params.id);
    const { full_name, contact_mobile, contact_email, address, zone, date_of_birth, gender, occupation } = req.body;

    // Check if resident exists
    const residents = await query('SELECT * FROM residents WHERE id = ?', [residentId]);
    if (residents.length === 0) {
      return res.status(404).json({ 
        error: 'Resident not found',
        message: 'The resident does not exist.'
      });
    }

    // Update resident
    await query(
      `UPDATE residents SET 
       full_name = ?, contact_mobile = ?, contact_email = ?, address = ?, 
       zone = ?, date_of_birth = ?, gender = ?, occupation = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        full_name || residents[0].full_name,
        contact_mobile || residents[0].contact_mobile,
        contact_email || residents[0].contact_email,
        address || residents[0].address,
        zone || residents[0].zone,
        date_of_birth || residents[0].date_of_birth,
        gender || residents[0].gender,
        occupation || residents[0].occupation,
        residentId
      ]
    );

    console.log(`✅ Resident ${residentId} updated by ${req.user.email}`);

    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Updated',
      module: 'Resident',
      referenceId: `RES-${residentId}`,
      details: full_name || residents[0].full_name,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({
      message: 'Resident updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Update resident error:', error);
    res.status(500).json({ 
      error: 'Failed to update resident',
      message: 'An error occurred while updating the resident.'
    });
  }
});

// Protected: Delete resident (admin/staff)
router.delete('/residents/:id', authenticateToken, async (req, res) => {
  try {
    const residentId = parseInt(req.params.id);

    // Check if resident exists
    const residents = await query('SELECT * FROM residents WHERE id = ?', [residentId]);
    if (residents.length === 0) {
      return res.status(404).json({ 
        error: 'Resident not found',
        message: 'The resident does not exist.'
      });
    }

    const resident = residents[0];

    // Delete resident
    await query('DELETE FROM residents WHERE id = ?', [residentId]);

    console.log(`✅ Resident ${residentId} deleted by ${req.user.email}`);

    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Deleted',
      module: 'Resident',
      referenceId: `RES-${residentId}`,
      details: resident.full_name,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({
      message: 'Resident deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Delete resident error:', error);
    res.status(500).json({ 
      error: 'Failed to delete resident',
      message: 'An error occurred while deleting the resident.'
    });
  }
});

// Protected: Upload a resident photo
router.post('/residents/:id/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const residentId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    // The unique filename multer just generated
    const photoFilename = req.file.filename;

    // Save the filename to the database
    await query(
      'UPDATE residents SET photo_url = ? WHERE id = ?',
      [photoFilename, residentId]
    );

    res.json({ 
      success: true, 
      message: 'Photo uploaded successfully',
      photo_url: photoFilename
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

module.exports = router;
