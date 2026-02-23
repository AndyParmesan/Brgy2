# Barangay Management System - Backend API

Laravel 10 backend API for the Barangay Management System.

## Setup Instructions

### 1. Install Dependencies

```bash
composer install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update your `.env` file with database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brgy_management
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Create Database

Create a MySQL database:

```sql
CREATE DATABASE brgy_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Seed Default Users

```bash
php artisan db:seed
```

This will create two default users:
- **Admin**: `admin@brgy853.ph` / `password`
- **Staff**: `staff@brgy853.ph` / `password`

### 7. Install Laravel Sanctum (if not already installed)

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 8. Configure CORS

Update `config/cors.php` to allow requests from your React app:

```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 9. Start the Server

```bash
php artisan serve
```

The API will be available at `http://127.0.0.1:8000`

## API Endpoints

### Authentication
- `POST /api/login` - Login
- `POST /api/logout` - Logout (requires auth)
- `GET /api/user` - Get current user (requires auth)

### Protected Endpoints (require authentication)
- `GET /api/residents` - Get residents list
- `GET /api/document-requests` - Get document requests
- `GET /api/blotter-cases` - Get blotter cases
- `GET /api/announcements` - Get announcements
- `GET /api/activity-logs` - Get activity logs

## Testing the API

You can test the login endpoint with:

```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@brgy853.ph","password":"password"}'
```

