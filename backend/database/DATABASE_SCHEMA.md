# Database Schema Documentation

This document describes the complete database schema for the Barangay Management System, designed to support all frontend requirements.

## Database: `brgy_data`

---

## Table: `users`
System users (admin/staff accounts)

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | string | User full name |
| email | string(255) | Email address (unique) |
| email_verified_at | timestamp | Email verification timestamp |
| password | string | Hashed password |
| role | string | User role (admin, staff) |
| remember_token | string(100) | Remember me token |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `email` (unique)

---

## Table: `announcements`
Public announcements, services, and events displayed on frontend

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| reference_no | string(255) | Unique reference number (ANN-2024-001) |
| title | string | Announcement title |
| summary | text | Short summary/description |
| body | longText | Full content |
| **items** | json | Array of service items (for services) |
| **info** | text | Additional info (time, location, etc.) |
| **note** | text | Notes/reminders |
| **link** | string | Link to related page |
| **highlights** | json | Event highlights array |
| **schedule** | json | Schedule data (for events) |
| category | string | Category: 'services', 'announcements', 'events' |
| priority | string | Priority: 'High', 'Normal', 'Low' |
| status | string | Status: 'Draft', 'Published', 'Archived' |
| target_audience | string | Target audience (All households, Seniors, etc.) |
| posted_by | string | Name of person who posted |
| published_on | date | Publication date |
| expires_on | date | Expiration date (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `reference_no` (unique)
- `status`
- `published_on`
- `category`

**Frontend Usage:**
- Displayed on `/announcements` page
- Filtered by category (services, announcements, events)
- Shows only published announcements that haven't expired

---

## Table: `blotter_cases`
Incident reports submitted from frontend `/report` page

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| case_no | string(255) | Unique case number (BR-2024-001) |
| case_title | string | Case title |
| category | string | Incident type |
| status | string | Status: 'Pending', 'Under Investigation', etc. |
| priority | string | Priority: 'Low', 'Medium', 'High' |
| schedule_datetime | datetime | Scheduled meeting/hearing |
| schedule_location | string | Location for scheduled meeting |
| investigator_name | string | Assigned investigator |
| location | string | Incident location |
| summary | text | Brief summary (max 255 chars) |
| **description** | text | Full incident description |
| date_reported | datetime | When report was submitted |
| **incident_date** | date | Date when incident occurred |
| **incident_time** | time | Time when incident occurred |
| **reporter_name** | string | Reporter's name |
| **reporter_contact** | string | Reporter's contact number |
| **reporter_email** | string | Reporter's email (nullable) |
| **reporter_address** | text | Reporter's address |
| **persons_involved** | text | Names of persons involved |
| **witnesses** | text | Names of witnesses |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `case_no` (unique)
- `status`
- `date_reported`

**Frontend Usage:**
- Form data from `/report` page is saved here
- Reference number (case_no) is returned to user

---

## Table: `document_requests`
Document requests submitted from frontend `/documents` page

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| reference_no | string(255) | Unique reference number (DOC-2024-001) |
| resident_id | bigint | Foreign key to residents (nullable) |
| requester_name | string | Requester's full name |
| contact_number | string | Contact number |
| **email** | string | Email address (nullable) |
| **address** | text | Requester's address |
| document_type | string | Type of document requested |
| purpose | string | Purpose of request |
| intended_recipient | string | Who will receive the document |
| status | string | Status: 'Pending', 'Review', 'Approved', 'Released', 'Rejected' |
| date_filed | date | Date request was filed |
| receiving_staff | string | Staff who received the request |
| remarks | text | Admin remarks |
| **additional_info** | text | Additional information from requester |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `reference_no` (unique)
- `resident_id` (foreign key)
- `status`
- `date_filed`

**Frontend Usage:**
- Form data from document request is saved here
- Reference number is returned to user

---

## Table: `contacts`
Contact form submissions from frontend `/about` page

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | string | Contact's name |
| email | string | Email address |
| phone | string | Phone number (nullable) |
| subject | string | Message subject |
| message | text | Message content |
| status | enum | Status: 'new', 'read', 'replied', 'archived' |
| admin_notes | text | Admin notes (nullable) |
| read_at | timestamp | When message was read (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `status`
- `created_at`

**Frontend Usage:**
- Contact form data from `/about` page is saved here

---

## Table: `residents`
Resident records (admin dashboard)

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| household_id | bigint | Foreign key to households |
| first_name | string | First name |
| middle_name | string | Middle name (nullable) |
| last_name | string | Last name |
| suffix | string | Name suffix (nullable) |
| date_of_birth | date | Date of birth |
| gender | string | Gender |
| civil_status | string | Civil status |
| occupation | string | Occupation (nullable) |
| contact_number | string | Contact number |
| email | string | Email (nullable) |
| zone | string | Zone number |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `household_id` (foreign key)
- `zone`

---

## Table: `households`
Household records (admin dashboard)

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| household_no | string(255) | Unique household number |
| address | text | Full address |
| zone | string | Zone number |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `household_no` (unique)
- `zone`

---

## Table: `blotter_parties`
Parties involved in blotter cases

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| blotter_case_id | bigint | Foreign key to blotter_cases |
| role | string | Role: 'Complainant', 'Respondent', 'Witness' |
| name | string | Party name |
| contact | string | Contact number (nullable) |
| resident_id | bigint | Foreign key to residents (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `blotter_case_id` (foreign key)
- `resident_id` (foreign key)

---

## Table: `blotter_actions`
Actions taken on blotter cases

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| blotter_case_id | bigint | Foreign key to blotter_cases |
| action_label | string | Action label |
| action_details | text | Action details |
| next_hearing_datetime | datetime | Next hearing date/time |
| required_documents | text | Required documents |
| recorded_by | string | Staff who recorded |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `blotter_case_id` (foreign key)

---

## Table: `document_request_attachments`
Attachments for document requests

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| document_request_id | bigint | Foreign key to document_requests |
| label | string | Attachment label |
| value | string | File path or description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `document_request_id` (foreign key)

---

## Table: `announcement_action_items`
Action items for announcements

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| announcement_id | bigint | Foreign key to announcements |
| description | string | Action item description |
| is_completed | boolean | Completion status |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `announcement_id` (foreign key)

---

## Table: `activity_logs`
System activity logs

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| action | string | Action performed |
| description | text | Action description |
| details | json | Additional details |
| user_id | bigint | User who performed action (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `user_id` (foreign key)
- `created_at`

---

## Table: `personal_access_tokens`
Laravel Sanctum tokens for API authentication

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| tokenable_type | string | Model type |
| tokenable_id | bigint | Model ID |
| name | string | Token name |
| token | string | Hashed token |
| abilities | text | Token abilities |
| last_used_at | timestamp | Last usage timestamp |
| expires_at | timestamp | Expiration timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `tokenable_type`, `tokenable_id`
- `token` (unique)

---

## Frontend Data Requirements Mapping

### Announcements Page (`/announcements`)
- **Source**: `announcements` table
- **Fields Used**: id, title, summary, body, category, published_on, expires_on, items, info, note, link, highlights, schedule
- **Filter**: status='Published', published_on <= now(), expires_on >= now() OR expires_on IS NULL

### Documents Page (`/documents`)
- **Source**: `document_requests` table (for requests)
- **API Endpoint**: `/api/public/documents` (returns static document types)
- **Fields Used**: requester_name, email, address, document_type, purpose, contact_number, additional_info

### Report Page (`/report`)
- **Source**: `blotter_cases` table
- **Fields Used**: All reporter and incident fields
- **Returns**: case_no as reference number

### About Page (`/about`)
- **Source**: `contacts` table
- **Fields Used**: name, email, phone, subject, message

---

## Relationships

```
users
  └── (one-to-many) activity_logs

households
  └── (one-to-many) residents

residents
  ├── (belongs-to) households
  ├── (one-to-many) document_requests
  └── (one-to-many) blotter_parties

announcements
  └── (one-to-many) announcement_action_items

blotter_cases
  ├── (one-to-many) blotter_parties
  └── (one-to-many) blotter_actions

document_requests
  ├── (belongs-to) residents (nullable)
  └── (one-to-many) document_request_attachments
```

---

## Migration Order

1. `create_users_table`
2. `create_households_table`
3. `create_residents_table`
4. `create_document_requests_tables`
5. `create_blotter_tables`
6. `create_announcements_tables`
7. `create_activity_logs_table`
8. `create_personal_access_tokens_table`
9. `add_public_fields_to_blotter_cases`
10. `add_public_fields_to_document_requests`
11. `add_category_to_announcements`
12. `create_contacts_table` ⭐ NEW
13. `add_frontend_fields_to_announcements` ⭐ NEW

---

## Notes

- All tables use `utf8mb4` character set for full Unicode support
- Timestamps are in UTC
- Foreign keys use `cascadeOnDelete` or `nullOnDelete` as appropriate
- Reference numbers are auto-generated with format: `PREFIX-YEAR-NUMBER`
- JSON columns are used for flexible data structures (items, highlights, schedule)

