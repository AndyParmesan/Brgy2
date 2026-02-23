# MongoDB Setup Guide

## Error: "connect ECONNREFUSED 127.0.0.1:27017"

This means MongoDB is not running. Here are your options:

## Option 1: Install and Run MongoDB Locally (Recommended for Development)

### Windows:

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download and install

2. **During installation:**
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - MongoDB will start automatically

3. **Verify MongoDB is running:**
   - Open Task Manager (Ctrl+Shift+Esc)
   - Look for "MongoDB" process
   - Or open Command Prompt and type: `mongod --version`

4. **Start MongoDB manually (if needed):**
   ```bash
   # MongoDB should start automatically as a service
   # If not, find MongoDB installation folder and run:
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
   ```

### Linux/Mac:

```bash
# Install MongoDB
# Ubuntu/Debian:
sudo apt-get install mongodb

# Mac (using Homebrew):
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod
# Or:
mongod
```

## Option 2: Use MongoDB Atlas (Cloud - Free Tier Available)

1. **Create free account:**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region
   - Create cluster (takes 3-5 minutes)

3. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`

4. **Update `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/brgy_management
   ```
   - Replace `username` and `password` with your MongoDB Atlas credentials
   - Make sure to whitelist your IP address in MongoDB Atlas (Network Access)

5. **Update connection string:**
   - In MongoDB Atlas, go to Database Access
   - Create a database user
   - Use that username/password in the connection string

## Option 3: Use Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## After MongoDB is Running

1. **Seed the users:**
   ```bash
   node seeders/seedUsers.js
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

## Verify MongoDB Connection

Test if MongoDB is accessible:
```bash
# Windows (if MongoDB is in PATH):
mongo --eval "db.version()"

# Or use MongoDB Compass (GUI):
# Download from: https://www.mongodb.com/products/compass
```

## Quick Check

- **Windows:** Check Task Manager for "MongoDB" process
- **Connection test:** Try `telnet 127.0.0.1 27017` (should connect)
- **Default port:** 27017

