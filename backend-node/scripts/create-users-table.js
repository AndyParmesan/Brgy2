// Script to create the users table if it doesn't exist
require('dotenv').config();
const { query, pool } = require('../config/database');

async function createUsersTable() {
  try {
    console.log('Creating users table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'resident',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Users table created successfully!');
    
    // Check if table exists and show structure
    const structure = await query('DESCRIBE users');
    console.log('\nTable structure:');
    console.table(structure);
    
  } catch (error) {
    console.error('❌ Error creating users table:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createUsersTable();

