# Nexlog - Backend

A simple, clean backend for a multi-tenant log management system with RBAC (Role-Based Access Control).

## Tech Stack

- **Node.js** + **Express** - Backend framework
- **TypeScript** - Type safety
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Features

- ✅ Multi-tenant architecture
- ✅ RBAC (Admin & Viewer roles)
- ✅ Auto-increment numeric IDs (1, 2, 3...)
- ✅ JWT authentication
- ✅ HTTP log ingestion
- ✅ Dashboard statistics API
- ✅ Alerts management
- ✅ User activity tracking
- ✅ Clean, beginner-friendly code

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment configuration
│   │   └── db.ts               # MongoDB connection
│   ├── models/
│   │   ├── Counter.ts          # Auto-increment IDs
│   │   ├── Tenant.ts           # Tenant model
│   │   ├── User.ts             # User model
│   │   ├── LogEvent.ts         # Log events
│   │   └── Alert.ts            # Security alerts
│   ├── middleware/
│   │   ├── auth.ts             # JWT & RBAC middleware
│   │   └── errorHandler.ts    # Error handling
│   ├── services/
│   │   ├── normalizeHttpLog.ts # Log normalization
│   │   ├── logService.ts       # Log operations
│   │   ├── dashboardService.ts # Dashboard data
│   │   ├── alertService.ts     # Alert operations
│   │   └── userActivityService.ts # User activity
│   ├── routes/
│   │   ├── authRoutes.ts       # /api/auth
│   │   ├── ingestRoutes.ts     # /api/ingest
│   │   ├── dashboardRoutes.ts  # /api/dashboard
│   │   ├── alertsRoutes.ts     # /api/alerts
│   │   ├── usersRoutes.ts      # /api/users
│   │   └── tenantsRoutes.ts    # /api/tenants
│   ├── seed/
│   │   └── seedData.ts         # Database seeding script
│   └── server.ts               # Main server file
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (or use defaults):

```env
PORT=5002
NODE_ENV=development
FRONTEND_URL=http://localhost:5175
MONGO_URI=mongodb+srv://log:log1234567@cluster0.1lgw5wz.mongodb.net/
JWT_SECRET=your_jwt_secret_here_change_in_production
```

### 3. Seed the Database

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 3 tenants (A.website.com, B.website.com, C.website.com)
- 4 users (1 Admin, 3 Viewers)
- 330 log events
- 5 alerts

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5002`

## Test Credentials

After seeding, use these credentials to login:

| Email | Password | Role | Tenant |
|-------|----------|------|--------|
| admin@example.com | admin123 | ADMIN | All (null) |
| alice@a.com | alice123 | VIEWER | A.website.com |
| bob@b.com | bob123 | VIEWER | B.website.com |
| charlie@a.com | charlie123 | VIEWER | A.website.com |

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{ "status": "ok" }
```

---

### 🔐 Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "ADMIN",
    "tenantId": null
  }
}
```

**Use the token in subsequent requests:**
```
Authorization: Bearer <token>
```

---

### 📥 Log Ingestion

#### Ingest HTTP Log
```
POST /api/ingest/http
Content-Type: application/json

{
  "tenant": "A.website.com",
  "source": "api",
  "event_type": "login_failed",
  "user": "alice",
  "ip": "203.0.113.7",
  "severity": 3
}
```

Response:
```json
{
  "success": true,
  "id": 345,
  "message": "Log event ingested successfully"
}
```

---

### 📊 Dashboard

#### Get Dashboard Statistics
```
GET /api/dashboard?tenantId=1&timeRange=24h
Authorization: Bearer <token>
```

Query Parameters:
- `tenantId` (optional): Tenant ID or "all" (Admin can use "all", Viewer locked to their tenant)
- `timeRange` (optional): "15m", "1h", "24h", "7d" (default: "24h")

Response:
```json
{
  "totalEvents": 150,
  "uniqueIps": 8,
  "uniqueUsers": 12,
  "totalAlerts": 2,
  "eventsOverTime": [
    { "time": "2025-12-02T10:00:00Z", "count": 15 },
    { "time": "2025-12-02T11:00:00Z", "count": 22 }
  ],
  "topIps": [
    { "ip": "203.0.113.7", "count": 45 },
    { "ip": "192.168.1.55", "count": 32 }
  ],
  "topUsers": [
    { "user": "alice", "count": 52 },
    { "user": "charlie", "count": 38 }
  ],
  "topEventTypes": [
    { "event_type": "login_failed", "count": 38 },
    { "event_type": "UserLoggedIn", "count": 48 }
  ]
}
```

---

### 🚨 Alerts

#### Get Alerts
```
GET /api/alerts?tenantId=1&status=OPEN&timeRange=24h
Authorization: Bearer <token>
```

Query Parameters:
- `tenantId` (optional): Filter by tenant
- `status` (optional): "OPEN", "INVESTIGATING", "RESOLVED", or "all"
- `timeRange` (optional): "15m", "1h", "24h", "7d"

Response:
```json
[
  {
    "id": 1,
    "tenantId": 1,
    "time": "2025-12-02T21:30:01.000Z",
    "ruleName": "Failed Login Burst",
    "ip": "203.0.113.7",
    "user": "alice",
    "count": 6,
    "status": "OPEN"
  }
]
```

#### Update Alert Status
```
PATCH /api/alerts/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "RESOLVED"
}
```

---

### 👥 Users

#### Get Users List
```
GET /api/users?tenantId=1
Authorization: Bearer <token>
```

Response:
```json
["alice", "charlie", "admin"]
```

#### Get User Activity
```
GET /api/users/alice/activity?tenantId=1&timeRange=24h
Authorization: Bearer <token>
```

Response:
```json
{
  "summary": {
    "totalEvents": 52,
    "uniqueIps": 2,
    "totalAlerts": 1
  },
  "eventsOverTime": [
    { "time": "2025-12-02T10:00:00Z", "count": 5 },
    { "time": "2025-12-02T11:00:00Z", "count": 8 }
  ],
  "recentEvents": [
    {
      "time": "2025-12-02T12:34:15.000Z",
      "eventType": "UserLoggedIn",
      "source": "api",
      "ip": "192.168.1.55",
      "tenantId": 1
    }
  ],
  "relatedAlerts": [
    {
      "time": "2025-12-02T21:30:01.000Z",
      "ruleName": "Failed Login Burst",
      "tenantId": 1,
      "ip": "203.0.113.7",
      "status": "OPEN"
    }
  ]
}
```

---

### 🏢 Tenants

#### Get Tenants
```
GET /api/tenants
Authorization: Bearer <token>
```

Response (Admin):
```json
[
  { "id": 1, "name": "A.website.com", "key": "A" },
  { "id": 2, "name": "B.website.com", "key": "B" },
  { "id": 3, "name": "C.website.com", "key": "C" }
]
```

Response (Viewer):
```json
[
  { "id": 1, "name": "A.website.com", "key": "A" }
]
```

#### Create Tenant (Admin only)
```
POST /api/tenants
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "D.website.com",
  "key": "D"
}
```

---

## RBAC Rules

### Admin Role
- Can access **all tenants**
- Can use `tenantId=all` or any specific tenant ID
- Can create tenants
- Full read/write access

### Viewer Role
- Locked to their assigned `tenantId`
- Even if they request a different tenant, the backend enforces their tenant
- Read-only access (cannot create tenants or modify data)

## Testing with Postman

### Quick Start Collection

1. **Login as Admin**
   ```
   POST http://localhost:5002/api/auth/login
   Body: { "email": "admin@example.com", "password": "admin123" }
   ```
   Copy the `token` from response

2. **Get Dashboard (All Tenants)**
   ```
   GET http://localhost:5002/api/dashboard?tenantId=all
   Headers: Authorization: Bearer <your-token>
   ```

3. **Get Dashboard (Tenant A Only)**
   ```
   GET http://localhost:5002/api/dashboard?tenantId=1
   Headers: Authorization: Bearer <your-token>
   ```

4. **Ingest a Log**
   ```
   POST http://localhost:5002/api/ingest/http
   Body: {
     "tenant": "A.website.com",
     "source": "api",
     "event_type": "test_event",
     "user": "testuser",
     "ip": "10.0.0.1"
   }
   ```

5. **Get Alerts**
   ```
   GET http://localhost:5002/api/alerts?tenantId=1&status=OPEN
   Headers: Authorization: Bearer <your-token>
   ```

6. **Get User Activity**
   ```
   GET http://localhost:5002/api/users/alice/activity?tenantId=1
   Headers: Authorization: Bearer <your-token>
   ```

## Data Models

### Tenant
- `id`: Auto-increment numeric ID
- `name`: Tenant name (e.g., "A.website.com")
- `key`: Short key (e.g., "A")

### User
- `id`: Auto-increment numeric ID
- `email`: User email (unique)
- `passwordHash`: Bcrypt hashed password
- `role`: "ADMIN" or "VIEWER"
- `tenantId`: Null for Admin, specific ID for Viewer

### LogEvent
- `id`: Auto-increment numeric ID
- `timestamp`: Event time
- `tenantId`: Link to Tenant
- `source`: Source system (e.g., "api", "firewall")
- `event_type`: Type of event
- `user`: Username (optional)
- `src_ip`: Source IP (optional)
- `severity`: 1-5 severity level (optional)
- `raw`: Original JSON data

### Alert
- `id`: Auto-increment numeric ID
- `tenantId`: Link to Tenant
- `time`: Alert time
- `ruleName`: Alert rule name
- `ip`: IP address (optional)
- `user`: Username (optional)
- `count`: Number of events
- `status`: "OPEN", "INVESTIGATING", or "RESOLVED"

## Scripts

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "seed": "ts-node-dev src/seed/seedData.ts"
}
```

## Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=<production-mongodb-uri>`
   - `JWT_SECRET=<strong-secret-key>`

3. Run the production server:
   ```bash
   npm start
   ```

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGO_URI` in `.env`
- Check network access (whitelist IP in MongoDB Atlas)
- Ensure database user has correct permissions

### Authentication Errors
- Ensure JWT token is included in `Authorization` header
- Token format: `Bearer <token>`
- Check token hasn't expired (7-day validity)

### Seed Script Fails
- Ensure MongoDB connection is working
- Check database permissions
- Review console output for specific errors

## License

MIT
