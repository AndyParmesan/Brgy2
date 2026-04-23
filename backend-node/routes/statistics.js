const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const authRoutes = require('./auth');
const authenticateToken = authRoutes.authenticateToken;

// Protected: Get dashboard statistics (admin/staff)
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    // Get total residents count
    const residentsCount = await query('SELECT COUNT(*) as count FROM residents');
    const totalResidents = residentsCount[0]?.count || 0;

    // Get total households (assuming one resident per household for now, or count distinct addresses)
    const householdsCount = await query('SELECT COUNT(DISTINCT address) as count FROM residents WHERE address IS NOT NULL AND address != ""');
    const totalHouseholds = householdsCount[0]?.count || 0;

    // Get pending document requests
    const pendingDocs = await query('SELECT COUNT(*) as count FROM document_requests WHERE status IN ("Pending", "Review")');
    const pendingRequests = pendingDocs[0]?.count || 0;

    // Get active blotter cases
    const activeBlotters = await query('SELECT COUNT(*) as count FROM blotter_cases WHERE status IN ("Pending", "In Progress")');
    const activeBlotterCases = activeBlotters[0]?.count || 0;

    // Get document requests by status
    const docStatusCounts = await query(`
      SELECT status, COUNT(*) as count 
      FROM document_requests 
      GROUP BY status
    `);
    const documentStatusBreakdown = {};
    docStatusCounts.forEach(item => {
      documentStatusBreakdown[item.status] = item.count;
    });

    // Get blotter cases by status
    const blotterStatusCounts = await query(`
      SELECT status, COUNT(*) as count 
      FROM blotter_cases 
      GROUP BY status
    `);
    const blotterStatusBreakdown = {};
    blotterStatusCounts.forEach(item => {
      blotterStatusBreakdown[item.status] = item.count;
    });

    // Get recent activity (last 7 days)
    const recentDocuments = await query(`
      SELECT COUNT(*) as count 
      FROM document_requests 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const recentBlotters = await query(`
      SELECT COUNT(*) as count 
      FROM blotter_cases 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const recentResidents = await query(`
      SELECT COUNT(*) as count 
      FROM residents 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Get monthly trends (last 6 months)
    const monthlyTrends = await query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        'documents' as type
      FROM document_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      UNION ALL
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        'blotters' as type
      FROM blotter_cases
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      UNION ALL
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        'residents' as type
      FROM residents
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    // Get document types breakdown
    const docTypes = await query(`
      SELECT document_type, COUNT(*) as count 
      FROM document_requests 
      GROUP BY document_type 
      ORDER BY count DESC 
      LIMIT 10
    `);

    // Get blotter categories breakdown
    const blotterCategories = await query(`
      SELECT category, COUNT(*) as count 
      FROM blotter_cases 
      WHERE category IS NOT NULL
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 10
    `);

    res.json({
      overview: {
        totalResidents,
        totalHouseholds,
        pendingRequests,
        activeBlotterCases
      },
      documentRequests: {
        byStatus: documentStatusBreakdown,
        byType: docTypes,
        recent: recentDocuments[0]?.count || 0
      },
      blotterCases: {
        byStatus: blotterStatusBreakdown,
        byCategory: blotterCategories,
        recent: recentBlotters[0]?.count || 0
      },
      residents: {
        recent: recentResidents[0]?.count || 0
      },
      trends: monthlyTrends
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: 'An error occurred while fetching statistics.'
    });
  }
});

module.exports = router;

