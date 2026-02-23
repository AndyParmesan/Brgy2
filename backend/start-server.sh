#!/bin/bash

echo "Starting Laravel Backend Server..."
echo ""
echo "Make sure you have:"
echo "1. Run: composer install"
echo "2. Run: php artisan migrate"
echo "3. Run: php artisan db:seed"
echo "4. Configured .env file with database credentials"
echo ""
echo "Starting server on http://127.0.0.1:8000"
echo ""

php artisan serve

