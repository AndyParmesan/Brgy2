// Script to add profile fields to users table
require('dotenv').config();
const { query, pool } = require('../config/database');

async function addProfileFields() {
  try {
    console.log('Adding profile fields to users table...');
    
    // Check existing columns
    const columns = await query('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);
    
    // Add avatar_url column
    if (!columnNames.includes('avatar_url')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN avatar_url VARCHAR(500) NULL AFTER role
      `);
      console.log('✅ Added avatar_url column');
    } else {
      console.log('⏭️  avatar_url column already exists');
    }
    
    // Add phone column
    if (!columnNames.includes('phone')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN phone VARCHAR(20) NULL AFTER email
      `);
      console.log('✅ Added phone column');
    } else {
      console.log('⏭️  phone column already exists');
    }
    
    // Add address column
    if (!columnNames.includes('address')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN address TEXT NULL
      `);
      console.log('✅ Added address column');
    } else {
      console.log('⏭️  address column already exists');
    }
    
    // Add bio column
    if (!columnNames.includes('bio')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN bio TEXT NULL
      `);
      console.log('✅ Added bio column');
    } else {
      console.log('⏭️  bio column already exists');
    }
    
    console.log('✅ Profile fields added successfully!');
    
    // Check table structure
    const structure = await query('DESCRIBE users');
    console.log('\nUpdated table structure:');
    console.table(structure);
    
  } catch (error) {
    console.error('❌ Error adding profile fields:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

addProfileFields();

