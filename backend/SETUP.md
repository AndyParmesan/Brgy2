# Backend Setup Guide

## Step 1: Install Laravel (if not already installed)

If you don't have a full Laravel installation yet, you need to create it:

```bash
# Navigate to the parent directory
cd "D:\Brgy Management"

# Create Laravel project in backend folder
composer create-project laravel/laravel backend "10.*"
```

**Note:** If the `backend` folder already has some files, you may need to:
1. Rename the current `backend` folder to `backend_old`
2. Create new Laravel project
3. Copy the files from `backend_old` to the new `backend` folder

## Step 2: Install Dependencies

```bash
cd backend
composer install
```

## Step 3: Configure Environment

```bash
# Copy environment file
copy .env.example .env

# Or on Linux/Mac:
# cp .env.example .env
```

Edit `.env` file and update database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brgy_management
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

## Step 4: Generate Application Key

```bash
php artisan key:generate
```

## Step 5: Create Database

Create the database in MySQL:

```sql
CREATE DATABASE brgy_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Step 6: Run Migrations

```bash
php artisan migrate
```

## Step 7: Seed Users

```bash
php artisan db:seed
```

This creates:
- `admin@admin.com` / `admin`
- `alrajiediamla12@gmail.com` / `1234`
- `admin@brgy853.ph` / `password`
- `staff@brgy853.ph` / `password`

## Step 8: Install Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

## Step 9: Start the Server

```bash
php artisan serve
```

You should see:
```
Laravel development server started: http://127.0.0.1:8000
```

## Step 10: Test the API

Open a new terminal and test:

```bash
curl http://127.0.0.1:8000/api/login -X POST -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"email\":\"admin@admin.com\",\"password\":\"admin\"}"
```

Or open in browser: `http://127.0.0.1:8000` (should show Laravel welcome page)

## Troubleshooting

### If `composer` command not found:
- Install Composer: https://getcomposer.org/download/
- Or use XAMPP/WAMP which includes Composer

### If `php artisan` command not found:
- Make sure PHP is in your PATH
- Or use full path: `C:\xampp\php\php.exe artisan serve`

### If port 8000 is already in use:
```bash
php artisan serve --port=8001
```
Then update `brgy/src/api.js` and `brgy/src/Login.js` to use port 8001

### If database connection fails:
- Check MySQL is running
- Verify credentials in `.env`
- Make sure database exists

