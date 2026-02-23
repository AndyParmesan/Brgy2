# Fix Login Issue - User "admin" with Password "admin"

## Problem

You created a user with username "admin" and password "admin" but can't login.

## Common Issues

1. **Password not hashed** - Password is stored as plain text "admin" but backend expects bcrypt hash
2. **Wrong field** - User might be in `name` field but login checks `email` field
3. **Case sensitivity** - Email/name might have different casing

## Quick Fix

### Option 1: Use the Fix Script (Easiest)

```bash
cd Brgy2/backend-node
node scripts/fix-admin-password.js admin admin
```

This will:
- Find the user with name or email "admin"
- Hash the password "admin" using bcrypt
- Update the database
- Allow you to login

### Option 2: Check Your User First

```bash
cd Brgy2/backend-node
node scripts/check-user.js admin
```

This will show:
- If user exists
- What fields are set (email, name)
- If password is hashed
- Test if password works

### Option 3: Manual SQL Fix

1. **Hash the password**:
```bash
node scripts/hash-password.js admin
```

This will output a hash like: `$2a$10$...`

2. **Update database**:
```sql
UPDATE users 
SET password = '$2a$10$...' 
WHERE name = 'admin' OR email = 'admin';
```

## Updated Login Logic

The backend now:
- ✅ Checks both `email` and `name` fields
- ✅ Supports plain text passwords (auto-hashes them on first login)
- ✅ Works with "admin" as email or name

## Test Login

After fixing, try logging in with:
- **Email/Username**: `admin` (or whatever email you set)
- **Password**: `admin`

## Still Not Working?

1. **Check if user exists**:
```bash
node scripts/check-user.js admin
```

2. **Check backend logs** when you try to login - it will show what's happening

3. **Verify database**:
```sql
SELECT id, name, email, role, LEFT(password, 20) as password_hash FROM users;
```

4. **Check backend is running**:
```bash
npm start
```

## What Changed

The login route now:
- Searches by email first, then by name
- Accepts plain text passwords and auto-hashes them
- Provides better error messages

Try logging in again - it should work now!

