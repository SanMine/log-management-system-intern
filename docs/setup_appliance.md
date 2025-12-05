# Local Setup Guide (Mac)

This guide shows you how to run **Nexlog** on your Mac computer.

**Time needed:** 10 minutes

---

## What You Need

- **Mac computer** (macOS)
- **Node.js 18+** installed
- **MongoDB** running
- **Git** installed

---

## Step 1: Get the Code

Open Terminal and run:

```bash
# Clone the project
git clone https://github.com/SanMine/log-management-system-intern.git

# Go into the folder
cd log-management-system-intern
```

---

## Step 2: Setup Backend

```bash
# Go to backend folder
cd backend

# Install packages
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/nexlog
JWT_SECRET=your-secret-key-change-in-production
PORT=5004
FRONTEND_URL=http://localhost:5174
NODE_ENV=development
EOF

# Create super admin account
npm run seed:admin

# Go back to main folder
cd ..
```

**Super Admin Login:**
- Email: `superadmin@gmail.com`
- Password: `super12345`

---

## Step 3: Setup Frontend

```bash
# Go to frontend folder
cd frontend

# Install packages
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5004/api
EOF

# Go back to main folder
cd ..
```

---

## Step 4: Start Everything

**Option 1: Use the quick start script**
```bash
./run.sh
```
This opens two terminal windows automatically.

**Option 2: Manual start (if script doesn't work)**

Open **first terminal window:**
```bash
cd backend
npm run dev
```

Open **second terminal window:**
```bash
cd frontend
npm run dev
```

---

## Step 5: Open in Browser

Wait 10 seconds, then open:

**http://localhost:5174**

Login with:
- Email: `superadmin@gmail.com`
- Password: `super12345`

---

## Test the System

### Send Sample Logs

```bash
# Run the test script
./samples/send_logs.sh
```

This sends example logs and triggers an alert.

### Check the Dashboard

1. Go to **Dashboard** page
2. You should see charts with data
3. Go to **Alerts** page
4. You should see 1 alert (multiple failed logins)

---

## Common Problems

### "Port already in use"

```bash
# Kill process on port 5004
lsof -ti:5004 | xargs kill -9

# Kill process on port 5174
lsof -ti:5174 | xargs kill -9
```

Then start again.

### "Cannot connect to MongoDB"

Make sure MongoDB is running:

```bash
# Start MongoDB
mongod
```

Or check if it's already running:
```bash
ps aux | grep mongod
```

### "Login failed"

Run the seed script again:
```bash
cd backend
npm run seed:admin
```

---

## Stop the System

Press `Ctrl + C` in both terminal windows.

---

## Next Steps

1. ✅ Login successful
2. ✅ See dashboard with data
3. ✅ Alerts are working
4. Ready to test more features!

---

## Project Structure

```
nexlog/
├── backend/          # API server (port 5004)
├── frontend/         # Web UI (port 5174)
├── samples/          # Test log files
├── tests/            # Test cases
└── run.sh            # Quick start script
```

---

## Helpful Commands

```bash
# Install everything
cd backend && npm install
cd ../frontend && npm install

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Create super admin
cd backend && npm run seed:admin

# Send test logs
./samples/send_logs.sh
```

---

## What Ports are Used?

- **Frontend:** http://localhost:5174
- **Backend:** http://localhost:5004
- **MongoDB:** localhost:27017

Make sure these ports are free before starting.

---

That's it! Simple and working. 🚀
