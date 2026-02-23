// Script to create an admin account in the database
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/database');

async function createAdmin() {
  try {
    const email = process.argv[2] || 'admin@brgy853.ph';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'System Administrator';
    const role = process.argv[5] || 'admin';

    console.log('Creating admin account...');
    console.log(`Email: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Role: ${role}`);

    // Check if user already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  User with this email already exists!');
      console.log('Updating password...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'UPDATE users SET password = ?, role = ?, name = ?, updated_at = NOW() WHERE LOWER(email) = LOWER(?)',
        [hashedPassword, role, name, email]
      );
      
      console.log('✅ Admin account updated successfully!');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert admin user
      await query(
        `INSERT INTO users (name, email, password, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [name, email, hashedPassword, role]
      );

      console.log('✅ Admin account created successfully!');
    }

    console.log('\nLogin credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\n⚠️  Please change the password after first login!`);

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAdmin();

