const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;

// PUBLIC: Get all officials for the About Page
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT * FROM barangay_officials ORDER BY display_order ASC, id ASC';
    const officials = await query(sql);
    res.json(officials);
  } catch (error) {
    console.error('Error fetching officials:', error);
    res.status(500).json({ error: 'Failed to fetch officials' });
  }
});

// PROTECTED (Admin): Add a new official
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, position, category, image_url, display_order } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add officials' });
    }

    const sql = 'INSERT INTO barangay_officials (name, position, category, image_url, display_order) VALUES (?, ?, ?, ?, ?)';
    const result = await query(sql, [name, position, category || 'Kagawad', image_url || null, display_order || 0]);
    
    res.status(201).json({ message: 'Official added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding official:', error);
    res.status(500).json({ error: 'Failed to add official' });
  }
});

// PROTECTED (Admin): Update an official
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, position, category, image_url, display_order } = req.body;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update officials' });
    }

    const sql = 'UPDATE barangay_officials SET name = ?, position = ?, category = ?, image_url = ?, display_order = ? WHERE id = ?';
    await query(sql, [name, position, category, image_url || null, display_order || 0, req.params.id]);
    
    res.json({ message: 'Official updated successfully' });
  } catch (error) {
    console.error('Error updating official:', error);
    res.status(500).json({ error: 'Failed to update official' });
  }
});

// PROTECTED (Admin): Delete an official
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete officials' });
    }

    const sql = 'DELETE FROM barangay_officials WHERE id = ?';
    await query(sql, [req.params.id]);
    
    res.json({ message: 'Official deleted successfully' });
  } catch (error) {
    console.error('Error deleting official:', error);
    res.status(500).json({ error: 'Failed to delete official' });
  }
});

module.exports = router;