# Quick Start Guide - Node.js Backend

## Step 1: Install Dependencies

```bash
cd backend-node
npm install
```

## Step 2: Make Sure MongoDB is Running

**Option A: Local MongoDB**
- If you have MongoDB installed locally, make sure it's running
- Windows: Usually runs as a Windows service automatically
- Check: Open Task Manager → Look for "MongoDB" process

**Option B: MongoDB Atlas (Cloud - Free)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env` file

## Step 3: Configure Environment

Create `.env` file (or copy from `.env.example`):

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/brgy_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Step 4: Seed Default Users

```bash
node seeders/seedUsers.js
```

This creates:
- `admin@admin.com` / `admin`
- `alrajiediamla12@gmail.com` / `1234`
- `admin@brgy853.ph` / `password`
- `staff@brgy853.ph` / `password`

## Step 5: Start the Server

**Windows:**
```bash
# Option 1: Use the batch file
start.bat

# Option 2: Manual start
npm run dev
```

**Linux/Mac:**
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://127.0.0.1:8000
📡 API available at http://127.0.0.1:8000/api
```

## Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### MongoDB connection error
1. **Check if MongoDB is running:**
   - Windows: Check Task Manager for MongoDB process
   - Or try: `mongod` in terminal

2. **Check connection string in `.env`:**
   - Local: `mongodb://127.0.0.1:27017/brgy_management`
   - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/brgy_management`

3. **Install MongoDB locally (if needed):**
   - Download: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud - free tier available)

### Port 8000 already in use
Change port in `.env`:
```env
PORT=8001
```

Then update frontend API URL in `brgy/src/api.js` and `brgy/src/Login.js`

### Test if server is running
Open browser: `http://127.0.0.1:8000/api/health`

Should return: `{"status":"ok","message":"API is running"}`

