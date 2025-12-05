#!/bin/bash

# Simple script to start the project
# Run with: ./run.sh

echo "================================"
echo "Starting Nexlog"
echo "================================"
echo ""

# Step 1: Install backend packages
echo "Step 1: Installing backend..."
cd backend
npm install
cd ..

# Step 2: Install frontend packages
echo ""
echo "Step 2: Installing frontend..."
cd frontend
npm install
cd ..

# Step 3: Create backend .env file if not exists
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "Step 3: Creating backend .env file..."
    cat > backend/.env << EOF
MONGO_URI=mongodb+srv://your-connection-string-here/nexlog
JWT_SECRET=your-secret-key
PORT=5004
FRONTEND_URL=http://localhost:5174
NODE_ENV=development
EOF
    echo "Please update backend/.env with your MongoDB connection string"
fi

# Step 4: Create frontend .env file if not exists
if [ ! -f "frontend/.env" ]; then
    echo ""
    echo "Step 4: Creating frontend .env file..."
    cat > frontend/.env << EOF
VITE_API_BASE_URL=http://localhost:5004/api
EOF
fi

# Step 5: Create super admin account
echo ""
echo "Step 5: Creating super admin account..."
cd backend
npm run seed:admin
cd ..

# Step 6: Start servers
echo ""
echo "================================"
echo "Setup Complete"
echo "================================"
echo ""
echo "Opening 2 terminal windows..."
echo "- Backend on port 5004"
echo "- Frontend on port 5174"
echo ""

# Start backend in new terminal
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && npm run dev"'

# Wait 1 second
sleep 1

# Start frontend in new terminal
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/frontend && npm run dev"'

echo ""
echo "Wait 10 seconds, then open: http://localhost:5174"
echo ""
echo "Login:"
echo "  Email: superadmin@gmail.com"
echo "  Password: super12345"
echo ""
