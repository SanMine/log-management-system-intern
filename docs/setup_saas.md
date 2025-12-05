# SaaS Deployment Guide

This document explains how to deploy Nexlog in SaaS mode using:

- **Backend:** Node.js + Express + MongoDB (Render)
- **Frontend:** React (Vercel)
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT
- **Multi-Tenant:** Enabled automatically on signup

---

## 1. Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- GitHub account
- Render account (free tier)
- Vercel account (free tier)

---

## 2. Environment Variables

### Backend (.env)

```
PORT=5004
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nexlog
JWT_SECRET=your-random-secret-key-here
FRONTEND_URL=https://nexlog-six.vercel.app
NODE_ENV=production
```

### Frontend (.env)

```
VITE_API_URL=https://nexlog-backend.onrender.com/api
```

---

## 3. Setup MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com
2. Create new cluster (FREE M0 tier)
3. Create database user with password
4. Whitelist all IP addresses: `0.0.0.0/0`
5. Get connection string
6. Replace `<password>` with your actual password
7. Add `/nexlog` at the end

Example:
```
mongodb+srv://admin:mypass123@cluster0.xxxxx.mongodb.net/nexlog
```

---

## 4. Deploy Backend (Render)

1. Push code to GitHub
2. Go to https://render.com
3. Click "New" and choose "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name:** nexlog-backend
   - **Root Directory:** backend
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Add environment variables from step 2
7. Click "Create Web Service"
8. Wait 3-5 minutes

Your backend URL:
```
https://nexlog-backend.onrender.com
```

### Seed Super Admin

After deployment:
1. Go to backend service in Render
2. Click "Shell" tab
3. Run:
   ```
   npm run seed:admin
   ```

Super Admin credentials:
- Email: `superadmin@gmail.com`
- Password: `super12345`

---

## 5. Deploy Frontend (Vercel)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo
5. Configure:
   - **Framework:** Vite
   - **Root Directory:** frontend
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
6. Add environment variable:
   ```
   VITE_API_URL=https://nexlog-backend.onrender.com/api
   ```
7. Click "Deploy"
8. Wait 2-3 minutes

Your frontend URL:
```
https://nexlog-six.vercel.app
```

### Update Backend CORS

1. Go back to Render backend
2. Update `FRONTEND_URL` environment variable
3. Set to your Vercel URL
4. Service will auto-redeploy

---

## 6. SaaS Mode (Multi-Tenant)

The system automatically handles multi-tenancy:

**Signup creates new tenant:**
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123",
  "tenantName": "Company Name"
}
```

**Response includes:**
- JWT token (contains `tenantId`)
- User role (`viewer` or `super_admin`)
- Tenant information

**Data isolation:**
- Each tenant only sees their own logs
- Super admin can view all tenants
- Enforced at database query level

---

## 7. Log Ingestion Endpoints

External systems can send logs to your SaaS:

**Single log:**
```bash
POST /api/ingest/http
Content-Type: application/json

{
  "tenant": "company.com",
  "source": "api",
  "event_type": "login_failed",
  "user": "alice",
  "ip": "192.168.1.100"
}
```

**Batch logs:**
```bash
POST /api/ingest/batch
Content-Type: application/json

[
  { "tenant": "company.com", "source": "api", ... },
  { "tenant": "company.com", "source": "firewall", ... }
]
```


## 8. Verify Deployment

Test these endpoints in order:

**1. Health check**
```bash
GET https://nexlog-backend.onrender.com/api/health
```
Expected: `{"status":"ok"}`

**2. Signup**
```bash
POST /api/auth/signup
Body: { "email": "test@demo.com", "password": "test1234", "tenantName": "Demo Co" }
```
Expected: Returns token

**3. Login**
```bash
POST /api/auth/login
Body: { "email": "superadmin@gmail.com", "password": "super12345" }
```
Expected: Returns token

**4. Send log**
```bash
POST /api/ingest/http
Body: { "tenant": "demo", "source": "api", "event_type": "test" }
```
Expected: `{"success":true, "id":1}`

**5. Search logs**
```bash
GET /api/logs/search?tenant=1&from=2024-01-01
Headers: Authorization: Bearer <token>
```
Expected: Returns logs array

**6. Open frontend**
```
https://nexlog-six.vercel.app
```
Expected: See login page

**7. Login to dashboard**
- Use super admin credentials
- Should see dashboard with data

**Checklist:**
- [ ] Backend responds to health check
- [ ] Signup creates user
- [ ] Login returns token
- [ ] Ingest endpoint accepts logs
- [ ] Search returns data
- [ ] Frontend loads
- [ ] Dashboard displays charts
- [ ] Alerts page works

If all checked, deployment is successful.

---

## 9. Production URLs

**Live Deployment:**

- **Frontend Application:** https://nexlog-six.vercel.app
- **Backend API:** https://nexlog-backend.onrender.com
- **Database:** MongoDB Atlas (Cloud)

**API Endpoints:**
- Health Check: https://nexlog-backend.onrender.com/health
- Auth: https://nexlog-backend.onrender.com/api/auth
- Logs: https://nexlog-backend.onrender.com/api/logs
- Dashboard: https://nexlog-backend.onrender.com/api/dashboard
- Alerts: https://nexlog-backend.onrender.com/api/alerts

Share these URLs for testing and demonstration.

---

## 10. Troubleshooting

**Backend won't deploy**
- Check build logs in Render
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas allows `0.0.0.0/0`

**Frontend shows CORS error**
- Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- Must include `https://`
- No trailing slash

**Cannot login**
- Run seed script in Render Shell
- Check MongoDB connection
- Verify JWT_SECRET is set

**Logs not appearing**
- Check tenant ID in logs matches user's tenant
- Verify database connection
- Check backend logs in Render

---

## Summary

**Deployment time:** 20-30 minutes

**Steps:**
1. Setup MongoDB Atlas (5 min)
2. Deploy backend to Render (10 min)
3. Deploy frontend to Vercel (5 min)
4. Test endpoints (5 min)
5. Share URLs

**Cost:** $0 (all free tiers)

**What you get:**
- Public HTTPS backend API
- Public HTTPS frontend app
- Cloud MongoDB database
- Auto-deploy from GitHub
- SSL certificates included

Your SaaS deployment is complete.
