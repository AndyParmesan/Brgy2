// Script to check user in database and verify password
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function checkUser() {
  try {
    const email = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin';

    console.log('\n🔍 Checking user in database...\n');
    console.log('Searching for email/username:', email);

    // Try to find user by email (case-insensitive)
    const users = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(name) = LOWER(?)',
      [email, email]
    );

    if (users.length === 0) {
      console.log('❌ No user found with email/name:', email);
      console.log('\nAvailable users in database:');
      const allUsers = await query('SELECT id, name, email, role FROM users LIMIT 10');
      if (allUsers.length === 0) {
        console.log('   No users found in database');
      } else {
        allUsers.forEach(user => {
          console.log(`   - ${user.email || user.name} (${user.role || 'no role'})`);
        });
      }
      return;
    }

    const user = users[0];
    console.log('✅ User found!');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role || 'not set');
    console.log('   Password hash:', user.password ? user.password.substring(0, 20) + '...' : 'NULL');

    // Check if password is hashed (bcrypt hashes start with $2a$ or $2b$)
    const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
    console.log('   Password is hashed:', isHashed ? '✅ Yes' : '❌ No');

    if (!isHashed) {
      console.log('\n⚠️  WARNING: Password is not hashed!');
      console.log('   You need to hash the password using bcrypt.');
      console.log('\n   To fix this, run:');
      console.log(`   node scripts/hash-password.js "${password}"`);
      console.log('   Then update the database with the hashed password.');
    } else {
      // Test password
      console.log('\n🔐 Testing password...');
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        console.log('✅ Password is CORRECT!');
        console.log('\n   You should be able to login with:');
        console.log(`   Email: ${user.email || email}`);
        console.log(`   Password: ${password}`);
      } else {
        console.log('❌ Password is INCORRECT!');
        console.log('   The password you provided does not match the hash in database.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Cannot connect to database. Check your .env file and MySQL server.');
    }
  }
}

checkUser().then(() => process.exit(0));

