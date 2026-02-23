# Admin Account Setup Guide

## Creating an Admin Account

To create an admin account with full administrative privileges, use the provided script:

### Option 1: Using the Script (Recommended)

```bash
cd Brgy2/backend-node
node scripts/create-admin.js [email] [password] [name] [role]
```

**Examples:**

```bash
# Create admin with default credentials
node scripts/create-admin.js

# Create admin with custom credentials
node scripts/create-admin.js admin@brgy853.ph admin123 "System Administrator" admin

# Create a staff account
node scripts/create-admin.js staff@brgy853.ph staff123 "Staff Member" staff
```

**Default Admin Credentials:**
- Email: `admin@brgy853.ph`
- Password: `admin123`
- Name: `System Administrator`
- Role: `admin`

⚠️ **Important:** Change the password after first login!

### Option 2: Using SQL Directly

```sql
-- Hash the password first using bcrypt
-- You can use: node scripts/hash-password.js your_password

INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
  'System Administrator',
  'admin@brgy853.ph',
  '$2a$10$YOUR_BCRYPT_HASH_HERE',
  'admin',
  NOW(),
  NOW()
);
```

## Admin Features

Once logged in as an admin, you can:

1. **Create User Accounts**
   - Navigate to "User Management" in the admin dashboard
   - Click "+ Create User" button
   - Fill in the form:
     - Name
     - Email
     - Password (minimum 6 characters)
     - Role (Staff, Admin, or Resident)

2. **View All Users**
   - See all registered users in the system
   - Filter by role (Admin, Staff, Resident)
   - Search by name or email

3. **Delete Users**
   - Remove user accounts (except your own)
   - Confirmation dialog prevents accidental deletion

## User Roles

- **Admin**: Full access, can create/manage users
- **Staff**: Can manage residents, documents, blotters, announcements
- **Resident**: Limited access, can view own documents and cases

## Security Notes

- Passwords are hashed using bcrypt
- Only admins can create other admin/staff accounts
- Admins cannot delete their own account
- Session expires after 15 minutes of inactivity

## Troubleshooting

### "Access Denied" when trying to create users
- Ensure you're logged in with an admin account
- Check that your user role is 'admin' in the database

### Cannot create admin account
- Ensure the `users` table exists
- Check database connection in `.env` file
- Verify MySQL is running

### Forgot admin password
- Use the script to update the password:
  ```bash
  node scripts/create-admin.js admin@brgy853.ph newpassword "System Administrator" admin
  ```

