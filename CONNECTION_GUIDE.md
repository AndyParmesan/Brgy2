# Frontend to MySQL Database Connection Guide

## ✅ Connection Status

The frontend is now fully connected to your MySQL database through the Laravel backend API.

## 🔌 Connection Details

- **Database Name**: `brgy_data`
- **Host**: `127.0.0.1`
- **Port**: `3306`
- **Username**: `root`
- **Password**: (empty by default, update in `.env` if needed)
- **API Base URL**: `http://127.0.0.1:8000/api`

## 📋 Setup Steps

### 1. Create MySQL Database

Open MySQL command line or phpMyAdmin:

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Backend Environment

```bash
cd Brgy2/backend

# Copy environment file
copy .env.example .env

# Edit .env file and set:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=brgy_data
# DB_USERNAME=root
# DB_PASSWORD=
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Database Migrations

```bash
php artisan migrate
```

This will create all tables including:
- `users`
- `residents`
- `households`
- `document_requests`
- `blotter_cases`
- `announcements`
- `activity_logs`

### 5. Start Backend Server

```bash
php artisan serve
```

Server will run on `http://127.0.0.1:8000`

### 6. Start Frontend

```bash
cd Brgy2/brgy
npm start
```

Frontend will run on `http://localhost:3000`

## 🔗 API Endpoints Connected

### Public Endpoints (No Authentication)

| Endpoint | Method | Description | Frontend Page |
|----------|--------|-------------|---------------|
| `/api/public/announcements` | GET | Get published announcements | Announcements Page |
| `/api/public/documents` | GET | Get document types | Documents Page |
| `/api/public/report` | POST | Submit incident report | Report Page |
| `/api/public/document-request` | POST | Submit document request | Documents Page |
| `/api/public/contact` | POST | Submit contact form | About Page |

### Protected Endpoints (Authentication Required)

| Endpoint | Method | Description | Frontend Page |
|----------|--------|-------------|---------------|
| `/api/login` | POST | User login | Login Modal |
| `/api/logout` | POST | User logout | Dashboard |
| `/api/user` | GET | Get current user | Dashboard |
| `/api/residents` | GET | Get residents list | Dashboard |
| `/api/document-requests` | GET | Get document requests | Dashboard |
| `/api/blotter-cases` | GET | Get blotter cases | Dashboard |
| `/api/announcements` | GET | Get all announcements | Dashboard |
| `/api/activity-logs` | GET | Get activity logs | Dashboard |

## 📊 Data Flow

### Announcements Page
1. Frontend calls `api.getPublicAnnouncements()`
2. Backend queries MySQL: `SELECT * FROM announcements WHERE status='Published'`
3. Data is returned to frontend
4. Frontend displays announcements

### Report Page
1. User fills out incident report form
2. Frontend calls `api.submitReport(data)`
3. Backend validates and saves to MySQL: `INSERT INTO blotter_cases`
4. Backend returns reference number
5. Frontend shows confirmation with reference number

### Documents Page
1. Frontend calls `api.getPublicDocuments()`
2. Backend returns document types and requirements
3. Frontend displays available documents
4. User can submit document requests via `api.submitDocumentRequest()`

### About Page
1. User fills out contact form
2. Frontend calls `api.submitContact(data)`
3. Backend saves to MySQL: `INSERT INTO activity_logs`
4. Frontend shows success message

## 🧪 Testing the Connection

### Test 1: Check API Connection
Open browser console and run:
```javascript
fetch('http://127.0.0.1:8000/api/public/documents')
  .then(res => res.json())
  .then(data => console.log('Connected!', data))
  .catch(err => console.error('Not connected:', err));
```

### Test 2: Submit a Report
1. Go to `/report` page
2. Fill out the form
3. Submit
4. Check MySQL database: `SELECT * FROM blotter_cases ORDER BY id DESC LIMIT 1;`

### Test 3: View Announcements
1. Go to `/announcements` page
2. Check browser console for API calls
3. Data should load from database

## 🔍 Troubleshooting

### Frontend shows "Cannot connect to backend"
- ✅ Check backend server is running: `php artisan serve`
- ✅ Verify backend is on `http://127.0.0.1:8000`
- ✅ Check CORS settings in `config/cors.php`

### Database connection failed
- ✅ Check MySQL is running
- ✅ Verify database `brgy_data` exists
- ✅ Check `.env` file has correct credentials
- ✅ Test connection: `php artisan tinker` then `DB::connection()->getPdo();`

### API returns 404
- ✅ Check routes are registered: `php artisan route:list`
- ✅ Verify API base URL in `src/api.js` is correct

### Data not saving
- ✅ Check migrations ran: `php artisan migrate:status`
- ✅ Verify model fillable fields include new columns
- ✅ Check Laravel logs: `storage/logs/laravel.log`

## 📝 Database Tables

All data is stored in MySQL:

- **announcements** - Public announcements and services
- **blotter_cases** - Incident reports from public
- **document_requests** - Document requests from public
- **activity_logs** - Contact form submissions
- **residents** - Resident records (admin only)
- **users** - System users (admin/staff)

## ✅ Connection Verified

The frontend is now fully connected to your MySQL database. All form submissions and data fetches go through the Laravel backend API which stores data in MySQL.

