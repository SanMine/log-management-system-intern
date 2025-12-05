# Local Setup Guide

This guide shows how to run Nexlog on your computer.

---

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (free)
- Git

---

## Step 1: Clone Repository

```bash
git clone https://github.com/SanMine/log-management-system-intern.git
cd log-management-system-intern
```

---

## Step 2: Setup MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0` (for development)
5. Get connection string
6. Replace `<password>` with your password

Example connection string:
```
mongodb+srv://admin:mypass123@cluster0.xxxxx.mongodb.net/nexlog
```

---

## Step 3: Configure Backend

```bash
cd backend
npm install

Add .env file in backend folder
MONGO_URI=mongodb+srv://your-connection-string-here/nexlog
JWT_SECRET=your-secret-key
PORT=5004 (can choose any port number)
FRONTEND_URL=http://localhost:5174 
NODE_ENV=development


npm run seed:admin
cd ..
```

Super admin login:
- Email: `superadmin@gmail.com`
- Password: `super12345`

---

## Step 4: Configure Frontend

```bash
cd frontend
npm install

Add .env file in frontend folder
VITE_API_URL=http://localhost:5004/api

cd ..
```

---

## Step 5: Start Application

**Method 1: Docker (Recommended)**
```bash
docker-compose up -d
```

**Method 2: Quick Script**
```bash
./run.sh
```

**Method 3: Manual Start**

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

---

## Step 6: Access Application

Open browser: **http://localhost:5174**

Login:
- Email: `superadmin@gmail.com`
- Password: `super12345`

---

## Test System

```bash
./samples/send_logs.sh
```

Check:
- Dashboard page shows data
- Alerts page shows 1 alert

---

Cannot connect to database:
- Check MongoDB Atlas connection string
- Verify password is correct
- Check IP whitelist includes `0.0.0.0/0`

---

## Quick Reference

**URLs:**
- Frontend: http://localhost:5174
- Backend: http://localhost:5004

**Commands:**
```bash
# Install
cd backend && npm install
cd frontend && npm install

# Seed admin
cd backend && npm run seed:admin

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

---