How to Run Barangay 853 Management System
Prerequisites (One-time setup)

Node.js installed
MySQL/XAMPP running
brgy_data database exists in MySQL


Every Time You Want to Run the System
Step 1: Start MySQL

Open XAMPP and click Start on MySQL
OR make sure MySQL Workbench is connected

Step 2: Start the Backend
bashcd C:\Users\BMAX\Desktop\Brgy1\Brgy2\backend-node
npm start
✅ You should see: MySQL Database connected successfully!
Step 3: Start the Frontend (open a new terminal)
bashcd C:\Users\BMAX\Desktop\Brgy1\Brgy2\brgy
npm start
✅ Browser opens at http://localhost:3000

Login Credentials
EmailPasswordRoleadmin@brgy853.phadmin123 or passwordAdminadmin@gmail.comadminAdmin

If login fails, reset password:
bashcd C:\Users\BMAX\Desktop\Brgy1\Brgy2\backend-node
node scripts/fix-admin-password.js admin@brgy853.ph admin123


To Stop the System

Press Ctrl + C in both terminals
Stop MySQL in XAMPP
