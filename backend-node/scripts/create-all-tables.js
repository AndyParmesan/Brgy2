// Script to create all required database tables
require('dotenv').config();
const { query, pool } = require('../config/database');

async function createAllTables() {
  try {
    console.log('Creating all required tables...\n');

    // Create residents table
    console.log('Creating residents table...');
    await query(`
      CREATE TABLE IF NOT EXISTS residents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        contact_mobile VARCHAR(20),
        contact_email VARCHAR(255),
        address TEXT,
        zone VARCHAR(50),
        date_of_birth DATE,
        gender VARCHAR(20),
        occupation VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (full_name),
        INDEX idx_zone (zone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Residents table created');

    // Create document_requests table
    console.log('Creating document_requests table...');
    await query(`
      CREATE TABLE IF NOT EXISTS document_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reference_no VARCHAR(50) UNIQUE,
        requester_name VARCHAR(255) NOT NULL,
        document_type VARCHAR(255) NOT NULL,
        purpose TEXT,
        contact_number VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        date_filed DATE,
        notes TEXT,
        additional_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_reference (reference_no),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Document requests table created');

    // Create blotter_cases table
    console.log('Creating blotter_cases table...');
    await query(`
      CREATE TABLE IF NOT EXISTS blotter_cases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_no VARCHAR(50) UNIQUE,
        case_title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        location VARCHAR(255),
        date_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        incident_date DATE,
        incident_time TIME,
        status VARCHAR(50) DEFAULT 'Pending',
        priority VARCHAR(50) DEFAULT 'Normal',
        summary TEXT,
        description TEXT NOT NULL,
        reporter_name VARCHAR(255) NOT NULL,
        reporter_contact VARCHAR(20) NOT NULL,
        reporter_email VARCHAR(255),
        reporter_address TEXT NOT NULL,
        persons_involved TEXT,
        witnesses TEXT,
        investigator_name VARCHAR(255),
        notes TEXT,
        next_hearing_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_case_no (case_no),
        INDEX idx_reporter_email (reporter_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Blotter cases table created');

    // Create activity_logs table
    console.log('Creating activity_logs table...');
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actor_name VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        module VARCHAR(100) NOT NULL,
        reference_id VARCHAR(100),
        details TEXT,
        logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_module (module),
        INDEX idx_reference (reference_id),
        INDEX idx_logged_at (logged_at),
        INDEX idx_actor (actor_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Activity logs table created');

    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

createAllTables();

