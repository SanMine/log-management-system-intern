# Nexlog

Next-Generation Log Management and Security Intelligence Platform

A log management system that collects security logs from multiple sources, detects threats, and shows them on a dashboard.

---

## What It Does

- Collects logs from 7 different sources (APIs, firewalls, cloud services)
- Stores all logs in one database
- Detects security threats automatically
- Shows data on charts and dashboards
- Supports multiple companies (each sees only their own data)

---

## Features

**Authentication**
- Super Admin: Can see all companies
- Viewer: Can see only their company data
- Secure login with JWT tokens

**Log Sources**
- API, Firewall, Network
- CrowdStrike, AWS CloudTrail
- Microsoft 365, Active Directory

**Alerts**
- Detects multiple failed login attempts
- Detects distributed attacks
- Auto-resolves when user logs in successfully

**Dashboard**
- Real-time charts
- Search logs by user, IP, time
- Track user activity

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB, TypeScript  
**Frontend:** React, TypeScript, Tailwind CSS  
**Security:** JWT, bcrypt, HTTPS

---

## Quick Start

**Prerequisites:**
- Node.js 18+
- MongoDB Atlas account (free)
- Git

**Option 1: Docker (Easiest)**
```bash
docker-compose up -d
```
Then open **http://localhost:5174**

**Option 2: Manual Script**
```bash
./run.sh
```
The script will install dependencies and start servers.

**Option 3: Manual Setup**

**Login:**
- Email: `superadmin@gmail.com`
- Password: `super12345`

---

## Manual Setup

If `run.sh` doesn't work:

**1. Backend:**
```bash
cd backend
npm install
```

Create `.env` file:
```
MONGO_URI=mongodb+srv://your-connection-string/nexlog
JWT_SECRET=your-secret-key
PORT=5004
FRONTEND_URL=http://localhost:5174
```

```bash
npm run seed:admin
npm run dev
```

**2. Frontend:**
```bash
cd frontend
npm install
```

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:5004/api
```

```bash
npm run dev
```

---

## Usage

**Create Account:**
1. Click "Sign up" on login page
2. Enter email, password, organization name
3. Login with your credentials

**Upload Logs:**
1. Login to dashboard
2. Click "Upload JSON" button
3. Select file from `/samples` folder

**Search Logs:**
1. Go to User Activity page
2. Select user and time range
3. Enter search term

**View Alerts:**
1. Go to Alerts page
2. See detected threats
3. Update status: OPEN → INVESTIGATING → RESOLVED

---

## API Endpoints

**Authentication:**
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Create account

**Logs:**
- `POST /api/ingest/http` - Send single log
- `POST /api/ingest/batch` - Send multiple logs
- `GET /api/logs/search` - Search logs

**Alerts:**
- `GET /api/alerts` - Get alerts
- `PATCH /api/alerts/:id` - Update alert

**Dashboard:**
- `GET /api/dashboard` - Get stats

All endpoints (except login/signup) require JWT token.

---

## Project Structure

```
nexlog/
├── backend/          # API server
├── frontend/         # Web interface
├── samples/          # Example log files
├── tests/            # Test cases
└── docs/             # Documentation
```

---

## Alert Rules

**Rule 1: Multiple Failed Logins**
- Triggers when: 3+ failed logins from same IP in 5 minutes
- Purpose: Detect brute force attacks

**Rule 2: Distributed Attack**
- Triggers when: 3+ different IPs attack same user in 10 minutes
- Purpose: Detect coordinated attacks

**Auto-Resolve:**
- When user successfully logs in, all alerts close automatically

---

## Supported Log Sources

1. **API Logs** - REST API events
2. **Firewall** - Network security logs
3. **Network** - Traffic logs
4. **CrowdStrike** - Endpoint security
5. **AWS CloudTrail** - Cloud activity
6. **Microsoft 365** - Office events
7. **Active Directory** - User authentication

---

## Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- HTTPS in production (Render + Vercel)
- Multi-tenant data isolation
- All database queries filtered by company ID

---

## Deployment

**Local Development:**
- Backend: http://localhost:5004
- Frontend: http://localhost:5174

**Production (SaaS):**
- Backend: Deploy to Render
- Frontend: Deploy to Vercel
- Database: MongoDB Atlas

See `/docs/setup_saas.md` for deployment guide.

---

## Documentation

- `/docs/architecture.md` - System design
- `/docs/setup_appliance.md` - Local setup
- `/docs/setup_saas.md` - Cloud deployment

---

## Sample Files

Located in `/samples`:
- `test-api-logs.json` - API log examples
- `test-firewall-logs.json` - Firewall logs
- `batch-logs-sample.json` - Multiple logs
- `send_logs.sh` - Script to send test logs

---

## Testing

Send test logs:
```bash
./samples/send_logs.sh
```

This will:
- Send 8 different log types
- Trigger alert (4 failed logins)
- Show on dashboard

---

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:5004 | xargs kill -9
lsof -ti:5174 | xargs kill -9
```

**Cannot login:**
```bash
cd backend
npm run seed:admin
```

**Database connection failed:**
- Check MongoDB Atlas connection string
- Verify IP whitelist includes `0.0.0.0/0`

---

## License

This project is for educational purposes.
