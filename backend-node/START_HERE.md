# 🚀 START HERE - Quick Setup

## Current Status

✅ Node.js backend is created and ready
✅ Dependencies are installed
✅ Configuration files are set up
⚠️ **MySQL password needs to be configured**

## Quick Fix (2 minutes)

### Step 1: Add MySQL Password

Open `Brgy2/backend-node/.env` and update this line:

```env
DB_PASSWORD=your_mysql_password
```

**Don't have a password?** See Option 2 below.

### Step 2: Test Connection

```bash
cd Brgy2/backend-node
node test-connection.js
```

### Step 3: Start Server

```bash
npm start
```

## If You Don't Have MySQL Password

### Option A: Set a Password

```sql
-- In MySQL
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
```

Then update .env with the new password.

### Option B: Create User Without Password

```sql
CREATE USER 'brgy_user'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON brgy_data.* TO 'brgy_user'@'localhost';
FLUSH PRIVILEGES;
```

Update .env:
```env
DB_USER=brgy_user
DB_PASSWORD=
```

## Interactive Setup

Prefer a guided setup? Run:

```bash
node configure-db.js
```

## Verify Everything Works

1. **Test Database:**
   ```bash
   node test-connection.js
   ```
   Should show: ✅ SUCCESS

2. **Start Server:**
   ```bash
   npm start
   ```
   Should show: ✅ MySQL Database connected successfully!

3. **Test API:**
   ```bash
   curl http://127.0.0.1:3001/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

## Need More Help?

- `QUICK_FIX.md` - Common issues and solutions
- `CONFIGURE_MYSQL.md` - Detailed MySQL setup
- `README.md` - Complete documentation

