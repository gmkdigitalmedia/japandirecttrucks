  🚀 Development Commands

  Frontend (Port 3000)

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/frontend
  npm run dev
  URL: http://localhost:3000

  Backend API (Port 3002)

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/backend
  npm run dev
  URL: http://localhost:3002 (API endpoints)
  Health Check: http://localhost:3002/health

  Admin Panel (Port 3001)

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/admin
  npm run dev
  URL: http://localhost:3001

  📦 Installation Commands (if needed)

  Install All Dependencies

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan
  npm install
  cd backend && npm install && cd ..
  cd frontend && npm install && cd ..
  cd admin && npm install && cd ..

  Individual Service Install

  # Backend only
  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/backend
  npm install

  # Frontend only
  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/frontend
  npm install

  # Admin only
  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/admin
  npm install

  🗄️ Database Commands

  With Docker (Recommended)

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan
  docker-compose up -d postgres redis

  Manual Database Setup

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/database
  ./setup.sh

  🚀 All-in-One Commands

  Start Everything (Root Level)

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan
  npm run dev  # Starts all services concurrently

  Background Services

  # Start frontend in background
  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/frontend
  npm run dev &

  # Start backend in background
  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/backend
  npm run dev &

  # Start admin in background
  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan/admin
  npm run dev &

  🔧 Build Commands

  Production Build

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan
  npm run build  # Builds all services

  Individual Builds

  # Frontend build
  cd frontend && npm run build

  # Backend build
  cd backend && npm run build

  # Admin build
  cd admin && npm run build

  🧹 Stop Services

  Kill Running Services

  # Kill all Node processes (careful!)
  pkill -f node

  # Or find and kill specific ports
  lsof -ti:3000 | xargs kill  # Frontend
  lsof -ti:3002 | xargs kill  # Backend
  lsof -ti:3001 | xargs kill  # Admin

  Stop Docker Services

  cd /mnt/c/Users/ibm/Documents/GPSTrucksJapan
  docker-compose down

  📋 Quick Reference

  Current Status Check:
  curl http://localhost:3000      # Frontend
  curl http://localhost:3002/health  # Backend health
  curl http://localhost:3001      # Admin

  Log Viewing:
  # View logs in real-time
  tail -f /mnt/c/Users/ibm/Documents/GPSTrucksJapan/backend/logs/app.log

  Save these commands for easy reference! The most common ones you'll use are the dev commands for each service.
