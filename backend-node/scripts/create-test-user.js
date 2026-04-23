// Script to create a test user in the database
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function createTestUser() {
  try {
    const name = 'Test Admin';
    const email = 'admin@brgy853.ph';
    const password = 'admin123';
    const role = 'admin';

    // Check if user already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('User already exists with email:', email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, email, hashedPassword, role]
    );

    console.log('✅ Test user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', role);
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

createTestUser().then(() => process.exit(0));

