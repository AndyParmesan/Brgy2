const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;

// Protected: Get activity logs (audit log)
router.get('/activity-logs', authenticateToken, async (req, res) => {
  try {
    // Parse limit FIRST as a safe integer - embed directly in SQL
    // to avoid mysql2 prepared statement type issues with LIMIT ?
    const limitNum = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 1000);

    const { module, actor, dateFrom, dateTo } = req.query;
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

    // Embed limitNum directly as a literal - NOT as a ? parameter
    // This is safe because limitNum is always a validated integer (never user string)
    sql += ` ORDER BY logged_at DESC, created_at DESC LIMIT ${limitNum}`;

    const logs = await query(sql, params);
    res.json(logs);
  } catch (error) {
    console.error('Get activity logs error:', error);
    console.error('  errno:', error.errno, '| code:', error.code);
    console.error('  sqlMessage:', error.sqlMessage);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

module.exports = router;
