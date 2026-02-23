# Database Setup Guide

## Step 1: Create MySQL Database

Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Configure Environment File

1. Copy `.env.example` to `.env`:
   ```bash
   cd Brgy2/backend
   copy .env.example .env
   ```

2. Edit `.env` file and update database settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=brgy_data
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   
   **Note:** If your MySQL has a password, add it to `DB_PASSWORD=your_password`

## Step 3: Generate Application Key

```bash
php artisan key:generate
```

## Step 4: Run Migrations

This will create all tables and add the new fields:

```bash
php artisan migrate
```

## Step 5: Seed Default Data (Optional)

```bash
php artisan db:seed
```

## Step 6: Start the Server

```bash
php artisan serve
```

The API will be available at `http://127.0.0.1:8000`

## Testing the Connection

Test if the database connection works:

```bash
php artisan tinker
```

Then in tinker:
```php
DB::connection()->getPdo();
```

If it returns the PDO object, the connection is successful!

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /api/public/announcements` - Get published announcements
- `GET /api/public/documents` - Get document types and requirements  
- `POST /api/public/report` - Submit incident report
- `POST /api/public/document-request` - Submit document request

### Example: Submit Report

```bash
curl -X POST http://127.0.0.1:8000/api/public/report \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "reporter_name": "Juan Dela Cruz",
    "reporter_contact": "09171234567",
    "reporter_address": "123 Main St",
    "incident_type": "Noise Complaint",
    "incident_date": "2025-01-15",
    "incident_time": "22:00",
    "incident_location": "Zone 1",
    "incident_description": "Loud music after 10 PM"
  }'
```

## Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `.env`
- Make sure database `brgy_data` exists
- Check MySQL user has proper permissions

### Migration Errors
- Make sure database exists
- Check if tables already exist (may need to drop and recreate)
- Run `php artisan migrate:fresh` to reset (WARNING: deletes all data)

