// Interactive database configuration helper
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function configure() {
  console.log('\n🔧 MySQL Database Configuration\n');
  console.log('This will help you configure the database connection.\n');

  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  // Read existing .env if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Get configuration values
  const dbHost = await question('MySQL Host [127.0.0.1]: ') || '127.0.0.1';
  const dbPort = await question('MySQL Port [3306]: ') || '3306';
  const dbUser = await question('MySQL Username [root]: ') || 'root';
  const dbPassword = await question('MySQL Password (press Enter if none): ');
  const dbName = await question('Database Name [brgy_data]: ') || 'brgy_data';
  const port = await question('Server Port [3001]: ') || '3001';
  const jwtSecret = await question('JWT Secret (press Enter to generate random): ') || 
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Build .env content
  const newEnvContent = `PORT=${port}
NODE_ENV=development

DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

JWT_SECRET=${jwtSecret}

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
`;

  // Write .env file
  fs.writeFileSync(envPath, newEnvContent);
  console.log('\n✅ Configuration saved to .env file!\n');

  // Test connection
  console.log('Testing database connection...\n');
  const mysql = require('mysql2/promise');
  require('dotenv').config();

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: parseInt(dbPort),
      user: dbUser,
      password: dbPassword,
      database: dbName
    });

    console.log('✅ Database connection successful!');
    await connection.end();
    
    console.log('\n🎉 Configuration complete!');
    console.log('You can now start the server with: npm start\n');
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. MySQL server is running');
    console.log('2. Database exists (create it if needed)');
    console.log('3. User credentials are correct');
    console.log('\nTo create the database, run in MySQL:');
    console.log(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`);
  }

  rl.close();
}

configure();

