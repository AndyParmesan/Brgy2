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

Updated Features April 04,2026
Unified Search Engine: A centralized tool for instantly retrieving information across all data categories within the system.

Dynamic Data Visualization: Interactive charts that provide live insights into demographic trends and service performance metrics.

Real-Time Notification System: Automated alerts that keep personnel informed of new requests or urgent filings immediately.

Secure Public Portals: A gateway that allows individuals to track the status of their requests remotely and securely.

Automated Session Security: A feature that protects data by automatically ending inactive user sessions after a defined period.

Local Network Accessibility: A configuration that enables the application to be used across multiple devices on a shared network.
