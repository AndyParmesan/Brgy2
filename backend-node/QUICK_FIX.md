# Quick Fix for Database Connection

## The Problem
MySQL is rejecting the connection because it requires a password for the root user.

## Quick Solution

### 1. Check if you have a MySQL password

If you installed MySQL/XAMPP/WAMP, you may have set a password. 

### 2. Update .env file

Open `Brgy2/backend-node/.env` and add your MySQL password:

```env
DB_PASSWORD=your_actual_mysql_password
```

**If you don't have a password**, you need to either:
- Set a password for MySQL root user, OR
- Create a new MySQL user without password

### 3. Test the connection

```bash
node test-connection.js
```

### 4. If still failing, try this MySQL command

Open MySQL command line and run:

```sql
-- Option A: Set password for root (if you want to use root)
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';

-- Option B: Create new user without password
CREATE USER 'brgy_user'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON brgy_data.* TO 'brgy_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update .env:
```env
DB_USER=brgy_user
DB_PASSWORD=
```

### 5. Create the database (if it doesn't exist)

```sql
CREATE DATABASE brgy_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Start the server

```bash
npm start
```

You should see:
```
✅ MySQL Database connected successfully!
🚀 Server started successfully!
```

## Still Having Issues?

Run the interactive configuration:
```bash
node configure-db.js
```

This will guide you through the setup step by step.

