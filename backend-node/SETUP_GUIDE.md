# Node.js Backend Setup Guide

## Quick Start

### Step 1: Install Dependencies

```bash
cd Brgy2/backend-node
npm install
```

### Step 2: Create .env File

Create a `.env` file in `Brgy2/backend-node/` with this content:

```env
PORT=3001
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=brgy_data

JWT_SECRET=change-this-to-a-random-secret-key-in-production

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Important:**
- If MySQL has a password, set `DB_PASSWORD=your_password`
- Change `JWT_SECRET` to a secure random string
- Ensure `DB_NAME` matches your database name

### Step 3: Create MySQL Database

Open MySQL (command line or phpMyAdmin) and run:

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Database Migrations

You need to create the database tables. You can:

**Option A: Use Laravel migrations** (if you have PHP/Laravel):
```bash
cd ../backend
php artisan migrate
```

**Option B: Create tables manually** using SQL from the schema documentation.

### Step 5: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://127.0.0.1:3001`

## Verify Setup

### 1. Check Server is Running
```bash
curl http://127.0.0.1:3001/health
```

Should return: `{"status":"ok","message":"Server is running"}`

### 2. Check Database Connection
Look at the console output when starting the server. You should see:
```
✅ MySQL Database connected successfully!
   Database: brgy_data
   Host: 127.0.0.1:3306
```

### 3. Test API Endpoint
```bash
curl /api/public/documents
```

Should return JSON with document types.

## Troubleshooting

### "Cannot find module"
- Run `npm install` again
- Check you're in the `backend-node` directory

### "Database connection failed"
- Check MySQL is running
- Verify `.env` file has correct credentials
- Ensure database `brgy_data` exists
- Test MySQL connection: `mysql -u root -p`

### "Port 3001 already in use"
- Change `PORT` in `.env` to another port (e.g., 3002)
- Or stop the process using port 3001

### "Table doesn't exist"
- Run database migrations
- Check tables exist: `SHOW TABLES;` in MySQL

## Next Steps

1. Start the frontend: `cd ../brgy && npm start`
2. Test the connection between frontend and backend
3. All API calls should now go to `/api`

## API Endpoints

All endpoints are the same as before, just on port 3001 instead of 8000:

- `GET /api/public/announcements`
- `GET /api/public/documents`
- `POST /api/public/report`
- `POST /api/public/document-request`
- `POST /api/public/contact`
- `POST /api/auth/login`
- And more...

See `README.md` for complete API documentation.

