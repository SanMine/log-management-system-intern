#!/bin/bash

# ==============================================
# Quick Start Script for Log Management System
# ==============================================

set -e  # Exit on error

echo "=========================================="
echo "Log Management System - Quick Start"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}Docker detected!${NC}"
    echo ""
    echo "Choose deployment mode:"
    echo "1) Docker Compose (Recommended - One command)"
    echo "2) Manual (Separate terminals)"
    read -p "Enter choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo ""
        echo -e "${GREEN}Starting with Docker Compose...${NC}"
        docker-compose up -d
        
        echo ""
        echo -e "${GREEN}✅ Services started!${NC}"
        echo ""
        echo "Frontend: http://localhost:5174"
        echo "Backend:  http://localhost:5004"
        echo ""
        echo "Login credentials:"
        echo "  Email: superadmin@gmail.com"
        echo "  Password: super12345"
        echo ""
        echo "View logs: docker-compose logs -f"
        echo "Stop services: docker-compose down"
        exit 0
    fi
fi

# Manual setup
echo ""
echo -e "${YELLOW}Setting up manually...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not found!${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Check MongoDB
if ! command -v mongod &> /dev/null && ! pgrep -x mongod > /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB not detected${NC}"
    echo "Please ensure MongoDB is running or update MONGO_URI in backend/.env"
fi

# Install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo ""
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
fi

# Install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo ""
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
fi

# Setup backend .env if not exists
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "Creating backend .env file..."
    cp backend/.env.example backend/.env 2>/dev/null || cat > backend/.env << EOF
MONGO_URI=mongodb://localhost:27017/log-management
JWT_SECRET=development-secret-key
PORT=5004
FRONTEND_URL=http://localhost:5174
NODE_ENV=development
EOF
    echo -e "${GREEN}✓ Backend .env created${NC}"
fi

# Setup frontend .env if not exists
if [ ! -f "frontend/.env" ]; then
    echo ""
    echo "Creating frontend .env file..."
    cp frontend/.env.example frontend/.env 2>/dev/null || cat > frontend/.env << EOF
VITE_API_BASE_URL=http://localhost:5004/api
EOF
    echo -e "${GREEN}✓ Frontend .env created${NC}"
fi

# Seed super admin
echo ""
echo "Seeding super admin account..."
cd backend
npm run seed:admin 2>/dev/null || echo "Admin may already exist"
cd ..

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Starting servers..."
echo ""
echo "Backend:  http://localhost:5004"
echo "Frontend: http://localhost:5174"
echo ""
echo "Login credentials:"
echo "  Email: superadmin@gmail.com"
echo "  Password: super12345"
echo ""
echo -e "${YELLOW}Opening two terminal windows...${NC}"
echo ""

# Open backend in new terminal
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && npm run dev"' 2>/dev/null || \
    gnome-terminal -- bash -c "cd backend && npm run dev; exec bash" 2>/dev/null || \
    echo "Backend: Run 'cd backend && npm run dev' in a new terminal"

# Wait a moment
sleep 1

# Open frontend in new terminal
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/frontend && npm run dev"' 2>/dev/null || \
    gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash" 2>/dev/null || \
    echo "Frontend: Run 'cd frontend && npm run dev' in a new terminal"

echo ""
echo -e "${GREEN}Services starting...${NC}"
echo "Wait 10-15 seconds then open http://localhost:5174"
echo ""
