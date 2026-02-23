# MySQL Configuration Guide

## Current Issue

The database connection is failing because MySQL requires authentication. Here's how to fix it:

## Option 1: Set MySQL Password in .env (Recommended)

### Step 1: Find Your MySQL Password

If you set a password during MySQL installation, use that. If you forgot it, you may need to reset it.

### Step 2: Update .env File

Edit `Brgy2/backend-node/.env` and add your MySQL password:

```env
DB_PASSWORD=your_mysql_password_here
```

### Step 3: Test Connection

```bash
node test-connection.js
```

## Option 2: Create MySQL User Without Password

If you want to use a user without a password:

### Step 1: Open MySQL Command Line

```bash
mysql -u root -p
```

### Step 2: Create User and Grant Permissions

```sql
CREATE USER 'brgy_user'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON brgy_data.* TO 'brgy_user'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Update .env

```env
DB_USER=brgy_user
DB_PASSWORD=
```

## Option 3: Use Interactive Configuration

Run the configuration helper:

```bash
node configure-db.js
```

This will guide you through setting up the database connection.

## Option 4: Reset MySQL Root Password

If you need to reset the root password:

### Windows (XAMPP/WAMP)
1. Stop MySQL service
2. Start MySQL with `--skip-grant-tables`
3. Connect and update password
4. Restart MySQL normally

### Linux/Mac
```bash
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

## Quick Test

After configuring, test the connection:

```bash
node test-connection.js
```

## Create Database

If the database doesn't exist, create it:

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Common Issues

### "Access denied for user"
- Check password in .env
- Verify user has permissions
- Try creating a new MySQL user

### "Unknown database"
- Create the database (see above)
- Check database name in .env matches

### "Connection refused"
- Check MySQL is running
- Verify host and port in .env
- Check firewall settings

## Next Steps

Once connection is successful:
1. Run database migrations (if using Laravel migrations)
2. Start the server: `npm start`
3. Test API: `curl http://127.0.0.1:3001/health`

