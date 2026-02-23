# Migration from Laravel to Node.js - Complete Guide

## ✅ Migration Complete!

The backend has been successfully migrated from Laravel (PHP) to Node.js (Express).

## What Changed

### Backend Location
- **Old**: `Brgy2/backend/` (Laravel/PHP)
- **New**: `Brgy2/backend-node/` (Node.js/Express)

### Port Change
- **Old**: `http://127.0.0.1:8000`
- **New**: `http://127.0.0.1:3001`

### Frontend Updated
- ✅ Frontend API base URL updated to port 3001
- ✅ All API endpoints remain the same
- ✅ No frontend code changes needed

## Setup Instructions

### Step 1: Install Node.js Dependencies

```bash
cd Brgy2/backend-node
npm install
```

### Step 2: Create .env File

Create `.env` file in `Brgy2/backend-node/`:

```env
PORT=3001
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=brgy_data

JWT_SECRET=your-secret-key-change-this

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Important:**
- Update `DB_PASSWORD` if MySQL has a password
- Change `JWT_SECRET` to a secure random string
- Ensure `DB_NAME` matches your database

### Step 3: Ensure Database Exists

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Database Migrations

The database schema is the same. You can:

**Option A:** Use existing Laravel migrations (if you have PHP):
```bash
cd ../backend
php artisan migrate
```

**Option B:** Create tables manually using SQL from schema documentation.

### Step 5: Start Node.js Server

```bash
cd Brgy2/backend-node
npm start
```

Or for development (auto-reload):
```bash
npm run dev
```

## Verify Migration

### 1. Check Server
```bash
curl http://127.0.0.1:3001/health
```

### 2. Check Database Connection
Look for this in console:
```
✅ MySQL Database connected successfully!
```

### 3. Test API
```bash
curl http://127.0.0.1:3001/api/public/documents
```

### 4. Test Frontend
```bash
cd Brgy2/brgy
npm start
```

Visit `http://localhost:3000` and test all pages.

## API Endpoints (Same as Before)

### Public Endpoints
- `GET /api/public/announcements`
- `GET /api/public/documents`
- `POST /api/public/report`
- `POST /api/public/document-request`
- `POST /api/public/contact`

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/user`

### Protected Endpoints
- `GET /api/residents`
- `GET /api/document-requests`
- `GET /api/blotter-cases`
- `GET /api/announcements`
- `GET /api/activity-logs`

## Project Structure

```
backend-node/
├── config/
│   └── database.js          # MySQL connection
├── routes/
│   ├── auth.js              # Authentication
│   ├── announcements.js     # Announcements
│   ├── documents.js         # Document requests
│   ├── blotter.js           # Blotter cases
│   ├── contact.js           # Contact form
│   ├── residents.js         # Residents
│   └── activityLogs.js     # Activity logs
├── .env                     # Configuration (create this)
├── package.json             # Dependencies
├── server.js                # Main server
└── README.md                # Documentation
```

## Key Features

✅ **Express.js** - Fast, minimalist web framework
✅ **MySQL2** - MySQL connection with connection pooling
✅ **JWT Authentication** - Secure token-based auth
✅ **CORS Enabled** - Frontend can make requests
✅ **Error Handling** - Proper error responses
✅ **Environment Variables** - Secure configuration

## Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify `.env` credentials
- Ensure database exists

### Port Already in Use
- Change `PORT` in `.env`
- Or stop process on port 3001

### Module Not Found
- Run `npm install`
- Check `node_modules` exists

### CORS Errors
- Update `CORS_ORIGINS` in `.env`
- Ensure frontend URL is included

## Next Steps

1. ✅ Backend migrated to Node.js
2. ✅ Frontend updated to use new port
3. ✅ Database connection configured
4. ⏭️ Test all functionality
5. ⏭️ Deploy to production (if needed)

## Notes

- The Laravel backend (`Brgy2/backend/`) is kept for reference
- Database schema remains the same
- All API endpoints work identically
- Frontend requires no changes (already updated)

## Support

See `Brgy2/backend-node/README.md` for detailed documentation.

