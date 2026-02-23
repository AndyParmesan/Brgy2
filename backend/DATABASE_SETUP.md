# Database Setup Instructions

## MySQL Database Configuration

### Step 1: Create the Database

Open MySQL command line or phpMyAdmin and run:

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure .env File

Copy `.env.example` to `.env` in the backend folder:

```bash
cd Brgy2/backend
copy .env.example .env
```

Or on Linux/Mac:
```bash
cp .env.example .env
```

### Step 3: Update Database Settings in .env

Edit the `.env` file and update these lines:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brgy_data
DB_USERNAME=root
DB_PASSWORD=
```

**Note:** If your MySQL has a password, add it to `DB_PASSWORD=your_password`

### Step 4: Generate Application Key

```bash
php artisan key:generate
```

### Step 5: Run Migrations

```bash
php artisan migrate
```

This will create all the necessary tables in the database.

### Step 6: Seed Default Data (Optional)

```bash
php artisan db:seed
```

### Step 7: Start the Server

```bash
php artisan serve
```

The API will be available at `http://127.0.0.1:8000`

## Testing the Connection

You can test if the database connection works by running:

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

### Protected Endpoints (Authentication Required)

- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user
- `GET /api/residents` - Get residents
- `GET /api/document-requests` - Get document requests
- `GET /api/blotter-cases` - Get blotter cases
- `GET /api/announcements` - Get announcements
- `GET /api/activity-logs` - Get activity logs

