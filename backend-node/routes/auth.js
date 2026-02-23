const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email or name (case-insensitive)
    // Try email first, then name if email doesn't match
    let users = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    
    // If no user found by email, try by name
    if (users.length === 0) {
      users = await query(
        'SELECT * FROM users WHERE LOWER(name) = LOWER(?)',
        [email]
      );
    }

    // Check if account exists
    if (users.length === 0) {
      return res.status(401).json({ 
        error: 'Account not found',
        message: 'No account found with this email address. Please check your email or contact the administrator.'
      });
    }

    const user = users[0];

    // Check if user account is active (if you have an active/status field)
    // if (user.status !== 'active') {
    //   return res.status(403).json({ 
    //     error: 'Account inactive',
    //     message: 'Your account has been deactivated. Please contact the administrator.'
    //   });
    // }

    // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
    const isPasswordHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    
    let isValidPassword = false;
    
    if (isPasswordHashed) {
      // Compare with bcrypt
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // If password is not hashed, compare directly (for migration/setup purposes)
      isValidPassword = user.password === password;
      
      if (isValidPassword) {
        // Auto-hash the password for future logins
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          await query(
            'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
            [hashedPassword, user.id]
          );
          console.log(`✅ Password auto-hashed for user: ${user.email || user.name}`);
        } catch (hashError) {
          console.error('Warning: Could not auto-hash password:', hashError.message);
        }
      }
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid password',
        message: 'The password you entered is incorrect. Please try again.'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Log successful login
    console.log(`✅ User logged in: ${user.email} (${user.role})`);

    // Log activity
    await logActivity({
      actorName: user.name || user.email,
      action: 'Logged in',
      module: 'System',
      referenceId: `USER-${user.id}`,
      details: `Role: ${user.role}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: user.email,
      actorRole: user.role
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    
    // Database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please try again later.'
      });
    }
    
    // Other database errors
    if (error.code && error.code.startsWith('ER_')) {
      return res.status(500).json({ 
        error: 'Database error',
        message: 'An error occurred while accessing the database.'
      });
    }
    
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// Get current user (protected)
// NOTE: This route must come BEFORE /users to avoid route conflicts
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, name, email, phone, address, bio, avatar_url, role FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Test route to verify routing works
router.get('/test-users-route', (req, res) => {
  console.log('✅ Test route /api/auth/test-users-route hit!');
  res.json({ message: 'Test route works!', path: '/api/auth/test-users-route' });
});

// Logout (just return success, client removes token)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Public: Register new resident account
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, contact_number, address, date_of_birth } = req.body;

    // Validation
    if (!first_name || !last_name || !email || !password || !contact_number || !address) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please fill in all required fields.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please enter a valid email address.'
      });
    }

    // Check if email already exists in users table
    const existingUsers = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'An account with this email already exists. Please use a different email or try logging in.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account for resident
    const result = await query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, 'resident', NOW(), NOW())`,
      [`${first_name} ${last_name}`, email, hashedPassword]
    );

    // Also create resident record if residents table exists
    try {
      // Check if residents table has first_name/last_name or full_name
      await query(
        `INSERT INTO residents (full_name, contact_mobile, contact_email, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [`${first_name} ${last_name}`, contact_number, email]
      );
    } catch (residentError) {
      // If residents table doesn't exist or error, just log it (not critical)
      console.log('Note: Could not create resident record:', residentError.message);
    }

    console.log(`✅ New resident registered: ${email}`);

    res.status(201).json({
      message: 'Account created successfully! You can now login.',
      success: true,
      user: {
        id: result.insertId,
        name: `${first_name} ${last_name}`,
        email: email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('SQL State:', error.sqlState);
    
    // Database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please try again later.'
      });
    }
    
    // Table doesn't exist
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        error: 'Database setup incomplete',
        message: 'The users table does not exist. Please contact the administrator.'
      });
    }
    
    // Duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'An account with this email already exists. Please use a different email or try logging in.'
      });
    }
    
    // Other database errors
    if (error.code && error.code.startsWith('ER_')) {
      return res.status(500).json({ 
        error: 'Database error',
        message: `Database error: ${error.message}. Please contact the administrator.`
      });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message || 'An error occurred while creating your account. Please try again later.'
    });
  }
});

// Protected: Create new user (admin only)
router.post('/create-user', authenticateToken, async (req, res) => {
  console.log(`\n📋 ===== POST /api/auth/create-user =====`);
  console.log(`   Route hit! Request from user: ${req.user?.email} (${req.user?.role})`);
  console.log(`   User ID: ${req.user?.id}`);
  console.log(`   Request body:`, { name: req.body.name, email: req.body.email, role: req.body.role });
  
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log(`❌ Access denied: User ${req.user.email} is not an admin`);
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can create user accounts.'
      });
    }

    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, email, password, and role are required.'
      });
    }

    // Validate role
    const validRoles = ['admin', 'staff', 'resident'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        message: `Role must be one of: ${validRoles.join(', ')}`
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please enter a valid email address.'
      });
    }

    // Check if email already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'An account with this email already exists.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account
    const result = await query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, email, hashedPassword, role]
    );

    console.log(`✅ New ${role} account created by admin ${req.user.email}: ${email}`);
    console.log(`   New user ID: ${result.insertId}`);
    console.log(`=====================================\n`);

    // Log activity
    await logActivity({
      actorName: req.user.name || req.user.email,
      action: 'Created',
      module: 'User',
      referenceId: `USER-${result.insertId}`,
      details: `${name} (${role})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.status(201).json({
      message: 'User account created successfully',
      success: true,
      user: {
        id: result.insertId,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error(`\n❌ ===== Create user error =====`);
    console.error('   Error:', error);
    console.error('   Error code:', error.code);
    console.error('   Error message:', error.message);
    console.error(`=====================================\n`);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'Email already exists',
        message: 'An account with this email already exists.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create user',
      message: 'An error occurred while creating the user account. Please try again later.'
    });
  }
});

// Profile routes - MUST come BEFORE /users to avoid route conflicts
// Get user profile (protected)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await query(
      'SELECT id, name, email, phone, address, bio, avatar_url, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile (protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, bio } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    // Fetch updated user
    const users = await query(
      'SELECT id, name, email, phone, address, bio, avatar_url, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await logActivity({
      actorName: users[0].name || users[0].email,
      action: 'Updated',
      module: 'User',
      referenceId: `USER-${userId}`,
      details: 'Profile updated',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: users[0].email,
      actorRole: users[0].role
    });

    res.json({ user: users[0], message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update avatar URL (protected)
router.put('/profile/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatar_url } = req.body;
    const userId = req.user.id;

    if (!avatar_url) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }

    await query(
      'UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?',
      [avatar_url, userId]
    );

    // Fetch updated user
    const users = await query(
      'SELECT id, name, email, phone, address, bio, avatar_url, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await logActivity({
      actorName: users[0].name || users[0].email,
      action: 'Updated',
      module: 'User',
      referenceId: `USER-${userId}`,
      details: 'Avatar updated',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      actorEmail: users[0].email,
      actorRole: users[0].role
    });

    res.json({ user: users[0], message: 'Avatar updated successfully' });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Protected: Get all users (admin only)
// IMPORTANT: This route must be defined AFTER /user (singular) and /profile to avoid conflicts
router.get('/users', authenticateToken, async (req, res) => {
  console.log(`\n📋 ===== GET /api/auth/users =====`);
  console.log(`   Route hit! Request from user: ${req.user?.email} (${req.user?.role})`);
  console.log(`   User ID: ${req.user?.id}`);
  
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log(`❌ Access denied: User ${req.user.email} is not an admin`);
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can view user accounts.'
      });
    }

    const { search, role } = req.query;
    console.log(`🔍 Query params: search=${search}, role=${role}`);
    
    let sql = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      sql += ' AND role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC';

    console.log(`📊 Executing SQL: ${sql}`);
    console.log(`📊 Params:`, params);

    const users = await query(sql, params);
    
    console.log(`✅ Users fetched by admin ${req.user.email}: ${users.length} users found`);
    console.log(`📋 Users:`, users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
    
    res.json(users);
  } catch (error) {
    console.error('❌ Get users error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      sqlState: error.sqlState,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: error.message || 'An error occurred while fetching users.'
    });
  }
});

// Protected: Delete user (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only administrators can delete user accounts.'
      });
    }

    const userId = parseInt(req.params.id);

    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({ 
        error: 'Cannot delete own account',
        message: 'You cannot delete your own account.'
      });
    }

    // Check if user exists
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'The user account does not exist.'
      });
    }

    // Delete user
    await query('DELETE FROM users WHERE id = ?', [userId]);

    console.log(`✅ User ${userId} deleted by admin ${req.user.email}`);

    res.json({
      message: 'User account deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      message: 'An error occurred while deleting the user account.'
    });
  }
});

// Export router and middleware
module.exports = router;
module.exports.authenticateToken = authenticateToken;
