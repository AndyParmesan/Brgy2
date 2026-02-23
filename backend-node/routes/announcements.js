const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;
const { logActivity } = require('../utils/activityLogger');

// Create a separate public router to avoid route conflicts
const publicRouter = express.Router();

// Public: Get published announcements (no authentication required)
// This route is mounted at /api/public, so the full path is /api/public/announcements
publicRouter.get('/announcements', async (req, res) => {
  console.log('📢 GET /api/public/announcements - Public route hit (no auth required)');
  try {
    const { category } = req.query;
    const now = new Date().toISOString().split('T')[0];

    let sql = `
      SELECT * FROM announcements 
      WHERE status = 'Published' 
      AND (published_on IS NULL OR published_on <= ?)
      AND (expires_on IS NULL OR expires_on >= ?)
    `;
    const params = [now, now];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY COALESCE(published_on, created_at) DESC LIMIT 50';

    const announcements = await query(sql, params);

    console.log(`📢 Public announcements query: Found ${announcements.length} published announcements`);

    // Format for frontend
    const formatted = announcements.map(announcement => {
      const publishedDate = announcement.published_on 
        ? new Date(announcement.published_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : announcement.created_at
        ? new Date(announcement.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

      return {
        id: announcement.id,
        title: announcement.title,
        summary: announcement.summary,
        body: announcement.body,
        category: announcement.category || 'announcements',
        badge: announcement.category === 'services' ? 'Service' : 
               (announcement.category === 'events' ? 'Event' : 'Announcement'),
        date: publishedDate ? `Posted: ${publishedDate}` : 'Available Daily',
        description: announcement.summary || announcement.body || '',
        items: announcement.items ? (typeof announcement.items === 'string' ? JSON.parse(announcement.items) : announcement.items) : null,
        info: announcement.info || null,
        note: announcement.note || null,
        link: announcement.link || null,
        highlights: announcement.highlights ? (typeof announcement.highlights === 'string' ? JSON.parse(announcement.highlights) : announcement.highlights) : null,
        schedule: announcement.schedule ? (typeof announcement.schedule === 'string' ? JSON.parse(announcement.schedule) : announcement.schedule) : null,
        published_on: announcement.published_on,
        expires_on: announcement.expires_on,
        target_audience: announcement.target_audience,
        priority: announcement.priority || 'Normal'
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('❌ Get public announcements error:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error('   SQL State:', error.sqlState);
    res.status(500).json({ 
      error: 'Failed to fetch announcements',
      message: error.message || 'An error occurred while fetching announcements.'
    });
  }
});

// Protected: Get all announcements (admin)
// This route is mounted at /api, so the full path is /api/announcements
router.get('/announcements', authenticateToken, async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let sql = 'SELECT * FROM announcements WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (title LIKE ? OR target_audience LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const announcements = await query(sql, params);
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Protected: Create announcement (admin/staff)
router.post('/announcements', authenticateToken, async (req, res) => {
  try {
    const { title, summary, body, category, status, priority, target_audience, published_on, expires_on, link, items, highlights, schedule, info, note } = req.body;

    // Validation
    if (!title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Title and body are required.'
      });
    }

    // Generate reference number
    const year = new Date().getFullYear();
    const countResult = await query(
      'SELECT COUNT(*) as count FROM announcements WHERE YEAR(created_at) = ?',
      [year]
    );
    const count = countResult[0].count + 1;
    const referenceNo = `ANN-${year}-${String(count).padStart(3, '0')}`;

    // Insert announcement
    const result = await query(
      `INSERT INTO announcements 
       (reference_no, title, summary, body, category, status, priority, target_audience, 
        published_on, expires_on, link, items, highlights, schedule, info, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        referenceNo,
        title,
        summary || null,
        body,
        category || 'announcements',
        status || 'Draft',
        priority || 'Normal',
        target_audience || null,
        published_on || null,
        expires_on || null,
        link || null,
        items ? JSON.stringify(items) : null,
        highlights ? JSON.stringify(highlights) : null,
        schedule ? JSON.stringify(schedule) : null,
        info || null,
        note || null
      ]
    );

    console.log(`✅ Announcement created by ${req.user.email}: ${title}`);

    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Created',
      module: 'Announcement',
      referenceId: referenceNo,
      details: title,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.status(201).json({
      message: 'Announcement created successfully',
      success: true,
      announcement: {
        id: result.insertId,
        reference_no: referenceNo,
        title,
        status: status || 'Draft'
      }
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ 
      error: 'Failed to create announcement',
      message: 'An error occurred while creating the announcement. Please try again later.'
    });
  }
});

// Protected: Update announcement (admin/staff)
router.put('/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const announcementId = parseInt(req.params.id);
    const { title, summary, body, category, status, priority, target_audience, published_on, expires_on, link, items, highlights, schedule, info, note } = req.body;

    // Check if announcement exists
    const announcements = await query('SELECT * FROM announcements WHERE id = ?', [announcementId]);
    if (announcements.length === 0) {
      return res.status(404).json({ 
        error: 'Announcement not found',
        message: 'The announcement does not exist.'
      });
    }

    const announcement = announcements[0];

    // Update announcement
    await query(
      `UPDATE announcements SET
       title = ?, summary = ?, body = ?, category = ?, status = ?, priority = ?,
       target_audience = ?, published_on = ?, expires_on = ?, link = ?,
       items = ?, highlights = ?, schedule = ?, info = ?, note = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        summary || null,
        body,
        category || 'announcements',
        status || 'Draft',
        priority || 'Normal',
        target_audience || null,
        published_on || null,
        expires_on || null,
        link || null,
        items ? JSON.stringify(items) : null,
        highlights ? JSON.stringify(highlights) : null,
        schedule ? JSON.stringify(schedule) : null,
        info || null,
        note || null,
        announcementId
      ]
    );

    console.log(`✅ Announcement ${announcementId} updated by ${req.user.email}`);

    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Updated',
      module: 'Announcement',
      referenceId: announcement.reference_no || `ANN-${announcementId}`,
      details: title || announcement.title,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({
      message: 'Announcement updated successfully',
      success: true
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ 
      error: 'Failed to update announcement',
      message: 'An error occurred while updating the announcement.'
    });
  }
});

// Protected: Delete announcement (admin/staff)
router.delete('/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const announcementId = parseInt(req.params.id);

    // Check if announcement exists
    const announcements = await query('SELECT * FROM announcements WHERE id = ?', [announcementId]);
    if (announcements.length === 0) {
      return res.status(404).json({ 
        error: 'Announcement not found',
        message: 'The announcement does not exist.'
      });
    }

    const announcement = announcements[0];

    // Delete announcement
    await query('DELETE FROM announcements WHERE id = ?', [announcementId]);

    console.log(`✅ Announcement ${announcementId} deleted by ${req.user.email}`);

    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Deleted',
      module: 'Announcement',
      referenceId: announcement.reference_no || `ANN-${announcementId}`,
      details: announcement.title,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({
      message: 'Announcement deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ 
      error: 'Failed to delete announcement',
      message: 'An error occurred while deleting the announcement.'
    });
  }
});

// Export both routers
module.exports = router;
module.exports.publicRouter = publicRouter;
