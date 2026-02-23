# How to Run Migrations - Step by Step Guide

## Prerequisites

Before running migrations, make sure you have:
- ✅ MySQL server installed and running
- ✅ PHP installed (7.4 or higher)
- ✅ Composer installed
- ✅ Laravel dependencies installed (`composer install`)

## Step-by-Step Instructions

### Step 1: Create the MySQL Database

**Option A: Using MySQL Command Line**
```bash
mysql -u root -p
```

Then in MySQL:
```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Option B: Using phpMyAdmin**
1. Open phpMyAdmin in your browser
2. Click "New" to create a database
3. Name it: `brgy_data`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

### Step 2: Navigate to Backend Directory

```bash
cd Brgy2/backend
```

### Step 3: Configure Environment File

**If `.env` file doesn't exist:**

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Edit the `.env` file** and update these lines:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brgy_data
DB_USERNAME=root
DB_PASSWORD=
```

**Important:** 
- If your MySQL has a password, add it: `DB_PASSWORD=your_password`
- If MySQL is on a different host, update `DB_HOST`

### Step 4: Generate Application Key

```bash
php artisan key:generate
```

This creates a unique encryption key for your application.

### Step 5: Run Migrations

**Run all migrations:**
```bash
php artisan migrate
```

You should see output like:
```
Migration table created successfully.
Migrating: 2024_01_01_000000_create_users_table
Migrated:  2024_01_01_000000_create_users_table (XX.XXms)
Migrating: 2024_01_01_000001_create_households_table
Migrated:  2024_01_01_000001_create_households_table (XX.XXms)
...
```

### Step 6: Verify Migrations

**Check migration status:**
```bash
php artisan migrate:status
```

This shows which migrations have run.

**Verify tables were created:**
```bash
php artisan tinker
```

Then in tinker:
```php
DB::select('SHOW TABLES');
```

You should see all tables including:
- users
- households
- residents
- document_requests
- blotter_cases
- announcements
- contacts
- activity_logs
- personal_access_tokens
- And more...

Type `exit` to leave tinker.

## Common Commands

### Run Migrations
```bash
php artisan migrate
```

### Check Migration Status
```bash
php artisan migrate:status
```

### Rollback Last Migration
```bash
php artisan migrate:rollback
```

### Rollback All Migrations
```bash
php artisan migrate:reset
```

### Fresh Start (⚠️ WARNING: Deletes all data)
```bash
php artisan migrate:fresh
```

### Run Specific Migration
```bash
php artisan migrate --path=/database/migrations/2024_01_01_000012_create_contacts_table.php
```

## Troubleshooting

### Error: "Access denied for user"
**Solution:** Check your `.env` file:
- Verify `DB_USERNAME` and `DB_PASSWORD` are correct
- Make sure MySQL user has permissions to create databases

### Error: "Unknown database 'brgy_data'"
**Solution:** Create the database first (Step 1)

### Error: "Table already exists"
**Solution:** 
- If you want to keep data: Skip this migration
- If you want to start fresh: `php artisan migrate:fresh` (⚠️ deletes all data)

### Error: "Class not found"
**Solution:** Run `composer dump-autoload`

### Error: "Connection refused"
**Solution:** 
- Check if MySQL is running
- Verify `DB_HOST` and `DB_PORT` in `.env`
- Try `127.0.0.1` instead of `localhost`

### Test Database Connection
```bash
php artisan tinker
```

```php
DB::connection()->getPdo();
```

If successful, you'll see: `PDO Object`

## What Gets Created

After running migrations, these tables will be created:

### Frontend Tables
- ✅ `announcements` - Public announcements/services/events
- ✅ `blotter_cases` - Incident reports
- ✅ `document_requests` - Document requests
- ✅ `contacts` - Contact form submissions

### Admin Tables
- ✅ `users` - System users
- ✅ `households` - Household records
- ✅ `residents` - Resident records
- ✅ `activity_logs` - System activity

### Supporting Tables
- ✅ `blotter_parties` - Parties in cases
- ✅ `blotter_actions` - Case actions
- ✅ `document_request_attachments` - Document attachments
- ✅ `announcement_action_items` - Announcement items
- ✅ `personal_access_tokens` - API tokens

## Next Steps

After migrations complete:

1. **Start the backend server:**
   ```bash
   php artisan serve
   ```

2. **Test the connection:**
   - Visit: `http://127.0.0.1:8000/api/public/documents`
   - Should return JSON data

3. **Start the frontend:**
   ```bash
   cd ../brgy
   npm start
   ```

4. **Test frontend forms:**
   - Submit a report → Check `blotter_cases` table
   - Submit contact form → Check `contacts` table

## Quick Reference

```bash
# Full setup (first time)
cd Brgy2/backend
copy .env.example .env          # Windows
# cp .env.example .env         # Linux/Mac
# Edit .env with database credentials
php artisan key:generate
php artisan migrate

# Check status
php artisan migrate:status

# Test connection
php artisan tinker
# Then: DB::connection()->getPdo();
```

## Need Help?

If migrations fail:
1. Check error message
2. Verify database exists
3. Verify `.env` configuration
4. Check MySQL is running
5. Try `php artisan migrate:fresh` (⚠️ deletes data)

