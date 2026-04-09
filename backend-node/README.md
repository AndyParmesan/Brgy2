# Barangay Management System - Node.js Backend

Express.js backend API with MySQL database connection.

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd Brgy2/backend-node
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env`:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` file with your MySQL credentials:

```env
PORT=3001
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=brgy_data

JWT_SECRET=your-secret-key-change-this-in-production

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Important:**
- Update `DB_PASSWORD` if your MySQL has a password
- Change `JWT_SECRET` to a random secure string
- Ensure `DB_NAME` matches your database name

### Step 3: Create MySQL Database

Open MySQL and run:

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Database Migrations

You need to run the Laravel migrations first (or create tables manually). The database schema is in `../backend/database/migrations/`.

Alternatively, you can use the SQL schema from `../backend/database/DATABASE_SCHEMA.md`.

### Step 5: Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://127.0.0.1:3001`

## API Endpoints

### Public Endpoints (No Authentication)

- `GET /api/public/announcements` - Get published announcements
- `GET /api/public/documents` - Get document types
- `POST /api/public/report` - Submit incident report
- `POST /api/public/document-request` - Submit document request
- `POST /api/public/contact` - Submit contact form

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/user` - Get current user (requires auth)

### Protected Endpoints (Require Authentication)

- `GET /api/residents` - Get residents list
- `GET /api/document-requests` - Get document requests
- `GET /api/blotter-cases` - Get blotter cases
- `GET /api/announcements` - Get all announcements
- `GET /api/activity-logs` - Get activity logs

## Testing

### Health Check
```bash
curl http://127.0.0.1:3001/health
```

### Test Database Connection
The server will automatically test the database connection on startup. Check the console output.

### Test API Endpoint
```bash
curl /api/public/documents
```

## Project Structure

```
backend-node/
├── config/
│   └── database.js          # MySQL connection configuration
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── announcements.js     # Announcement routes
│   ├── documents.js         # Document request routes
│   ├── blotter.js           # Blotter case routes
│   ├── contact.js           # Contact form routes
│   ├── residents.js         # Resident routes
│   └── activityLogs.js      # Activity log routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md               # This file
```

## Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `brgy_data` exists
- Check MySQL user has proper permissions

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 3001

### Module Not Found
- Run `npm install` again
- Check `node_modules` folder exists

### CORS Errors
- Update `CORS_ORIGINS` in `.env` with your frontend URL
- Ensure frontend is making requests to correct port (3001)

## Development

### Using Nodemon (Auto-reload)
```bash
npm run dev
```

### Manual Restart
```bash
npm start
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name brgy-api
   ```

## Notes

- The backend uses JWT for authentication
- All passwords are hashed using bcrypt
- Database queries use prepared statements to prevent SQL injection
- CORS is configured to allow requests from the React frontend
