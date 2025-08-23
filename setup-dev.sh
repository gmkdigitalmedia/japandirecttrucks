#!/bin/bash

# GPS Trucks Japan Development Setup Script

echo "🚛 GPS Trucks Japan - Development Setup"
echo "======================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "🔍 Checking required tools..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ All required tools are available"

# Create logs directory
mkdir -p logs

echo ""
echo "🐳 Starting database and Redis with Docker..."
docker-compose up -d postgres redis

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker-compose exec postgres pg_isready -U postgres >/dev/null 2>&1; do
    echo "⏳ Still waiting for database..."
    sleep 5
done

echo "✅ Database is ready!"

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Install admin dependencies
echo "Installing admin dependencies..."
cd admin && npm install && cd ..

echo ""
echo "🐍 Setting up Python environment for scrapers..."
cd scrapers

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt

# Install playwright browsers
playwright install chromium

cd ..

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev           # Start all services"
echo "   OR run individually:"
echo "   npm run dev:backend   # Backend API (port 3002)"
echo "   npm run dev:frontend  # Public site (port 3000)"
echo "   npm run dev:admin     # Admin panel (port 3001)"
echo ""
echo "🔗 URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Admin:     http://localhost:3001" 
echo "   API:       http://localhost:3002"
echo ""
echo "🗄️ Database:"
echo "   Host: localhost:5432"
echo "   Database: gps_trucks_japan"
echo "   User: postgres"
echo "   Password: postgres123"
echo ""
echo "🧹 To stop services:"
echo "   docker-compose down"