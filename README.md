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





Updated Features April 09,2026


Unified Search Engine: A centralized tool for instantly retrieving information across all data categories within the system.

Dynamic Data Visualization: Interactive charts that provide live insights into demographic trends and service performance metrics.

Real-Time Notification System: Automated alerts that keep personnel informed of new requests or urgent filings immediately.

Secure Public Portals: A gateway that allows individuals to track the status of their requests remotely and securely.

Automated Session Security: A feature that protects data by automatically ending inactive user sessions after a defined period.

Local Network Accessibility: A configuration that enables the application to be used across multiple devices on a shared network.


Updated Features April 10,2026

(Note: Whenever you are ready to use your own photo, simply drop your brgyimg.jpg file directly into the brgy/public folder, and it will instantly override the web placeholder!)
Online Document Requests: Created a public-facing portal where residents can digitally submit applications for clearances and IDs.

Request Tracking System: Built a tracking module that allows residents to check their application status in real-time using a unique reference ID.

Automated Email Notifications: Integrated Nodemailer to automatically send professional update emails to residents when their requests are approved or rejected.

Interactive Statistics Dashboard: Developed a visual reporting suite using Recharts to track population trends and document volumes.

Print & PDF Exporting: Implemented specialized CSS print rules to allow administrators to generate clean, professional hard copies of barangay reports.

Resident Photo Uploads: Configured Multer and backend file storage to allow staff to upload and display profile pictures for every resident record.

Blotter & Case Management: Built a detailed tracking system for recording, categorizing, and resolving community disputes and blotter reports.

Global Search Functionality: Created a centralized search engine that instantly queries residents, documents, and blotter records across the entire database.

Mobile Responsive Navigation: Refined the entire UI using CSS media queries to ensure the dashboard remains fully functional on smartphones and tablets.

Activity Audit Logging: Established a secure backend logger that records every administrative action for transparency and system accountability.

Database Debugging & Optimization: Resolved critical SQL errors including missing tables, incorrect data types, and route path mismatches.
