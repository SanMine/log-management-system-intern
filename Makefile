.PHONY: help install dev build test clean docker-up docker-down seed logs

# Default target
help:
	@echo "Log Management System - Available Commands"
	@echo "==========================================="
	@echo "make install       - Install all dependencies"
	@echo "make dev           - Start development servers"
	@echo "make build         - Build for production"
	@echo "make test          - Run tests"
	@echo "make seed          - Seed super admin account"
	@echo "make docker-up     - Start with Docker Compose"
	@echo "make docker-down   - Stop Docker containers"
	@echo "make logs          - View Docker logs"
	@echo "make clean         - Clean build files"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Installation complete!"

# Start development servers
dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:5004"
	@echo "Frontend will run on http://localhost:5174"
	@echo ""
	@echo "Opening two terminal tabs..."
	osascript -e 'tell application "Terminal" to do script "cd $(PWD)/backend && npm run dev"'
	osascript -e 'tell application "Terminal" to do script "cd $(PWD)/frontend && npm run dev"'

# Build for production
build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✅ Build complete!"

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && npm test || echo "No tests configured"
	@echo "Running frontend tests..."
	cd frontend && npm test || echo "No tests configured"

# Seed super admin
seed:
	@echo "Seeding super admin account..."
	cd backend && npm run seed:admin
	@echo "✅ Super admin created!"
	@echo "Email: superadmin@gmail.com"
	@echo "Password: super12345"

# Docker commands
docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "Frontend: http://localhost:5174"
	@echo "Backend:  http://localhost:5004"
	@echo ""
	@echo "Run 'make logs' to view logs"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down
	@echo "✅ Services stopped!"

docker-build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "✅ Build complete!"

logs:
	docker-compose logs -f

# Clean build artifacts
clean:
	@echo "Cleaning build files..."
	rm -rf backend/dist
	rm -rf frontend/dist
	rm -rf backend/node_modules
	rm -rf frontend/node_modules
	@echo "✅ Clean complete!"

# Quick setup (install + seed)
setup: install seed
	@echo "✅ Setup complete! Run 'make dev' to start development."
