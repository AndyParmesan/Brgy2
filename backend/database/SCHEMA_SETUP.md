# Database Schema Setup Instructions

## Overview

This guide will help you set up the complete database schema for the Barangay Management System based on frontend requirements.

## Step 1: Create Database

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 2: Configure .env

Edit `Brgy2/backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brgy_data
DB_USERNAME=root
DB_PASSWORD=
```

## Step 3: Run All Migrations

```bash
cd Brgy2/backend
php artisan migrate
```

This will create all tables in the correct order:

1. ✅ users
2. ✅ households
3. ✅ residents
4. ✅ document_requests
5. ✅ blotter_cases
6. ✅ announcements
7. ✅ activity_logs
8. ✅ personal_access_tokens
9. ✅ contacts (NEW - for contact form)
10. ✅ All additional fields for frontend support

## Step 4: Verify Schema

Check that all tables were created:

```bash
php artisan tinker
```

Then in tinker:
```php
DB::select('SHOW TABLES');
```

You should see:
- users
- households
- residents
- document_requests
- document_request_attachments
- blotter_cases
- blotter_parties
- blotter_actions
- announcements
- announcement_action_items
- contacts ⭐ NEW
- activity_logs
- personal_access_tokens

## Step 5: Test Frontend Connection

1. Start backend: `php artisan serve`
2. Start frontend: `cd Brgy2/brgy && npm start`
3. Test each page:
   - `/announcements` - Should fetch from database
   - `/documents` - Should show document types
   - `/report` - Should save to `blotter_cases` table
   - `/about` - Should save to `contacts` table

## Schema Summary

### Frontend-Facing Tables

| Table | Purpose | Frontend Page |
|-------|---------|---------------|
| `announcements` | Public announcements/services/events | `/announcements` |
| `blotter_cases` | Incident reports | `/report` |
| `document_requests` | Document requests | `/documents` |
| `contacts` | Contact form submissions | `/about` |

### Admin-Only Tables

| Table | Purpose |
|-------|---------|
| `users` | System users |
| `residents` | Resident records |
| `households` | Household records |
| `activity_logs` | System activity |

## Key Features

✅ **Announcements** - Supports services, announcements, and events with rich data (items, highlights, schedule)
✅ **Blotter Cases** - Complete incident reporting with all reporter and incident details
✅ **Document Requests** - Full document request tracking with contact info
✅ **Contacts** - Dedicated contact form submissions table
✅ **JSON Fields** - Flexible data storage for items, highlights, and schedules

## Troubleshooting

### Migration Fails
```bash
# Reset and re-run
php artisan migrate:fresh
```

### Missing Tables
```bash
# Check migration status
php artisan migrate:status

# Run specific migration
php artisan migrate --path=/database/migrations/2024_01_01_000012_create_contacts_table.php
```

### Foreign Key Errors
- Make sure migrations run in order
- Check that parent tables exist before child tables

## Next Steps

After schema is set up:
1. Seed sample data (optional): `php artisan db:seed`
2. Create admin user
3. Test all frontend forms
4. Verify data is saving correctly

