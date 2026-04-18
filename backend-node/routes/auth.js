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

    // NEW: Check if user account is active
    if (user.status === 'inactive') {
      return res.status(403).json({ 
        error: 'Account inactive',
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
    const isPasswordHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    
    let isValidPassword = false;
    
    if (isPasswordHashed) {
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      isValidPassword = user.password === password;
      
      if (isValidPassword) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          await query(
            'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
            [hashedPassword, user.id]
          );
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: 'An unexpected error occurred.' });
  }
});

// Get current user (protected)
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, phone, address, bio, avatar_url, role FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.get('/test-users-route', (req, res) => {
  res.json({ message: 'Test route works!', path: '/api/auth/test-users-route' });
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Upgraded Security Guard: Checks token AND database status
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, decodedUser) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    
    try {
      // NEW: Intercept the request and double-check the database
      const users = await query('SELECT status FROM users WHERE id = ?', [decodedUser.id]);
      
      // If the user was deleted or marked as inactive, immediately destroy their access
      if (users.length === 0 || users[0].status === 'inactive') {
        return res.status(403).json({ 
          error: 'Account Deactivated', 
          message: 'Your session has been terminated because this account was deactivated.' 
        });
      }

      // If they are active, let them proceed normally
      req.user = decodedUser;
      next();
    } catch (dbError) {
      console.error('Auth verification error:', dbError);
      return res.status(500).json({ error: 'Authentication database error' });
    }
  });
}

// Public: Register new resident account
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password, contact_number, address, date_of_birth } = req.body;

    if (!first_name || !last_name || !email || !password || !contact_number || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUsers = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existingUsers.length > 0) return res.status(409).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, 'resident', 'active', NOW(), NOW())`,
      [`${first_name} ${last_name}`, email, hashedPassword]
    );

    try {
      await query(
        `INSERT INTO residents (full_name, contact_mobile, contact_email, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
        [`${first_name} ${last_name}`, contact_number, email]
      );
    } catch (residentError) {
      console.log('Note: Could not create resident record:', residentError.message);
    }

    res.status(201).json({
      message: 'Account created successfully! You can now login.',
      success: true,
      user: { id: result.insertId, name: `${first_name} ${last_name}`, email: email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Protected: Create new user (admin only)
router.post('/create-user', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

    const existingUsers = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    if (existingUsers.length > 0) return res.status(409).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', NOW(), NOW())`,
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ success: true, user: { id: result.insertId, name, email, role } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// RESTORED: Profile Routes
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, phone, address, bio, avatar_url, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json({ user: users[0] });
  } catch (error) { res.status(500).json({ error: 'Failed to get profile' }); }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address, bio } = req.body;
    const userId = req.user.id;

    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(userId);

    await query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

    const users = await query('SELECT id, name, email, phone, address, bio, avatar_url, role FROM users WHERE id = ?', [userId]);
    
    res.json({ user: users[0], message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.put('/profile/avatar', authenticateToken, async (req, res) => {
  try {
    const { avatar_url } = req.body;
    const userId = req.user.id;

    if (!avatar_url) return res.status(400).json({ error: 'Avatar URL is required' });

    await query('UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?', [avatar_url, userId]);

    const users = await query('SELECT id, name, email, phone, address, bio, avatar_url, role FROM users WHERE id = ?', [userId]);

    res.json({ user: users[0], message: 'Avatar updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Protected: Get all users (admin only)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { search, role } = req.query;
    
    let sql = 'SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE 1=1';
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

    const users = await query(sql, params);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// NEW ROUTE: Toggle User Status (Deactivate / Activate)
router.put('/users/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Only administrators can change account status.' });
    }

    const userId = parseInt(req.params.id);
    const { status } = req.body;

    if (userId === req.user.id && status === 'inactive') {
      return res.status(400).json({ error: 'Action denied', message: 'You cannot deactivate your own account.' });
    }

    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    await query('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', [status, userId]);

    await logActivity({
      actorName: req.user.name || req.user.email,
      action: status === 'active' ? 'Activated' : 'Deactivated',
      module: 'User',
      referenceId: `USER-${userId}`,
      details: `Account ${status}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      actorEmail: req.user.email,
      actorRole: req.user.role
    });

    res.json({ success: true, message: `Account ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Protected: Delete user (admin only)
router.delete('/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const userId = parseInt(req.params.id);
    if (userId === req.user.id) return res.status(400).json({ error: 'Cannot delete own account' });

    await query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User account deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;