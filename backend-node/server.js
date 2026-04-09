const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, query } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const announcementRoutes = require('./routes/announcements');
const announcementPublicRoutes = require('./routes/announcements').publicRouter || require('./routes/announcements');
const documentRoutes = require('./routes/documents');
const blotterRoutes = require('./routes/blotter');
const contactRoutes = require('./routes/contact');
const residentRoutes = require('./routes/residents');
const activityLogRoutes = require('./routes/activityLogs');
const statisticsRoutes = require('./routes/statistics');


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
// Increase body size limit to handle base64 image uploads (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging - MUST be before routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.path.includes('/users') || req.path.includes('/user') || req.path.includes('/create-user')) {
    console.log(`  📍 Auth route detected: ${req.method} ${req.path}`);
    console.log(`  Headers:`, {
      authorization: req.headers.authorization ? 'Bearer ***' : 'none',
      'content-type': req.headers['content-type']
    });
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', authRoutes); // Register endpoint is in auth routes

// Debug: Log all registered routes
console.log('\n📋 ===== Registered API Routes =====');
console.log('  GET  /api/auth/user - Get current user');
console.log('  GET  /api/auth/profile - Get user profile');
console.log('  PUT  /api/auth/profile - Update user profile');
console.log('  PUT  /api/auth/profile/avatar - Update avatar');
console.log('  GET  /api/auth/users - Get all users (admin only)');
console.log('  GET  /api/auth/test-users-route - Test route');
console.log('  POST /api/auth/login - Login');
console.log('  POST /api/auth/logout - Logout');
console.log('  POST /api/auth/create-user - Create user (admin only)');
console.log('  DELETE /api/auth/users/:id - Delete user (admin only)');
console.log('  POST /api/public/register - Register new resident');
console.log('=====================================\n');
// Public routes (no authentication required)
// Use publicRouter for public announcements endpoint to avoid route conflicts
if (announcementPublicRoutes && announcementPublicRoutes !== announcementRoutes) {
  app.use('/api/public', announcementPublicRoutes);
} else {
  app.use('/api/public', announcementRoutes);
}
app.use('/api/public', documentRoutes);
app.use('/api/public', blotterRoutes);
app.use('/api/public', contactRoutes);

// ==========================================
// PUBLIC ROUTES (No Auth Required)
// ==========================================
app.get('/api/public/track-document/:id', async (req, res) => {
  try {
    const trackingId = req.params.id;

    // We use your exact database columns (reference_no, requester_name, date_filed)
    // and map them to what the React frontend expects (id, full_name, created_at)
    const sql = `
      SELECT 
        reference_no AS id, 
        requester_name AS full_name, 
        document_type, 
        purpose, 
        status, 
        date_filed AS created_at 
      FROM document_requests 
      WHERE reference_no = ? OR id = ?
    `;
    
    // Pass trackingId twice so they can search by "DOC-2024-001" or just "1"
    const results = await query(sql, [trackingId, trackingId]);

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found or invalid ID.' });
    }

    res.json({ success: true, request: results[0] });
  } catch (error) {
    console.error('Error tracking document:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tracking info' });
  }
});

// Protected routes (authentication required)
app.use('/api', residentRoutes);
app.use('/api', announcementRoutes);
app.use('/api', documentRoutes);
app.use('/api', blotterRoutes);
app.use('/api', activityLogRoutes);
app.use('/api', statisticsRoutes);
app.use('/api', contactRoutes); 

// ==========================================
// GLOBAL SEARCH ROUTE
// ==========================================
app.get('/api/search', async (req, res) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) return res.json({ results: [] });

    // The % wildcard allows us to search for partial matches
    const searchParam = `%${searchQuery}%`;

    // 1. Search Residents
    const residents = await query(
      `SELECT 
        id, 
        full_name AS title, 
        'Resident Profile' AS subtitle, 
        'Resident' AS type, 
        'registered' AS status 
       FROM residents 
       WHERE full_name LIKE ? LIMIT 3`,
      [searchParam]
    );

    // 2. Search Documents
    const documents = await query(
      `SELECT 
        reference_no AS id, 
        reference_no AS title, 
        document_type AS subtitle, 
        'Document' AS type, 
        status 
       FROM document_requests 
       WHERE reference_no LIKE ? OR requester_name LIKE ? LIMIT 3`,
      [searchParam, searchParam]
    );

    // 3. Search Blotters (FIXED DATABASE COLUMNS HERE)
    const blotters = await query(
      `SELECT 
        case_no AS id, 
        case_no AS title, 
        category AS subtitle, 
        'Blotter' AS type, 
        status 
       FROM blotter_cases 
       WHERE case_no LIKE ? OR reporter_name LIKE ? OR persons_involved LIKE ? LIMIT 3`,
      [searchParam, searchParam, searchParam]
    );

    // Combine all results into one array
    const results = [...residents, ...documents, ...blotters];
    res.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Error performing search' });
  }
});

// 404 handler - Log all unmatched routes for debugging
// IMPORTANT: This must be AFTER all route registrations
app.use((req, res) => {
  console.log(`\n❌ ===== 404 - Route not found =====`);
  console.log(`   Method: ${req.method}`);
  console.log(`   Path: ${req.path}`);
  console.log(`   Original URL: ${req.originalUrl}`);
  console.log(`   Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log(`   Headers:`, {
    authorization: req.headers.authorization ? 'Bearer ***' : 'none',
    'content-type': req.headers['content-type']
  });
  if (req.path === '/api/auth/users' || req.path.includes('/users')) {
    console.log(`   ⚠️  This is a /users route - checking why it's not matching...`);
  }
  console.log(`=====================================\n`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method,
    originalUrl: req.originalUrl,
    message: `The route ${req.method} ${req.path} was not found on the server.`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Server will start but API may not work.');
  }

  app.listen(PORT, () => {
    console.log('\n🚀 Server started successfully!');
    console.log(`   API URL: http://127.0.0.1:${PORT}/api`);
    console.log(`   Health Check: http://127.0.0.1:${PORT}/health\n`);
  });
}

startServer();
