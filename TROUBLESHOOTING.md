# Troubleshooting "Failed to fetch" Error

## Common Causes and Solutions

### 1. Backend Server Not Running

**Problem:** The Laravel backend server is not running.

**Solution:**
```bash
cd backend
php artisan serve
```

You should see: `Laravel development server started: http://127.0.0.1:8000`

### 2. CORS Configuration Issue

**Problem:** The React app is running on a different port than what's allowed in CORS.

**Solution:**
1. Check what port your React app is running on (usually shown in terminal)
2. Update `backend/config/cors.php` to include your React app's URL:
   ```php
   'allowed_origins' => [
       'http://localhost:3000',
       'http://127.0.0.1:3000',
       'http://localhost:5173',  // Vite default
       'http://127.0.0.1:5173',
       // Add your port here if different
   ],
   ```
3. Clear Laravel config cache:
   ```bash
   php artisan config:clear
   ```

### 3. Database Not Set Up

**Problem:** Database migrations haven't been run.

**Solution:**
```bash
cd backend
php artisan migrate
php artisan db:seed
```

### 4. Wrong API URL

**Problem:** The frontend is trying to connect to the wrong URL.

**Check:** Open browser DevTools (F12) → Network tab → Look at the failed request URL.

**Solution:** Make sure `brgy/src/api.js` and `brgy/src/Login.js` have the correct API URL:
```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

### 5. Laravel Sanctum Not Installed

**Problem:** Laravel Sanctum package is missing.

**Solution:**
```bash
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 6. Check Backend Logs

**Solution:**
```bash
cd backend
tail -f storage/logs/laravel.log
```

This will show any errors from the backend.

### 7. Test Backend Directly

Test if the backend is working:

```bash
curl http://127.0.0.1:8000/api/login \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}'
```

If this works, the backend is fine and the issue is with the frontend connection.

### 8. Check Browser Console

Open browser DevTools (F12) → Console tab to see the exact error message.

## Quick Checklist

- [ ] Backend server is running (`php artisan serve`)
- [ ] Database is created and migrations are run
- [ ] Users are seeded (`php artisan db:seed`)
- [ ] CORS is configured for your React app's port
- [ ] API URL in frontend matches backend URL
- [ ] No firewall blocking port 8000
- [ ] Check browser console for detailed error

## Still Having Issues?

1. Check if backend is accessible: Open `http://127.0.0.1:8000` in browser (should show Laravel welcome page or error)
2. Check React app port: Look at terminal where `npm start` is running
3. Verify both servers are running simultaneously

