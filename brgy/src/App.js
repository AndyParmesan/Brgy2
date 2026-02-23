import { useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import logoBrgy from './assets/logo-brgy.png';
import Login from './Login';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Announcements from './pages/Announcements';
import Documents from './pages/Documents';
import Report from './pages/Report';
import ResidentDashboard from './pages/ResidentDashboard';
import UserProfile from './pages/UserProfile';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import DocumentRequestsSection from './components/DocumentRequestsSection';
import BlotterManagementSection from './components/BlotterManagementSection';
import ResidentManagementSection from './components/ResidentManagementSection';
import StatisticsSection from './components/StatisticsSection';
import DashboardOverviewSection from './components/DashboardOverviewSection';
import AuditLogSection from './components/AuditLogSection';

const quickActions = [
  { id: 'resident', label: 'Add Resident', accent: '#2563eb' },
  { id: 'blotter', label: 'New Blotter Case', accent: '#2563eb' },
  { id: 'announcement', label: 'Create Announcement', accent: '#2563eb' },
];

const statCards = [
  { id: 'residents', label: 'Total Residents', value: '1,500', icon: '👥' },
  { id: 'households', label: 'Total Households', value: '450', icon: '🏠' },
  { id: 'pending', label: 'Pending Requests', value: '12', icon: '❗' },
  { id: 'blotters', label: 'Active Blotters', value: '5', icon: '⚖️' },
];

const pendingRequests = [
  {
    id: 'DOC-2024-045',
    requester: 'Maria Dela Cruz',
    type: 'Cert. of Indigency',
    dateFiled: '2024-10-26',
    status: 'Pending',
  },
  {
    id: 'DOC-2024-038',
    requester: 'Jose Reyes',
    type: 'Barangay Clearance',
    dateFiled: '2024-10-25',
    status: 'Review',
  },
];

const activityFeed = [
  {
    time: '5 min ago',
    detail: 'Staff Juan added a new resident (Aan Dela Dula).',
  },
  {
    time: '2 hours ago',
    detail: 'Kap. Maria approved Barangay Clearance for Jose Reyes.',
  },
  {
    time: '4 hours ago',
    detail: 'Staff Ana scheduled hearing for Case ID BRGY-2024-003.',
  },
];

const documentRequests = [
  {
    id: 'DOC-2024-045',
    requester: 'Maria Dela Cruz',
    type: 'Certificate of Indigency',
    dateFiled: '2024-10-26',
    purpose: 'Medical financial assistance',
    status: 'Pending',
    contact: '0917 456 7890',
    details: {
      personalInfo: [
        { label: 'Full Name', value: 'Maria Buenaventura Dela Cruz' },
        { label: 'Sex / Gender', value: 'Female' },
        { label: 'Date of Birth', value: '1986-04-12' },
      ],
      addressInfo: [
        { label: 'Complete Address', value: 'Lot 12 Block 4, Purok Malinis, Zone 3, Brgy. 853' },
      ],
      requestInfo: [
        { label: 'Document Requested', value: 'Certificate of Indigency' },
        { label: 'Purpose', value: 'Medical financial assistance' },
        { label: 'Intended Recipient', value: 'PhilHealth Regional Office' },
      ],
      attachments: [
        { label: 'Supporting Documents', value: 'Medical abstract, PhilHealth letter' },
      ],
      verification: [
        { label: 'Receiving Staff', value: 'Kag. Santos' },
        { label: 'Remarks', value: 'Needs captain signature' },
      ],
    },
  },
  {
    id: 'DOC-2024-038',
    requester: 'Jose Reyes',
    type: 'Barangay Clearance',
    dateFiled: '2024-10-25',
    purpose: 'Employment requirement',
    status: 'Review',
    contact: '0956 110 2331',
    details: {
      personalInfo: [
        { label: 'Full Name', value: 'Jose Ramirez Reyes' },
        { label: 'Sex / Gender', value: 'Male' },
        { label: 'Date of Birth', value: '1992-01-19' },
      ],
      addressInfo: [
        { label: 'Complete Address', value: 'Blk 6 Lot 2, Sitio Riverside, Zone 1, Brgy. 853' },
      ],
      requestInfo: [
        { label: 'Document Requested', value: 'Barangay Clearance' },
        { label: 'Purpose', value: 'Employment requirement' },
        { label: 'Employer', value: 'Skybridge Logistics' },
      ],
      attachments: [
        { label: 'Supporting Documents', value: 'Company request letter, valid ID' },
      ],
      verification: [
        { label: 'Receiving Staff', value: 'Admin Dela Vega' },
        { label: 'Remarks', value: 'Pending blotter check' },
      ],
    },
  },
];

const blotterCases = [
  {
    id: 'BLT-2024-012',
    caseTitle: 'Noise disturbance at Sitio Riverside',
    category: 'Public disturbance',
    status: 'Under Investigation',
    priority: 'Medium',
    schedule: '2024-11-02 • 9:00 AM',
    investigator: 'Kag. Santos',
    complainant: 'Marites Abalos',
    respondent: 'Rogelio Villanueva',
    location: 'Sitio Riverside, Zone 1',
    details: {
      incident: [
        { label: 'Case ID', value: 'BLT-2024-012' },
        { label: 'Date / Time Reported', value: '2024-10-25 • 8:15 PM' },
        { label: 'Incident Location', value: 'Sitio Riverside, Zone 1' },
        { label: 'Summary', value: 'Repeated late-night gatherings causing disturbance.' },
      ],
      parties: [
        { label: 'Complainant', value: 'Marites Abalos' },
        { label: 'Respondent', value: 'Rogelio Villanueva' },
        { label: 'Witnesses', value: '2 neighbors on record' },
        { label: 'Contact', value: '0916 552 8899' },
      ],
      actions: [
        { label: 'Initial Action', value: 'Barangay tanod issued verbal warning.' },
        { label: 'Next Hearing', value: '2024-11-02 • Barangay Hall Session Room' },
        { label: 'Required Documents', value: 'ID copies, tenancy agreement' },
      ],
    },
  },
  {
    id: 'BLT-2024-009',
    caseTitle: 'Boundary dispute along Purok Malinis',
    category: 'Property dispute',
    status: 'For Mediation',
    priority: 'High',
    schedule: '2024-11-05 • 2:30 PM',
    investigator: 'Legal Aide Ramos',
    complainant: 'Criselda Ramos',
    respondent: 'Jomar Dizon',
    location: 'Purok Malinis, Zone 3',
    details: {
      incident: [
        { label: 'Case ID', value: 'BLT-2024-009' },
        { label: 'Date / Time Reported', value: '2024-10-18 • 10:45 AM' },
        { label: 'Incident Location', value: 'Purok Malinis, Zone 3' },
        { label: 'Summary', value: 'Alleged encroachment on shared pathway fence.' },
      ],
      parties: [
        { label: 'Complainant', value: 'Criselda Ramos' },
        { label: 'Respondent', value: 'Jomar Dizon' },
        { label: 'Witnesses', value: 'Homeowners Association officers' },
        { label: 'Contact', value: '0945 221 0998' },
      ],
      actions: [
        { label: 'Initial Action', value: 'Site inspection completed 2024-10-20.' },
        { label: 'Next Hearing', value: '2024-11-05 • 2:30 PM' },
        { label: 'Required Documents', value: 'Land title copy, tax declaration, HOA letter' },
      ],
    },
  },
];

const announcements = [
  {
    id: 'ANN-2024-018',
    title: 'Garbage Collection Schedule Update',
    priority: 'High',
    publishedOn: '2024-10-24',
    expiresOn: '2024-11-15',
    status: 'Published',
    target: 'All households',
    postedBy: 'Sec. Liza Ramos',
    summary: 'Temporary route adjustments while city trucks undergo maintenance.',
    body:
      'Starting October 28, morning collection will begin at Zone 3 followed by Zones 2 and 1. Please place bins outside by 6:00 AM. Hotline 852-1000 for missed pickups.',
    actionItems: ['Notify building admin groups', 'Post on official FB page', 'Print hallway flyers'],
  },
  {
    id: 'ANN-2024-014',
    title: 'Free Medical Mission Registration',
    priority: 'Normal',
    publishedOn: '2024-10-10',
    expiresOn: '2024-11-01',
    status: 'Draft',
    target: 'Senior citizens & PWDs',
    postedBy: 'Health Desk',
    summary: 'Pre-register beneficiaries for the Nov 8 joint medical mission with DOH.',
    body:
      'Walk-in registration accepted until Nov 1 at the barangay clinic. Bring valid ID and latest medical abstract if available.',
    actionItems: ['Finalize volunteer roster', 'Coordinate with DOH nurse lead', 'Prepare waiver forms'],
  },
];

const reportHighlights = [
  { label: 'Households Updated', value: '132', trend: '+8% vs last week' },
  { label: 'Documents Released', value: '248', trend: '+12% vs avg' },
  { label: 'Active Blotter Cases', value: '9', trend: '-2 closed this week' },
  { label: 'Announcements Seen', value: '92%', trend: 'via SMS + portal' },
];

const serviceMetrics = [
  { service: 'Barangay Clearance', sla: '24 hrs', completed: 86, overdue: 4 },
  { service: 'Business Permit Cert', sla: '48 hrs', completed: 33, overdue: 2 },
  { service: 'Indigency Cert', sla: '24 hrs', completed: 57, overdue: 0 },
  { service: 'Residency Cert', sla: '24 hrs', completed: 41, overdue: 1 },
];

const workloadTrend = [
  { label: 'Mon', docs: 32, blotters: 2, residents: 14 },
  { label: 'Tue', docs: 28, blotters: 1, residents: 10 },
  { label: 'Wed', docs: 35, blotters: 3, residents: 16 },
  { label: 'Thu', docs: 42, blotters: 0, residents: 11 },
  { label: 'Fri', docs: 51, blotters: 3, residents: 18 },
];

const settingGroups = [
  {
    title: 'Automation',
    fields: [
      { key: 'autoAssignCases', label: 'Auto-assign blotter cases to legal aides', type: 'toggle' },
      { key: 'autoFollowUps', label: 'Send SMS reminders for hearings', type: 'toggle' },
    ],
  },
  {
    title: 'Notifications',
    fields: [
      { key: 'notifyNewRequest', label: 'Notify me for every new document request', type: 'toggle' },
      { key: 'dailyDigest', label: 'Send 6 PM daily summary email', type: 'toggle' },
    ],
  },
  {
    title: 'Display & Access',
    fields: [
      { key: 'darkMode', label: 'Enable dark mode preview', type: 'toggle' },
      { key: 'sessionTimeout', label: 'Session timeout', type: 'select', options: ['15m', '30m', '1h'] },
    ],
  },
];
const residentRecords = [
  {
    id: 'RES-2024-001',
    summary: {
      name: 'Maria Buenaventura Dela Cruz',
      gender: 'Female',
      residentType: 'Permanent',
      zone: 'Zone 3',
      householdId: 'HH-3201',
      contact: '0917 456 7890',
    },
    sections: {
      personalInfo: [
        { label: 'Full Name', value: 'Maria Buenaventura Dela Cruz' },
        { label: 'Sex / Gender', value: 'Female' },
        { label: 'Date of Birth', value: '1986-04-12' },
        { label: 'Place of Birth', value: 'Tondo, Manila' },
        { label: 'Civil Status', value: 'Married' },
        { label: 'Nationality / Citizenship', value: 'Filipino' },
        { label: 'Resident Type', value: 'Permanent' },
        { label: 'Religion', value: 'Roman Catholic' },
      ],
      addressInfo: [
        { label: 'House / Lot / Block', value: 'Lot 12, Block 4' },
        { label: 'Street / Purok / Sitio', value: 'Purok Malinis' },
        { label: 'Zone / District', value: 'Zone 3' },
        { label: 'Barangay', value: 'Brgy. 853' },
        { label: 'Municipality / City', value: 'Manila City' },
        { label: 'Province', value: 'Metro Manila' },
        { label: 'Postal Code', value: '1005' },
      ],
      familyInfo: [
        { label: 'Household ID', value: 'HH-3201' },
        { label: 'Household Head', value: 'Juanito Dela Cruz' },
        { label: 'Relationship to Head', value: 'Spouse' },
        { label: 'Family Members Count', value: '5' },
        { label: 'Household Profile', value: 'Employed parents, tap water, stable internet' },
      ],
      contactInfo: [
        { label: 'Mobile Number', value: '0917 456 7890' },
        { label: 'Email Address', value: 'maria.delacruz@brgy853.ph' },
        { label: 'Emergency Contact Name', value: 'Juanito Dela Cruz' },
        { label: 'Emergency Contact Number', value: '0916 222 3412' },
        { label: 'Relationship to Emergency Contact', value: 'Husband' },
      ],
      identification: [
        { label: 'Government ID Type', value: 'PhilSys ID' },
        { label: 'ID Number', value: 'PH-04-1986-000123' },
        { label: 'PhilHealth Number', value: '08-123456789-0' },
        { label: 'SSS / GSIS', value: 'SSS-02-9876543' },
        { label: 'Barangay ID Number', value: 'BRGY853-2020-013' },
        { label: 'Picture', value: 'On file' },
        { label: 'Signature', value: 'Digital copy submitted' },
      ],
      education: [
        { label: 'Highest Education Attainment', value: 'Bachelor of Science in Nursing' },
        { label: 'Currently Enrolled?', value: 'No' },
        { label: 'School Name', value: 'N/A' },
      ],
      employment: [
        { label: 'Employment Status', value: 'Employed' },
        { label: 'Nature of Work', value: 'Nurse' },
        { label: 'Company / Employer', value: 'Manila General Hospital' },
        { label: 'Work Address', value: 'Taft Avenue, Manila' },
        { label: 'Monthly Income Range', value: '₱30,000 - ₱40,000' },
      ],
      residency: [
        { label: 'Year first moved to barangay', value: '2010' },
        { label: 'Original province / city', value: 'Quezon Province' },
        { label: 'Current residency type', value: 'Owner' },
        { label: 'Residency documents', value: 'Land title, latest utility bill' },
      ],
      health: [
        { label: 'PWD Status', value: 'No' },
        { label: 'Disability Type', value: 'N/A' },
        { label: 'Chronic Illnesses', value: 'Hypertension (monitored)' },
        { label: 'Pregnant / Lactating', value: 'No' },
        { label: 'Senior Citizen (60+)', value: 'No' },
        { label: 'PhilHealth Category', value: 'Private Employee' },
      ],
      legal: [
        { label: 'Registered Voter?', value: 'Yes' },
        { label: 'Voter Precinct No.', value: 'PREC-853A-102' },
        { label: 'Involved in blotter cases', value: 'No' },
      ],
      remarks: [
        { label: 'Migration history', value: 'Moved from Quezon Province in 2010' },
        { label: 'Assistance provided', value: 'Calamity relief 2020, medical support 2022' },
        { label: 'Special programs enrolled', value: 'None' },
        { label: 'Residency verification notes', value: 'Verified by Kag. Santos (Jan 2024)' },
      ],
    },
  },
  {
    id: 'RES-2024-014',
    summary: {
      name: 'Rogelio P. Villanueva',
      gender: 'Male',
      residentType: 'Temporary',
      zone: 'Zone 1',
      householdId: 'HH-1188',
      contact: '0995 771 2300',
    },
    sections: {
      personalInfo: [
        { label: 'Full Name', value: 'Rogelio Perez Villanueva' },
        { label: 'Sex / Gender', value: 'Male' },
        { label: 'Date of Birth', value: '1994-09-08' },
        { label: 'Place of Birth', value: 'Bacolod City' },
        { label: 'Civil Status', value: 'Single' },
        { label: 'Nationality / Citizenship', value: 'Filipino' },
        { label: 'Resident Type', value: 'Temporary' },
        { label: 'Religion', value: 'Iglesia ni Cristo' },
      ],
      addressInfo: [
        { label: 'House / Lot / Block', value: 'Room 3, Level 2' },
        { label: 'Street / Purok / Sitio', value: 'Sitio Riverside' },
        { label: 'Zone / District', value: 'Zone 1' },
        { label: 'Barangay', value: 'Brgy. 853' },
        { label: 'Municipality / City', value: 'Manila City' },
        { label: 'Province', value: 'Metro Manila' },
        { label: 'Postal Code', value: '1003' },
      ],
      familyInfo: [
        { label: 'Household ID', value: 'HH-1188' },
        { label: 'Household Head', value: 'Marites Abalos' },
        { label: 'Relationship to Head', value: 'Boarder' },
        { label: 'Family Members Count', value: '3' },
        { label: 'Household Profile', value: 'Shared apartment, manual water pump' },
      ],
      contactInfo: [
        { label: 'Mobile Number', value: '0995 771 2300' },
        { label: 'Email Address', value: 'rogelio.villanueva@mail.com' },
        { label: 'Emergency Contact Name', value: 'Minda Villanueva' },
        { label: 'Emergency Contact Number', value: '0908 555 1122' },
        { label: 'Relationship to Emergency Contact', value: 'Mother' },
      ],
      identification: [
        { label: 'Government ID Type', value: 'Driver’s License' },
        { label: 'ID Number', value: 'DL-NCR-944008' },
        { label: 'PhilHealth Number', value: '13-445566778-2' },
        { label: 'SSS / GSIS', value: 'SSS-08-7766554' },
        { label: 'Barangay ID Number', value: 'BRGY853-2023-221' },
        { label: 'Picture', value: 'On file' },
        { label: 'Signature', value: 'Captured during intake' },
      ],
      education: [
        { label: 'Highest Education Attainment', value: 'Senior High Graduate' },
        { label: 'Currently Enrolled?', value: 'No' },
        { label: 'School Name', value: 'N/A' },
      ],
      employment: [
        { label: 'Employment Status', value: 'Self-employed' },
        { label: 'Nature of Work', value: 'Motorcycle mechanic' },
        { label: 'Company / Employer', value: 'Freelance (home service)' },
        { label: 'Work Address', value: 'Within Brgy. 853' },
        { label: 'Monthly Income Range', value: '₱12,000 - ₱18,000' },
      ],
      residency: [
        { label: 'Year first moved to barangay', value: '2022' },
        { label: 'Original province / city', value: 'Bacolod City' },
        { label: 'Current residency type', value: 'Renting' },
        { label: 'Residency documents', value: 'Lease contract, barangay certificate' },
      ],
      health: [
        { label: 'PWD Status', value: 'No' },
        { label: 'Disability Type', value: 'N/A' },
        { label: 'Chronic Illnesses', value: 'None reported' },
        { label: 'Pregnant / Lactating', value: 'N/A' },
        { label: 'Senior Citizen (60+)', value: 'No' },
        { label: 'PhilHealth Category', value: 'Informal Economy' },
      ],
      legal: [
        { label: 'Registered Voter?', value: 'Yes' },
        { label: 'Voter Precinct No.', value: 'PREC-853B-088' },
        { label: 'Involved in blotter cases', value: 'No' },
      ],
      remarks: [
        { label: 'Migration history', value: 'Transferred for work opportunities in 2022' },
        { label: 'Assistance provided', value: 'Cash-for-work 2023' },
        { label: 'Special programs enrolled', value: 'Skills livelihood program' },
        { label: 'Residency verification notes', value: 'Temporary permit expires Dec 2024' },
      ],
    },
  },
];

const residentSections = [
  { key: 'personalInfo', title: '1. Personal Information' },
  { key: 'addressInfo', title: '2. Address Information' },
  { key: 'familyInfo', title: '3. Family / Household Information' },
  { key: 'contactInfo', title: '4. Contact Information' },
  { key: 'identification', title: '5. Identification' },
  { key: 'education', title: '6. Educational Information' },
  { key: 'employment', title: '7. Employment & Livelihood' },
  { key: 'residency', title: '8. Residency Status' },
  { key: 'health', title: '9. Health Information' },
  { key: 'legal', title: '10. Legal & Records' },
  { key: 'remarks', title: '11. Remarks / Notes' },
];

const documentSections = [
  { key: 'personalInfo', title: 'Requester Information' },
  { key: 'addressInfo', title: 'Address' },
  { key: 'requestInfo', title: 'Request Details' },
  { key: 'attachments', title: 'Attachments' },
  { key: 'verification', title: 'Processing Notes' },
];

const blotterDetailSections = [
  { key: 'incident', title: 'Incident Details' },
  { key: 'parties', title: 'Parties Involved' },
  { key: 'actions', title: 'Actions & Hearings' },
];

const blotterSections = [
  { key: 'incident', title: 'Incident Information' },
  { key: 'parties', title: 'Parties Involved' },
  { key: 'actions', title: 'Actions & Follow-up' },
];

const navigationItems = [
  {
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="12" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="18" rx="1.5" />
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'User Management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    label: 'Resident Management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="7" r="3.5" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3.5 19.5c0-2.5 1.5-5 4.5-5s4.5 2.5 4.5 5" />
        <path d="M14 19.5c0-1.8 1.2-3.5 3.5-3.5 1.4 0 2.7.8 3.5 2" />
      </svg>
    ),
  },
  {
    label: 'Document Requests',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M7 3.5h7l4 4v13H7z" />
        <path d="M14 3.5v4h4" />
        <path d="M10 12h6" />
        <path d="M10 16h6" />
      </svg>
    ),
  },
  {
    label: 'Blotter & Disputes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
        <path d="M4 8h3" />
        <path d="M17 8h3" />
      </svg>
    ),
  },
  {
    label: 'Announcements',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 10v4" />
        <path d="M6 8h6l5-3v14l-5-3H6z" />
        <path d="M10 17v3" />
      </svg>
    ),
  },
  {
    label: 'Reports & Statistics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M5 19V9" />
        <path d="M10 19V5" />
        <path d="M15 19v-7" />
        <path d="M20 19V8" />
      </svg>
    ),
  },
  {
    label: 'Audit Log',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  },
  {
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a1.5 1.5 0 0 1-2.1 2.1l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V20a1.5 1.5 0 0 1-3 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a1.5 1.5 0 1 1-2.1-2.1l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H4a1.5 1.5 0 0 1 0-3h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A1.5 1.5 0 1 1 7.4 4l.1.1a1.7 1.7 0 0 0 1.8.3H10a1.7 1.7 0 0 0 1-1.5V3a1.5 1.5 0 0 1 3 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a1.5 1.5 0 1 1 2.1 2.1l-.1.1a1.7 1.7 0 0 0-.3 1.8V10c0 .7.4 1.3 1 1.5h.2a1.5 1.5 0 0 1 0 3h-.2a1.7 1.7 0 0 0-1.5 1Z" />
      </svg>
    ),
  },
];

const profileAvatar = 'https://i.pravatar.cc/64?img=47';

// Announcement Management Component
const AnnouncementManagementSection = ({ user, authToken }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    body: '',
    category: 'announcements',
    status: 'Draft',
    priority: 'Normal',
    target_audience: '',
    published_on: '',
    expires_on: '',
    link: '',
    info: '',
    note: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [searchTerm, statusFilter]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`http://127.0.0.1:3001/api/announcements?${params}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      } else {
        setError('Failed to load announcements');
      }
    } catch (err) {
      setError('Failed to load announcements. Please try again.');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // Set default published_on to today if not set
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      summary: '',
      body: '',
      category: 'announcements',
      status: 'Published',
      priority: 'Normal',
      target_audience: '',
      published_on: today,
      expires_on: '',
      link: '',
      info: '',
      note: ''
    });
    setSelectedAnnouncement(null);
    setShowCreateModal(true);
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title || '',
      summary: announcement.summary || '',
      body: announcement.body || '',
      category: announcement.category || 'announcements',
      status: announcement.status || 'Draft',
      priority: announcement.priority || 'Normal',
      target_audience: announcement.target_audience || '',
      published_on: announcement.published_on ? announcement.published_on.split('T')[0] : '',
      expires_on: announcement.expires_on ? announcement.expires_on.split('T')[0] : '',
      link: announcement.link || '',
      info: announcement.info || '',
      note: announcement.note || ''
    });
    setSelectedAnnouncement(announcement);
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const url = selectedAnnouncement
        ? `http://127.0.0.1:3001/api/announcements/${selectedAnnouncement.id}`
        : 'http://127.0.0.1:3001/api/announcements';
      
      const method = selectedAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedAnnouncement(null);
        fetchAnnouncements();
        alert(selectedAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!');
      } else {
        setError(data.message || 'Failed to save announcement');
      }
    } catch (err) {
      setError('Failed to save announcement. Please try again.');
      console.error('Error saving announcement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:3001/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchAnnouncements();
        alert('Announcement deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete announcement');
      }
    } catch (err) {
      alert('Failed to delete announcement. Please try again.');
      console.error('Error deleting announcement:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <section className="panel announcement-module">
      <header className="panel-heading">
        <div>
          <h2>Announcements</h2>
          <p className="muted">Create and manage barangay announcements and updates.</p>
        </div>
        <button className="primary-btn compact" onClick={handleCreate}>
          + Create Announcement
        </button>
      </header>

      {error && (
        <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      <div className="announcement-filters">
        <div className="filter-field">
          <label htmlFor="announcement-search">Search announcements</label>
          <input
            id="announcement-search"
            type="search"
            placeholder="Search by title or audience"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="announcement-status">Status</label>
          <select
            id="announcement-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading announcements...</div>
      ) : (
        <div className="table" style={{ marginTop: '1.5rem' }}>
          <div className="table-row head">
            <span>Title</span>
            <span>Category</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Published</span>
            <span>Actions</span>
          </div>
          {announcements.length === 0 ? (
            <div className="table-row">
              <span colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                No announcements found. Create your first announcement!
              </span>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="table-row">
                <span>
                  <strong>{announcement.title}</strong>
                  {announcement.summary && (
                    <small style={{ display: 'block', color: '#64748b', marginTop: '0.25rem' }}>
                      {announcement.summary.substring(0, 50)}...
                    </small>
                  )}
                </span>
                <span>{announcement.category || 'announcements'}</span>
                <span>
                  <span className={`status-badge ${announcement.status === 'Published' ? 'status-approved' : announcement.status === 'Draft' ? 'status-pending' : 'status-default'}`}>
                    {announcement.status}
                  </span>
                </span>
                <span>{announcement.priority || 'Normal'}</span>
                <span>{formatDate(announcement.published_on)}</span>
                <span>
                  <button className="ghost-btn" onClick={() => handleEdit(announcement)} style={{ marginRight: '0.5rem' }}>
                    Edit
                  </button>
                  <button className="ghost-btn" onClick={() => handleDelete(announcement.id)} style={{ color: '#ef4444' }}>
                    Delete
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{selectedAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h3>
              <button className="modal-close" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Announcement title"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Summary</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Body/Content *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  placeholder="Full announcement content"
                  rows="6"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  >
                    <option value="announcements">Announcement</option>
                    <option value="services">Service</option>
                    <option value="events">Event</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  >
                    <option value="Published">Published (Visible to residents)</option>
                    <option value="Draft">Draft (Not visible to residents)</option>
                    <option value="Archived">Archived</option>
                  </select>
                  <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {formData.status === 'Published' ? '✅ This announcement will be visible to residents' : 
                     formData.status === 'Draft' ? '⚠️ This announcement will NOT be visible to residents' : 
                     'This announcement is archived'}
                  </small>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <input
                    type="text"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    placeholder="e.g. All residents, Senior citizens"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Published On</label>
                  <input
                    type="date"
                    value={formData.published_on}
                    onChange={(e) => setFormData({ ...formData, published_on: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
                <div className="form-group">
                  <label>Expires On</label>
                  <input
                    type="date"
                    value={formData.expires_on}
                    onChange={(e) => setFormData({ ...formData, expires_on: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Link (Optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Additional Info</label>
                <textarea
                  value={formData.info}
                  onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                  placeholder="Additional information"
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem', fontFamily: 'inherit' }}
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Internal notes"
                  rows="2"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem', fontFamily: 'inherit' }}
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="ghost-btn" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedAnnouncement(null); }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : (selectedAnnouncement ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

// User Management Component
const UserManagementSection = ({ user, authToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    if (user?.role !== 'admin') {
      console.log('⚠️ Cannot fetch users: User is not an admin');
      return;
    }

    if (!authToken) {
      console.log('⚠️ Cannot fetch users: No auth token');
      setError('Authentication token missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const url = `http://127.0.0.1:3001/api/auth/users?${params}`;
      console.log('📡 Fetching users from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Users loaded successfully:', data);
        setUsers(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || errorData.error || `Failed to load users (Status: ${response.status})`;
        setError(errorMsg);
        console.error('❌ Failed to load users:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to load users. Please check your connection.';
      setError(errorMsg);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && authToken) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authToken]);

  useEffect(() => {
    if (user?.role === 'admin' && authToken) {
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setSubmitting(false);
      return;
    }

    try {
      const url = 'http://127.0.0.1:3001/api/auth/create-user';
      console.log('\n📡 ===== Creating User =====');
      console.log('   URL:', url);
      console.log('   Method: POST');
      console.log('   Body:', { name: newUser.name, email: newUser.email, role: newUser.role });
      console.log('   Token:', authToken ? authToken.substring(0, 20) + '...' : 'MISSING');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      console.log('   Response status:', response.status, response.statusText);
      console.log('   Response URL:', response.url);
      console.log('=============================\n');

      let data;
      try {
        data = await response.json();
        console.log('   Response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        const text = await response.text();
        console.error('   Response text:', text);
        setError(`Server error: ${response.status} ${response.statusText}. Response: ${text.substring(0, 100)}`);
        setSubmitting(false);
        return;
      }

      if (response.ok) {
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'staff' });
        setError(''); // Clear any previous errors
        // Refresh users list immediately
        await fetchUsers();
        alert('User created successfully!');
      } else {
        // Show detailed error message
        const errorMsg = data.message || data.error || 'Failed to create user';
        setError(errorMsg);
        console.error('Create user error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to create user. Please check your connection and try again.';
      setError(errorMsg);
      console.error('Error creating user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:3001/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully!');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Failed to delete user. Please try again.');
      console.error('Error deleting user:', err);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <section className="panel">
        <header className="panel-heading">
          <div>
            <h2>Access Denied</h2>
            <p className="muted">Only administrators can access user management.</p>
          </div>
        </header>
      </section>
    );
  }

  return (
    <section className="panel">
      <header className="panel-heading">
        <div>
          <h2>User Management</h2>
          <p className="muted">Create and manage staff accounts and administrators.</p>
        </div>
        <button 
          className="primary-btn compact" 
          onClick={() => setShowCreateModal(true)}
        >
          + Create User
        </button>
      </header>

      {error && (
        <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
          {error}
        </div>
      )}

      <div className="resident-filters" style={{ marginTop: '1.5rem' }}>
        <div className="filter-field">
          <label htmlFor="user-search">Search users</label>
          <input
            id="user-search"
            type="search"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-field">
          <label htmlFor="role-filter">Role</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="resident">Resident</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
      ) : (
        <div className="table" style={{ marginTop: '1.5rem' }}>
          <div className="table-row head">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Created</span>
            <span>Action</span>
          </div>
          {users.length === 0 ? (
            <div className="table-row">
              <span colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                {searchTerm || roleFilter !== 'all' ? 'No users found matching your filters' : 'No users found. Create your first user!'}
              </span>
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="table-row">
                <span>{u.name}</span>
                <span>{u.email}</span>
                <span>
                  <span className={`status-badge ${u.role === 'admin' ? 'status-approved' : u.role === 'staff' ? 'status-pending' : 'status-default'}`}>
                    {u.role}
                  </span>
                </span>
                <span>{new Date(u.created_at).toLocaleDateString()}</span>
                <span>
                  {u.id !== user.id && (
                    <button 
                      className="ghost-btn" 
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ color: '#ef4444' }}
                    >
                      Delete
                    </button>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setError(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="modal-close" onClick={() => { setShowCreateModal(false); setError(''); }} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}>×</button>
            </div>
            {error && (
              <div className="error-message" style={{ margin: '1rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                  placeholder="Full name"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  placeholder="user@example.com"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d5d8f0', borderRadius: '0.5rem' }}
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="resident">Resident</option>
                </select>
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="ghost-btn" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const defaultSettings = {
  autoAssignCases: true,
  autoFollowUps: true,
  notifyNewRequest: true,
  dailyDigest: false,
  darkMode: false,
  sessionTimeout: '30m',
};

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [activeNav, setActiveNav] = useState('Dashboard');

  const handleLogin = (userData, token) => {
    setUser(userData);
    setAuthToken(token);
    setIsAuthenticated(true);
    // Set last activity on login
    localStorage.setItem('last_activity', Date.now().toString());
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docStatusFilter, setDocStatusFilter] = useState('all');
  const [announcementSearchTerm, setAnnouncementSearchTerm] = useState('');
  const [announcementStatusFilter, setAnnouncementStatusFilter] = useState('all');
  const [blotterSearchTerm, setBlotterSearchTerm] = useState('');
  const [blotterStatusFilter, setBlotterStatusFilter] = useState('all');
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedBlotter, setSelectedBlotter] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [settings, setSettings] = useState(defaultSettings);

  // Handle session timeout
  const handleSessionTimeout = () => {
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    // Redirect to home page
    window.location.href = '/';
  };

  // Use session timeout hook
  useSessionTimeout(handleSessionTimeout);

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setAuthToken(token);
        setIsAuthenticated(true);
        // Set last activity on mount if session is valid
        localStorage.setItem('last_activity', Date.now().toString());
      } catch (e) {
        // Invalid user data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('last_activity');
      }
    }
  }, []);


  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('http://127.0.0.1:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
      setUser(null);
      setAuthToken(null);
      setIsAuthenticated(false);
    }
  };

  const filteredResidents = useMemo(() => {
    return residentRecords.filter((resident) => {
      const matchesSearch =
        resident.summary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.summary.householdId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesZone =
        zoneFilter === 'all' || resident.summary.zone.toLowerCase() === zoneFilter.toLowerCase();

      return matchesSearch && matchesZone;
    });
  }, [searchTerm, zoneFilter]);

  const zoneOptions = useMemo(() => {
    const zones = new Set(residentRecords.map((res) => res.summary.zone));
    return Array.from(zones);
  }, []);

  const filteredDocumentRequests = useMemo(() => {
    return documentRequests.filter((request) => {
      const matchesSearch =
        request.requester.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(docSearchTerm.toLowerCase());
      const matchesStatus =
        docStatusFilter === 'all' || request.status.toLowerCase() === docStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [docSearchTerm, docStatusFilter]);

  const docStatusOptions = useMemo(() => {
    const statuses = new Set(documentRequests.map((req) => req.status));
    return Array.from(statuses);
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(announcementSearchTerm.toLowerCase()) ||
        announcement.target.toLowerCase().includes(announcementSearchTerm.toLowerCase());

      const matchesStatus =
        announcementStatusFilter === 'all' ||
        announcement.status.toLowerCase() === announcementStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [announcementSearchTerm, announcementStatusFilter]);

  const announcementStatusOptions = useMemo(() => {
    const statuses = new Set(announcements.map((announcement) => announcement.status));
    return Array.from(statuses);
  }, []);

  const filteredBlotterCases = useMemo(() => {
    return blotterCases.filter((caseItem) => {
      const matchesSearch =
        caseItem.caseTitle.toLowerCase().includes(blotterSearchTerm.toLowerCase()) ||
        caseItem.id.toLowerCase().includes(blotterSearchTerm.toLowerCase()) ||
        caseItem.complainant.toLowerCase().includes(blotterSearchTerm.toLowerCase());

      const matchesStatus =
        blotterStatusFilter === 'all' ||
        caseItem.status.toLowerCase() === blotterStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [blotterSearchTerm, blotterStatusFilter]);

  const blotterStatusOptions = useMemo(() => {
    const statuses = new Set(blotterCases.map((caseItem) => caseItem.status));
    return Array.from(statuses);
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const residentStats = useMemo(() => {
    const permanent = residentRecords.filter(
      (res) => res.summary.residentType === 'Permanent'
    ).length;
    const temporary = residentRecords.filter(
      (res) => res.summary.residentType === 'Temporary'
    ).length;
    const senior = residentRecords.filter((res) =>
      res.sections.health?.some(
        (field) => field.label === 'Senior Citizen (60+)' && field.value === 'Yes'
      )
    ).length;

    return [
      { label: 'Residents on file', value: residentRecords.length },
      { label: 'Permanent residents', value: permanent },
      { label: 'Temporary residents', value: temporary },
      { label: 'Senior citizens flagged', value: senior },
    ];
  }, []);

  const blotterStats = useMemo(() => {
    const highPriority = blotterCases.filter((caseItem) => caseItem.priority === 'High').length;
    const scheduled = blotterCases.filter((caseItem) => Boolean(caseItem.schedule)).length;
    const mediation = blotterCases.filter((caseItem) =>
      caseItem.status.toLowerCase().includes('mediation')
    ).length;
    const investigators = new Set(blotterCases.map((caseItem) => caseItem.investigator)).size;

    return [
      { label: 'Open cases', value: blotterCases.length },
      { label: 'High priority', value: highPriority },
      { label: 'Hearings scheduled', value: scheduled },
      { label: 'Investigators assigned', value: investigators },
      { label: 'For mediation', value: mediation },
    ];
  }, []);

  const announcementStats = useMemo(() => {
    const published = announcements.filter((item) => item.status === 'Published').length;
    const drafts = announcements.filter((item) => item.status === 'Draft').length;
    const expiringSoon = announcements.filter((item) => {
      const expires = new Date(item.expiresOn);
      if (Number.isNaN(expires)) {
        return false;
      }
      const diffInDays = (expires - new Date()) / (1000 * 60 * 60 * 24);
      return diffInDays <= 7;
    }).length;

    return [
      { label: 'Published updates', value: published },
      { label: 'Drafts in progress', value: drafts },
      { label: 'Expiring in 7 days', value: expiringSoon },
    ];
  }, []);

  const workloadMax = useMemo(() => {
    return Math.max(
      ...workloadTrend.map((item) => item.docs + item.blotters + item.residents),
      1
    );
  }, []);

  // Dashboard component (protected route)
  const DashboardContent = () => {
    const navigate = useNavigate();
    
    const handleLogoutWithNavigate = async () => {
      await handleLogout();
      navigate('/');
    };
    
    return (
      <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logoBrgy} alt="Brgy. 853 Zone 93" className="sidebar-logo" />
          <div>
            <p className="barangay-name">Brgy. 853 Zone 93</p>
            <p className="barangay-motto">Tulong-Tulong Sama-Sama</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Navigation</p>
          <ul>
            {navigationItems.map((item) => (
              <li
                key={item.label}
                className={item.label === activeNav ? 'active' : ''}
                onClick={() => setActiveNav(item.label)}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="top-bar">
          <div className="search-box top-search">
            <input type="search" placeholder="Search residents, blotters, etc." />
          </div>
          <div className="header-tools">
            <button className="icon-btn" aria-label="Notifications">
              🔔
              <span className="badge-count">2</span>
            </button>
            <div className="profile-chip">
              <img
                src={profileAvatar}
                alt={user?.name || 'User'}
                className="avatar-img"
                loading="lazy"
              />
              <div>
                <p className="name">{user?.name || 'User'}</p>
                <p className="role">{user?.role || 'Staff'}</p>
              </div>
              <button 
                className="logout-btn" 
                onClick={handleLogoutWithNavigate}
                title="Logout"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {activeNav === 'Dashboard' && (
          <DashboardOverviewSection authToken={authToken} />
        )}

        {activeNav === 'Document Requests' && (
          <DocumentRequestsSection authToken={authToken} />
        )}

        {activeNav === 'Blotter & Disputes' && (
          <BlotterManagementSection authToken={authToken} />
        )}

        {activeNav === 'Announcements' && (
          <AnnouncementManagementSection user={user} authToken={authToken} />
        )}

        {activeNav === 'Reports & Statistics' && (
          <StatisticsSection authToken={authToken} />
        )}

        {activeNav === 'Audit Log' && (
          <AuditLogSection authToken={authToken} />
        )}

        {activeNav === 'Settings' && (
          <section className="panel settings-module">
            <header className="panel-heading">
              <div>
                <h2>System Settings</h2>
                <p className="muted">Fine-tune automation, notifications, and display preferences.</p>
              </div>
            </header>

            <div className="settings-grid">
              {settingGroups.map((group) => (
                <article key={group.title} className="setting-card">
                  <h3>{group.title}</h3>
                  <div className="setting-fields">
                    {group.fields.map((field) => (
                      <label key={field.key} className="setting-field">
                        <span>{field.label}</span>
                        {field.type === 'toggle' ? (
                          <input
                            type="checkbox"
                            checked={Boolean(settings[field.key])}
                            onChange={(event) => updateSetting(field.key, event.target.checked)}
                          />
                        ) : (
                          <select
                            value={settings[field.key]}
                            onChange={(event) => updateSetting(field.key, event.target.value)}
                          >
                            {field.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </label>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeNav === 'User Management' && (
          <UserManagementSection user={user} authToken={authToken} />
        )}

        {activeNav === 'Resident Management' && (
          <ResidentManagementSection authToken={authToken} />
        )}
      </main>

      {selectedResident && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <header className="modal-header">
              <div>
                <p className="system-label">Resident Profile</p>
                <h3>{selectedResident.summary.name}</h3>
                <p className="muted">
                  {selectedResident.summary.residentType} &bull; {selectedResident.summary.zone} &bull;{' '}
                  {selectedResident.summary.householdId}
                </p>
              </div>
              <button className="icon-btn close" onClick={() => setSelectedResident(null)}>
                ✕
              </button>
      </header>

            <div className="modal-body">
              {residentSections.map((section) => {
                const fields = selectedResident.sections[section.key];
                if (!fields?.length) {
                  return null;
                }

                return (
                  <section key={section.key} className="detail-section">
                    <h4>{section.title}</h4>
                    <div className="detail-grid">
                      {fields.map((field) => (
                        <div key={field.label}>
                          <p className="field-label">{field.label}</p>
                          <p className="field-value">{field.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <header className="modal-header">
              <div>
                <p className="system-label">Document Request</p>
                <h3>{selectedRequest.requester}</h3>
                <p className="muted">
                  {selectedRequest.type} &bull; {selectedRequest.id} &bull;{' '}
                  {selectedRequest.status}
                </p>
              </div>
              <button className="icon-btn close" onClick={() => setSelectedRequest(null)}>
                ✕
              </button>
            </header>

            <div className="modal-body">
              {documentSections.map((section) => {
                const fields = selectedRequest.details[section.key];
                if (!fields?.length) {
                  return null;
                }

                return (
                  <section key={section.key} className="detail-section">
                    <h4>{section.title}</h4>
                    <div className="detail-grid">
                      {fields.map((field) => (
                        <div key={field.label}>
                          <p className="field-label">{field.label}</p>
                          <p className="field-value">{field.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedBlotter && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <header className="modal-header">
              <div>
                <p className="system-label">Blotter Case</p>
                <h3>{selectedBlotter.caseTitle}</h3>
                <p className="muted">
                  {selectedBlotter.id} &bull; {selectedBlotter.category} &bull; {selectedBlotter.status}
                </p>
              </div>
              <button className="icon-btn close" onClick={() => setSelectedBlotter(null)}>
                ✕
              </button>
            </header>

            <div className="modal-body">
              <section className="detail-section">
                <h4>Quick Facts</h4>
                <div className="detail-grid">
                  <div>
                    <p className="field-label">Complainant</p>
                    <p className="field-value">{selectedBlotter.complainant}</p>
                  </div>
                  <div>
                    <p className="field-label">Respondent</p>
                    <p className="field-value">{selectedBlotter.respondent}</p>
                  </div>
                  <div>
                    <p className="field-label">Investigator</p>
                    <p className="field-value">{selectedBlotter.investigator}</p>
                  </div>
                  <div>
                    <p className="field-label">Next schedule</p>
                    <p className="field-value">{selectedBlotter.schedule}</p>
                  </div>
                </div>
              </section>

              {blotterDetailSections.map((section) => {
                const fields = selectedBlotter.details[section.key];
                if (!fields?.length) {
                  return null;
                }

                return (
                  <section key={section.key} className="detail-section">
                    <h4>{section.title}</h4>
                    <div className="detail-grid">
                      {fields.map((field) => (
                        <div key={field.label}>
                          <p className="field-label">{field.label}</p>
                          <p className="field-value">{field.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedAnnouncement && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <header className="modal-header">
              <div>
                <p className="system-label">Announcement</p>
                <h3>{selectedAnnouncement.title}</h3>
                <p className="muted">
                  {selectedAnnouncement.status} &bull; {selectedAnnouncement.priority} priority
                </p>
              </div>
              <button className="icon-btn close" onClick={() => setSelectedAnnouncement(null)}>
                ✕
              </button>
            </header>

            <div className="modal-body announcement-detail">
              <p className="announcement-body">{selectedAnnouncement.body}</p>

              <div className="detail-grid">
                <div>
                  <p className="field-label">Audience</p>
                  <p className="field-value">{selectedAnnouncement.target}</p>
                </div>
                <div>
                  <p className="field-label">Posted by</p>
                  <p className="field-value">{selectedAnnouncement.postedBy}</p>
                </div>
                <div>
                  <p className="field-label">Effective</p>
                  <p className="field-value">
                    {selectedAnnouncement.publishedOn} &ndash; {selectedAnnouncement.expiresOn}
                  </p>
                </div>
              </div>

              <section className="detail-section">
                <h4>Action Items</h4>
                <ul className="action-list">
                  {selectedAnnouncement.actionItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage user={user} onLogout={handleLogout} />} />
        <Route path="/about" element={<About />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/report" element={<Report />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              user?.role === 'resident' ? (
                <Navigate to="/resident-dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              user?.role === 'resident' ? (
                <Navigate to="/resident-dashboard" replace />
              ) : (
                <DashboardContent />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/resident-dashboard" 
          element={
            isAuthenticated ? (
              user?.role === 'resident' ? (
                <ResidentDashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <UserProfile user={user} onUserUpdate={(updatedUser) => {
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
    </BrowserRouter>
  );
}

function App() {
  return <AppContent />;
}

export default App;
