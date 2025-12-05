# System Architecture

**Project:** Nexlog  
**Purpose:** Collect security logs from different sources and show them in one place

---

## What This System Does

Nexlog is a log management system that:

1. Receives security logs from different sources (firewalls, cloud services, APIs)
2. Saves all logs in one database
3. Shows logs on a dashboard with charts
4. Sends alerts when it finds security problems
5. Lets different companies use the same system (each company only sees their own data)

---

## System Diagram

[Nexlog System Architecture](docs/Log Management System Architecture Diagram.png)

---

## How It Works

### Step 1: Logs Come In

Logs can arrive in two ways:

**Way 1: HTTP API**
- Systems send logs directly via internet
- Used for: Firewall logs, network logs, API logs
- Happens in real-time

**Way 2: File Upload**
- Users upload JSON or CSV files through the website
- Used for: AWS logs, Microsoft 365 logs, Active Directory logs
- Happens in batches

### Step 2: Make All Logs Look the Same

Different systems use different field names:
- Firewall says: `src`
- AWS says: `sourceIPAddress`
- Microsoft 365 says: `ClientIP`

We convert all of them to one standard format:
```
src_ip: "192.168.1.100"
```

This makes searching much easier.

### Step 3: Save to Database

All logs go into MongoDB database with:
- ID number (1, 2, 3...)
- Timestamp (when it happened)
- Company ID (which company owns this log)
- All the log data

### Step 4: Check for Security Problems

After saving each log, the system checks:

**Rule 1: Multiple Failed Logins**
- Did someone fail to login 3 times from the same IP?
- If yes, create an alert

**Rule 2: Distributed Attack**
- Did 3 different IPs try to attack the same user?
- If yes, create an alert

**Auto-Fix:**
- If the user successfully logs in, close all their alerts

### Step 5: Show to Users

Users open the website and see:
- **Dashboard:** Charts showing top IPs, users, and events
- **Search:** Find specific logs
- **Alerts:** See security warnings
- **User Activity:** Track what one user did

---

## Technology Used

| What | Why |
|------|-----|
| **Node.js** | Runs the backend server |
| **Express** | Makes building APIs easy |
| **MongoDB** | Database for storing logs |
| **React** | Makes the website interface |
| **TypeScript** | JavaScript with error checking |

---

## Multi-Company Setup

Problem: Multiple companies use the same system. Company A should not see Company B's logs.

Solution: Every log has a company ID (called `tenantId`)

Example:
```javascript
{
  id: 123,
  tenantId: 5,        // Company ID
  user: "alice@company.com",
  event_type: "login_failed"
}
```

When a user searches:
```javascript
// Only show logs from their company
find({ tenantId: 5 })
```

This keeps all company data separate.

---

## User Roles

### Super Admin
- Can see all companies
- Can view dashboards and alerts
- Cannot change alerts (companies manage their own)

### Viewer
- Can only see their own company data
- Can search logs
- Can create and update alerts
- Cannot see other companies

---

## Alert System

### How Alerts Work

1. New log arrives
2. System checks the log against rules
3. If rule matches, create or update alert
4. Users see alert on Alerts page

### Alert Rules

**Rule 1: Multiple Failed Logins**
- What: 3+ failed logins from same IP in 5 minutes
- Why: Someone is trying to guess passwords
- Action: Create alert

**Rule 2: Distributed Attack**
- What: 3+ different IPs attack same user in 10 minutes
- Why: Coordinated attack from multiple locations
- Action: Create alert with list of attacking IPs

**Auto-Resolve:**
- When: User successfully logs in
- Action: Close all open alerts for that user

---

## Database Structure

The database has 4 collections (like tables):

### 1. users
Stores user accounts
```
{
  id: 1,
  email: "alice@company.com",
  password: "hashed",
  role: "viewer",
  tenantId: 5
}
```

### 2. tenants
Stores companies
```
{
  id: 5,
  name: "Acme Corporation"
}
```

### 3. logevents
Stores all logs
```
{
  id: 123,
  tenantId: 5,
  timestamp: "2024-12-05T10:30:00Z",
  source: "firewall",
  event_type: "login_failed",
  user: "alice@company.com",
  src_ip: "192.168.1.100"
}
```

### 4. alerts
Stores security alerts
```
{
  id: 10,
  tenantId: 5,
  ruleName: "Multiple Failed Login Attempts",
  user: "alice@company.com",
  ip: "192.168.1.100",
  count: 5,
  status: "OPEN"
}
```

---

## Security Features

### 1. Password Protection
- Passwords are hashed (scrambled)
- Cannot be reversed to original password
- Uses bcrypt algorithm

### 2. Login Tokens
- When you login, you get a token (like a ticket)
- Token is included in every request
- Token expires after 7 days
- Cannot be faked without secret key

### 3. HTTPS
- All data encrypted in transit
- Free SSL certificates
- Automatic on Render and Vercel

### 4. Company Isolation
- Every query filters by company ID
- Enforced at database level
- Impossible to see other company data

---

## API Endpoints

**Login:**
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/signup` - Create new account

**Logs:**
- `POST /api/ingest/http` - Send single log
- `POST /api/ingest/batch` - Send multiple logs
- `GET /api/logs/search` - Search logs

**Dashboard:**
- `GET /api/dashboard` - Get stats and charts

**Alerts:**
- `GET /api/alerts` - Get alerts
- `PATCH /api/alerts/:id` - Update alert status

All endpoints (except login/signup) need a token in the header.

---

## Deployment

### Local (Development)
- Frontend: http://localhost:5174
- Backend: http://localhost:5004
- Database: MongoDB Atlas (cloud)

### Production (SaaS)
- Frontend: Vercel (free hosting)
- Backend: Render (free hosting)  
- Database: MongoDB Atlas (cloud)

All deployed automatically from GitHub.

---

## Summary

Nexlog is a log management system that:

- Collects logs from 7 different sources
- Normalizes them to one format
- Saves in MongoDB database
- Detects security problems with 2 alert rules
- Shows data on a web dashboard
- Keeps each company's data separate
- Works for multiple companies at the same time

Built with:
- Backend: Node.js + Express + MongoDB
- Frontend: React + TypeScript
- Security: JWT tokens + bcrypt + HTTPS

Simple, secure, and easy to use.
