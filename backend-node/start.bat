@echo off
echo ========================================
echo Barangay Management System - Backend
echo Node.js + MongoDB API Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from .env.example...
    if exist ".env.example" (
        copy .env.example .env
        echo Please edit .env file with your MongoDB connection string
        echo.
    ) else (
        echo Warning: .env.example not found. Creating basic .env...
        (
            echo PORT=8000
            echo NODE_ENV=development
            echo MONGODB_URI=mongodb://127.0.0.1:27017/brgy_management
            echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
            echo JWT_EXPIRES_IN=7d
        ) > .env
    )
    echo.
)

echo Starting server...
echo Make sure MongoDB is running!
echo.
echo Server will start on: http://127.0.0.1:8000
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

node server.js

pause

