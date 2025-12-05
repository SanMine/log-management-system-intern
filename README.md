# Nexlog

**Next-Generation Log Management & Security Intelligence Platform**

A comprehensive real-time log management and analysis platform with advanced SIEM capabilities, role-based access control, and intelligent alert detection.

## Features

### 🔒 Authentication & RBAC
- **Super Admin**: Full system access, view all tenants, read-only alert monitoring
- **Viewer**: Tenant-specific access, alert management, log analysis
- JWT-based authentication with bcrypt password hashing
- Protected routes with role-based permissions

### 📊 Log Management
- **Multi-source ingestion**: API, Firewall, Network, CrowdStrike, AWS, M365, Active Directory
- **Batch upload**: JSON and CSV file support
- **Real-time processing**: Automatic normalization to central schema
- **Advanced search**: Full-text search across all log fields with pagination
- **Auto-incrementing IDs**: Collision-free log identification

### 🚨 Intelligent Alerting
- **Rule 1**: Multiple failed login attempts (≥3 from same IP within 5 minutes)
- **Rule 2**: Distributed attacks (≥3 different IPs targeting same user within 10 minutes)
- **Auto-resolution**: Alerts automatically resolve on successful user login
- **Status management**: Viewers can update alert status (OPEN → INVESTIGATING → RESOLVED)

### 📈 Analytics & Visualization
- Real-time dashboards with metrics and charts
- User activity tracking and timeline analysis
- Tenant-specific data filtering
- IP address tracking and visualization

### 🔍 Advanced Search
- Free-text search across 10+ log fields
- Case-insensitive pattern matching
- RBAC-filtered results
- Pagination support (up to 100 results per page)

---

## Tech Stack

**Backend:**
- Node.js + Express.js + TypeScript
- MongoDB with Mongoose ODM
- JWT authentication + bcrypt
- Multer for file uploads

**Frontend:**
- React 18 + TypeScript
- React Router v6
- Tailwind CSS + shadcn/ui
- Recharts for visualization

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 5.0+
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd log-management-system-intern
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/log-management
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5004
FRONTEND_URL=http://localhost:5174
EOF

# Seed super admin account
npm run seed:admin

# Start development server
npm run dev
```

**Super Admin Credentials:**
- Email: `superadmin@gmail.com`
- Password: `super12345`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5004/api
EOF

# Start development server
npm run dev
```

Visit: **http://localhost:5174**

---

## Usage Guide

### Creating Users

**Super Admin** (Pre-seeded):
- Email: `superadmin@gmail.com`
- Password: `super12345`
- Can view all tenants and alerts (read-only on alerts)

**Viewer Account** (Self-service signup):
1. Click "Sign up" on login page
2. Enter email, password, and organization name
3. System auto-creates tenant and viewer account
4. Login with your credentials
5. Access limited to your organization's data

### Ingesting Logs

#### Method 1: HTTP POST (Single Log)
```bash
POST http://localhost:5004/api/ingest/http
Content-Type: application/json

{
  "tenant": "acme.com",
  "source": "api",
  "event_type": "login_success",
  "user": "alice@acme.com",
  "ip": "192.168.1.100",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Method 2: Batch POST (Multiple Logs)
```bash
POST http://localhost:5004/api/ingest/batch
Content-Type: application/json

[
  { "tenant": "acme.com", "source": "api", ... },
  { "tenant": "acme.com", "source": "firewall", ... }
]
```

#### Method 3: File Upload (JSON/CSV)
1. Login to dashboard
2. Click "Upload JSON" button (admins only)
3. Select `.json` or `.csv` file
4. Format examples in `/samples` directory

**CSV Format:**
```csv
tenant,source,event_type,user,ip,timestamp
acme.com,api,login_failed,alice,192.168.1.1,2024-01-15T10:00:00Z
```

**JSON Format:**
```json
[
  {
    "tenant": "acme.com",
    "source": "api",
    "event_type": "login_failed",
    "user": "alice",
    "ip": "192.168.1.1",
    "timestamp": "2024-01-15T10:00:00Z"
  }
]
```

### Searching Logs

1. Navigate to **User Activity** page
2. Select tenant, user, and time range
3. Enter search query in search bar
4. Examples:
   - `"login_failed"` - Find failed login events
   - `"192.168.1.1"` - Find logs from specific IP
   - `"powershell.exe"` - Find process activity
   - `"wrong password"` - Find error messages

### Managing Alerts

**Viewing Alerts** (All users):
- Navigate to Alerts page
- Filter by status or time range
- View alert details (rule, user, IP, count)

**Updating Status** (Viewers only):
- Click status dropdown on alert
- Select: OPEN, INVESTIGATING, or RESOLVED
- Super admins have read-only access

**Automatic Behavior**:
- New alerts appear after 3+ failed logins
- Alerts auto-resolve when user logs in successfully
- Both OPEN and INVESTIGATING alerts resolve on success

---

## API Documentation

### Authentication Endpoints

```
POST /api/auth/signup
Body: { email, password, tenantName }
Response: { user, token }

POST /api/auth/login
Body: { email, password }
Response: { user, token }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }

POST /api/auth/logout
Response: { message }
```

### Log Ingestion

```
POST /api/ingest/http
Body: { tenant, source, event_type, user, ip, ... }

POST /api/ingest/batch
Body: [{ tenant, source, ... }, ...]

POST /api/ingest/file
Body: multipart/form-data with file
```

### Log Search

```
GET /api/logs/search?tenant=<name>&from=<ISO>&to=<ISO>&q=<query>&page=1&limit=50
Response: { data: [...], page, total, totalPages, hasMore }
```

### Alerts

```
GET /api/alerts?tenant=<id>&status=<status>&timeRange=<range>
Response: [{ id, ruleName, user, ip, status, ... }]

PATCH /api/alerts/:id
Body: { status: "OPEN" | "INVESTIGATING" | "RESOLVED" }
Response: { id, status, ... }
```

### Dashboard

```
GET /api/dashboard?tenant=<id>&timeRange=<range>
Response: { summary, recentLogs, topSources, topUsers }
```

### User Activity

```
GET /api/users/activity?user=<username>&tenant=<id>&timeRange=<range>
Response: { summary, eventsOverTime, recentEvents, relatedAlerts }
```

---

## Project Structure

```
log-management-system-intern/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, env configuration
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── normalizers/    # Log source normalizers
│   │   ├── routes/         # API endpoints
│   │   ├── scripts/        # Seed scripts
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Express app
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React context (auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   ├── data/           # Mock data, types
│   │   └── main.tsx        # App entry
│   ├── package.json
│   └── vite.config.ts
├── samples/               # Example log files
├── CSV_INGESTION_GUIDE.md
└── README.md
```

---

## RBAC Matrix

| Feature | Super Admin | Viewer |
|---------|------------|--------|
| View all tenants | ✅ | ❌ (Own only) |
| Dashboard access | ✅ All data | ✅ Tenant data |
| View alerts | ✅ Read-only | ✅ Full access |
| Update alert status | ❌ | ✅ |
| Upload logs | ✅ | ❌ |
| Search logs | ✅ All logs | ✅ Tenant logs |
| User activity | ✅ All users | ✅ Tenant users |

---

## Development

### Run Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Build for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Code Style
```bash
# Backend
npm run lint

# Frontend
npm run lint
```

---

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env`

**Port Already in Use:**
```bash
# Kill process on port 5004
lsof -ti:5004 | xargs kill -9

# Kill process on port 5174
lsof -ti:5174 | xargs kill -9
```

**Login Failed:**
- Run seed script: `npm run seed:admin`
- Check credentials: `superadmin@gmail.com` / `super12345`

**CORS Errors:**
- Verify `FRONTEND_URL` in backend `.env`
- Verify `VITE_API_BASE_URL` in frontend `.env`

---

## License

MIT

## Contributors

- SanMine (Full-stack Development)
- Google Deepmind Team (Antigravity AI Assistant)

---

## Support

For issues or questions, please check:
1. This README
2. `CSV_INGESTION_GUIDE.md` for file upload help
3. API documentation above
4. Sample files in `/samples` directory
