const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;

// Protected: Get activity logs (audit log)
router.get('/activity-logs', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, module, actor, dateFrom, dateTo } = req.query;
    let sql = 'SELECT * FROM activity_logs WHERE 1=1';
    const params = [];

    if (module && module !== 'all') {
      sql += ' AND module = ?';
      params.push(module);
    }

    if (actor) {
      sql += ' AND actor_name LIKE ?';
      params.push(`%${actor}%`);
    }

    if (dateFrom) {
      sql += ' AND DATE(logged_at) >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += ' AND DATE(logged_at) <= ?';
      params.push(dateTo);
    }

    sql += ' ORDER BY logged_at DESC, created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const logs = await query(sql, params);
    res.json(logs);
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
