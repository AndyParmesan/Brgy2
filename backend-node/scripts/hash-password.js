// Script to hash a password using bcrypt
const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hash-password.js <password>');
  console.log('Example: node scripts/hash-password.js admin');
  process.exit(1);
}

async function hashPassword() {
  try {
    const hash = await bcrypt.hash(password, 10);
    console.log('\n✅ Password hashed successfully!\n');
    console.log('Original password:', password);
    console.log('Hashed password:', hash);
    console.log('\n📋 SQL to update user:');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin' OR name = 'admin';`);
    console.log('\nOr if you know the email:');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'your@email.com';`);
  } catch (error) {
    console.error('Error hashing password:', error.message);
  }
}

hashPassword();

