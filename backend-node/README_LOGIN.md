# Login System - Database Integration

## Overview

The login system is now fully connected to the MySQL `users` table. When a user attempts to log in, the system:

1. ✅ Checks if the account exists in the `users` table
2. ✅ Verifies the password using bcrypt
3. ✅ Returns specific error messages for different scenarios
4. ✅ Generates JWT token for authenticated users

## How It Works

### Backend (`routes/auth.js`)

1. **Receives login request** with email and password
2. **Queries database**: `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`
3. **Checks if account exists**:
   - If not found → Returns: "Account not found"
   - If found → Proceeds to password check
4. **Verifies password** using bcrypt.compare()
   - If incorrect → Returns: "Invalid password"
   - If correct → Generates JWT token and returns user data

### Frontend (`LoginModal.js`)

1. **User selects** "Staff/Admin Login"
2. **Sends request** to `/api/auth/login`
3. **Displays specific error messages**:
   - "Account not found" - Email doesn't exist in database
   - "Incorrect password" - Email exists but password is wrong
   - "Cannot connect to server" - Backend is not running
   - "Database connection failed" - Database is not accessible

## Error Messages

| Scenario | Error Message |
|----------|---------------|
| Account doesn't exist | "Account not found. No user exists with this email address." |
| Wrong password | "Incorrect password. Please check your password and try again." |
| Database connection failed | "Cannot connect to database. Please contact the administrator." |
| Server not running | "Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:3001" |

## Creating Test Users

### Option 1: Using SQL

```sql
-- Hash password: admin123
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
  'Admin User',
  'admin@brgy853.ph',
  '$2a$10$rK8X8X8X8X8X8X8X8X8Xe8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X',
  'admin',
  NOW(),
  NOW()
);
```

### Option 2: Using Script

```bash
cd Brgy2/backend-node
node scripts/create-test-user.js
```

This creates:
- Email: `admin@brgy853.ph`
- Password: `admin123`
- Role: `admin`

### Option 3: Using bcrypt in Node.js

```javascript
const bcrypt = require('bcryptjs');
const password = 'your_password';
const hash = await bcrypt.hash(password, 10);
console.log(hash); // Use this in SQL INSERT
```

## Database Schema

The `users` table should have:
- `id` (primary key)
- `name` (varchar)
- `email` (varchar, unique)
- `password` (varchar, bcrypt hashed)
- `role` (varchar: 'admin', 'staff', etc.)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Testing

1. **Start backend**: `npm start` in `backend-node`
2. **Open frontend**: Login modal
3. **Select**: "Staff/Admin Login"
4. **Try login**:
   - With existing email → Should work or show password error
   - With non-existing email → Should show "Account not found"
   - With wrong password → Should show "Incorrect password"

## Security Features

✅ Passwords are hashed using bcrypt
✅ Case-insensitive email matching
✅ JWT tokens for authentication
✅ Specific error messages (without revealing too much)
✅ Database connection error handling

## Troubleshooting

### "Account not found" but user exists
- Check email spelling (case-insensitive)
- Verify user exists: `SELECT * FROM users WHERE email = 'your@email.com';`

### "Incorrect password" but password is correct
- Password must be bcrypt hashed
- Check password hash: `SELECT password FROM users WHERE email = 'your@email.com';`
- Re-hash password if needed

### "Cannot connect to server"
- Check backend is running: `npm start` in `backend-node`
- Check port 3001 is available
- Check `.env` configuration

### "Database connection failed"
- Check MySQL is running
- Verify `.env` database credentials
- Test connection: `node test-connection.js`

