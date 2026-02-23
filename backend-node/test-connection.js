// Test MySQL database connection
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('\n🔍 Testing MySQL Database Connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || '127.0.0.1'}`);
  console.log(`  Port: ${process.env.DB_PORT || 3306}`);
  console.log(`  User: ${process.env.DB_USER || 'root'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'brgy_data'}\n`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'brgy_data'
    });

    console.log('✅ SUCCESS: Database connection established!');
    
    // Test query
    const [rows] = await connection.execute('SELECT DATABASE() as db, USER() as user');
    console.log(`   Connected to database: ${rows[0].db}`);
    console.log(`   Connected as user: ${rows[0].user}`);
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n   Tables found: ${tables.length}`);
    if (tables.length > 0) {
      console.log('   Table names:');
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`     - ${tableName}`);
      });
    } else {
      console.log('   ⚠️  No tables found. You may need to run migrations.');
    }
    
    await connection.end();
    console.log('\n✅ Connection test completed successfully!\n');
    return true;
  } catch (error) {
    console.error('\n❌ FAILED: Database connection error\n');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Solution:');
      console.log('   1. Check if MySQL password is required');
      console.log('   2. Update DB_PASSWORD in .env file');
      console.log('   3. Or create a MySQL user without password\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Solution:');
      console.log('   1. Create the database:');
      console.log('      CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution:');
      console.log('   1. Make sure MySQL server is running');
      console.log('   2. Check if MySQL is on the correct host/port\n');
    }
    
    return false;
  }
}

testConnection();

