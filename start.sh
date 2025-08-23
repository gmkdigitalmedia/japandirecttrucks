#!/bin/bash

echo "🚛 Starting GPS Trucks Japan with Docker..."
echo "=========================================="

# Create images directory if it doesn't exist
mkdir -p images/vehicles

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ GPS Trucks Japan is starting up!"
echo ""
echo "🌐 URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Admin:     http://localhost:3001"
echo "   Backend:   http://localhost:3002"
echo "   Database:  localhost:5432"
echo ""
echo "🔧 Useful Commands:"
echo "   docker-compose logs frontend  # View frontend logs"
echo "   docker-compose logs backend   # View backend logs"
echo "   docker-compose restart frontend  # Restart frontend only"
echo "   docker-compose down           # Stop everything"
echo ""
echo "⏱️  Services are starting... Please wait 30-60 seconds for full startup"