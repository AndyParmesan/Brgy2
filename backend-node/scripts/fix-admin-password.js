// Script to fix admin password - hash it and update database
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function fixAdminPassword() {
  try {
    const email = process.argv[2] || 'admin';
    const newPassword = process.argv[3] || 'admin';

    console.log('\n🔧 Fixing admin password...\n');

    // Find user
    const users = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)',
      [email, email]
    );

    if (users.length === 0) {
      console.log('❌ User not found:', email);
      console.log('\nCreating new admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Create user
      await query(
        `INSERT INTO users (name, email, password, role, created_at, updated_at)
         VALUES (?, ?, ?, 'admin', NOW(), NOW())`,
        ['Admin', email.includes('@') ? email : `${email}@brgy853.ph`, hashedPassword]
      );
      
      console.log('✅ Admin user created!');
      console.log('   Email:', email.includes('@') ? email : `${email}@brgy853.ph`);
      console.log('   Password:', newPassword);
      return;
    }

    const user = users[0];
    console.log('✅ User found:', user.email || user.name);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, user.id]
    );

    console.log('✅ Password updated successfully!');
    console.log('   User:', user.email || user.name);
    console.log('   New password:', newPassword);
    console.log('\n   You can now login with:');
    console.log(`   Email: ${user.email || email}`);
    console.log(`   Password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Cannot connect to database. Check your .env file and MySQL server.');
    }
  }
}

fixAdminPassword().then(() => process.exit(0));

