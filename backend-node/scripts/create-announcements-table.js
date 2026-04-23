// Script to create the announcements table if it doesn't exist
require('dotenv').config();
const { query, pool } = require('../config/database');

async function createAnnouncementsTable() {
  try {
    console.log('Creating announcements table...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference_no VARCHAR(50) UNIQUE,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        body TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'announcements',
        status VARCHAR(50) DEFAULT 'Draft',
        priority VARCHAR(50) DEFAULT 'Normal',
        target_audience VARCHAR(255),
        published_on DATE,
        expires_on DATE,
        link VARCHAR(500),
        items JSON,
        highlights JSON,
        schedule JSON,
        info TEXT,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_published (published_on),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Announcements table created successfully!');
    
    // Check if table exists and show structure
    const structure = await query('DESCRIBE announcements');
    console.log('\nTable structure:');
    console.table(structure);
    
  } catch (error) {
    console.error('❌ Error creating announcements table:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAnnouncementsTable();

