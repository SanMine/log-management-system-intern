# SaaS Deployment Guide (Cloud)

This guide helps you deploy **Nexlog** to the cloud using free services.

**Deployment Stack:**
- **Backend:** Render.com (free tier)
- **Frontend:** Vercel.com (free tier)
- **Database:** MongoDB Atlas (free tier)

**Time needed:** 20-30 minutes

---

## Prerequisites

Before starting, create free accounts at:
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. [Render.com](https://render.com/)
3. [Vercel.com](https://vercel.com/signup)
4. [GitHub.com](https://github.com/) (to store your code)

---

## Step 1: Push Your Code to GitHub

```bash
# Go to your project folder
cd log-management-system-intern

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create new repository on GitHub.com
# Then connect and push:
git remote add origin https://github.com/YOUR-USERNAME/log-management.git
git branch -M main
git push -u origin main
```

---

## Step 2: Setup MongoDB Atlas (Database)

### 2.1 Create Database Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Build a Database"**
3. Choose **FREE tier** (M0 Shared)
4. Select **Cloud Provider:** AWS
5. Select **Region:** Closest to you (e.g., Singapore, Oregon)
6. Cluster Name: `nexlog-cluster`
7. Click **"Create"**

### 2.2 Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication: **Password**
4. Username: `logadmin`
5. Password: **Auto-generate** (copy it somewhere safe!)
6. Database User Privileges: **Atlas Admin**
7. Click **"Add User"**

### 2.3 Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Render.com)
4. Confirm: `0.0.0.0/0` appears
5. Click **"Confirm"**

### 2.4 Get Connection String

1. Go to **Database** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://logadmin:<password>@log-management-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name at the end: `/logdb`
   ```
   mongodb+srv://logadmin:YOUR_PASSWORD@log-management-cluster.xxxxx.mongodb.net/logdb?retryWrites=true&w=majority
   ```
8. **Save this string!** You'll need it for Render.

---

## Step 3: Deploy Backend to Render

### 3.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your **GitHub account**
4. Select your repository: `log-management`
5. Click **"Connect"**

### 3.2 Configure Service

**Basic Settings:**
- Name: `nexlog-backend`
- Region: Same as MongoDB (e.g., Oregon, Singapore)
- Branch: `main`
- Root Directory: `backend`
- Runtime: **Node**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Instance Type: **Free**

### 3.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5004` |
| `MONGO_URI` | Your MongoDB connection string from Step 2.4 |
| `JWT_SECRET` | Any random string (e.g., `super-secret-jwt-key-production-2024`) |
| `FRONTEND_URL` | `https://log-management.vercel.app` (update after Step 4) |

> **Important:** Generate a strong JWT_SECRET using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. Your backend URL will be: `https://nexlog-backend.onrender.com`
4. **Copy this URL!** You'll need it for frontend.

### 3.5 Seed Super Admin Account

After deployment succeeds:

1. Go to your service in Render
2. Click **"Shell"** tab (left sidebar)
3. Run this command:
   ```bash
   npm run seed:admin
   ```
4. You should see: `Super admin seeded successfully`

**Super Admin Credentials:**
- Email: `superadmin@gmail.com`
- Password: `super12345`

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Import Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `log-management`
4. Click **"Import"**

### 4.2 Configure Project

**Framework Preset:** Vite (should auto-detect)

**Root Directory:**
- Click **"Edit"**
- Set to: `frontend`

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 4.3 Add Environment Variables

Click **"Environment Variables"**

Add this variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://log-management-backend.onrender.com/api` |

(Use your actual Render backend URL from Step 3.4)

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend URL will be: `https://log-management-XXXX.vercel.app`
4. Click **"Visit"** to open your app!

### 4.5 Update Backend FRONTEND_URL

1. Go back to Render dashboard
2. Open your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## Step 5: Verify Deployment

### 5.1 Test Frontend

1. Open your Vercel URL
2. You should see the login page
3. Login with Super Admin:
   - Email: `superadmin@gmail.com`
   - Password: `super12345`
4. You should see the dashboard

### 5.2 Test Signup

1. Click **"Sign up"**
2. Create a new viewer account:
   - Email: `test@demo.com`
   - Password: `test1234`
   - Organization: `Demo Company`
3. Should redirect to dashboard

### 5.3 Test Log Ingestion

Using Postman or curl:

```bash
curl -X POST https://log-management-backend.onrender.com/api/ingest/http \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": "demo",
    "source": "api",
    "event_type": "login_success",
    "user": "test@demo.com",
    "ip": "192.168.1.100",
    "timestamp": "2024-12-05T10:30:00Z"
  }'
```

Expected response:
```json
{
  "success": true,
  "id": 1,
  "source": "api",
  "message": "Log event ingested successfully"
}
```

### 5.4 Test Search

1. Go to **User Activity** page
2. Enter search term: `test@demo.com`
3. You should see the log you just created

---

## Step 6: Enable HTTPS (Automatic)

✅ **Already Enabled!**

Both Render and Vercel automatically provide free HTTPS:
- Frontend: `https://log-management-XXXX.vercel.app`
- Backend: `https://log-management-backend.onrender.com`

SSL certificates are auto-generated and auto-renewed.

---

## Monitoring & Logs

### View Backend Logs (Render)

1. Go to Render dashboard
2. Click your service
3. Click **"Logs"** tab
4. See real-time server logs

### View Frontend Logs (Vercel)

1. Go to Vercel dashboard
2. Click your project
3. Click **"Deployments"** → Select latest
4. Click **"Runtime Logs"**

### MongoDB Logs (Atlas)

1. Go to MongoDB Atlas
2. Click **"Metrics"** tab
3. See query performance and storage usage

---

## Performance Tips

### Render Free Tier Limitations

⚠️ **Important:** Free tier services sleep after 15 minutes of inactivity
- **Impact:** First request after sleep takes 30-60 seconds
- **Solution:** Upgrade to paid tier ($7/month) for 24/7 uptime

### Keep Service Awake (Optional)

Use a free ping service like [UptimeRobot](https://uptimerobot.com/):
1. Create account
2. Add monitor for your backend URL
3. Ping every 10 minutes
4. Keeps service from sleeping

---

## Updating Your Deployment

### Update Backend

```bash
# Make changes to code
git add .
git commit -m "Update backend"
git push origin main

# Render auto-deploys in 2-3 minutes
```

### Update Frontend

```bash
# Make changes to code
git add .
git commit -m "Update frontend"
git push origin main

# Vercel auto-deploys in 1-2 minutes
```

---

## Troubleshooting

### Problem: Backend shows "Application failed to respond"

**Solution:**
1. Check Render logs for errors
2. Verify `MONGO_URI` is correct
3. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Problem: Frontend shows CORS errors

**Solution:**
1. Check `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Must include `https://` and no trailing slash
3. Redeploy backend after changing

### Problem: Login doesn't work

**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_BASE_URL` in Vercel is correct
3. Try running seed script again in Render shell

### Problem: "Cannot connect to MongoDB"

**Solution:**
1. Verify MongoDB Atlas cluster is running
2. Check connection string has correct password
3. Verify database name is added: `/logdb`
4. Check network access allows `0.0.0.0/0`

---

## Cost Summary

| Service | Free Tier Limits | Cost |
|---------|-----------------|------|
| **MongoDB Atlas** | 512 MB storage | $0 |
| **Render** | 750 hours/month, sleeps after 15min | $0 |
| **Vercel** | 100 GB bandwidth/month | $0 |
| **Total** | Enough for testing/demo | **$0/month** |

**To upgrade:**
- MongoDB: $9/month for 2GB
- Render: $7/month for always-on
- Vercel: Free tier is usually enough

---

## Security Checklist

- [x] HTTPS enabled (automatic)
- [x] Passwords hashed with bcrypt
- [x] JWT tokens signed
- [x] CORS configured
- [x] MongoDB access restricted
- [x] Environment variables secured
- [ ] Change default super admin password
- [ ] Rotate JWT_SECRET periodically
- [ ] Enable MongoDB backup (paid feature)

---

## Demo URLs for Examiner

After deployment, provide these URLs:

**Frontend (Public):**
```
https://log-management-XXXX.vercel.app
```

**Backend API:**
```
https://log-management-backend.onrender.com
```

**Test Credentials:**
```
Super Admin:
  Email: superadmin@gmail.com
  Password: super12345

Viewer (create via signup):
  Email: demo@test.com
  Password: demo1234
```

---

## Next Steps

1. ✅ Test all features in production
2. ✅ Upload sample logs via Postman
3. ✅ Verify alerts are working
4. ✅ Create demo video showing deployment
5. ✅ Share URLs with examiner

Your SaaS deployment is complete! 🎉
