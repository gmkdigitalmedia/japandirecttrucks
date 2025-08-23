#!/bin/bash

# GPS Trucks Japan Database Setup Script

echo "🚛 Setting up GPS Trucks Japan Database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL or run:"
    echo "   docker-compose up -d postgres"
    exit 1
fi

# Database configuration
DB_NAME="gps_trucks_japan"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "📦 Creating database: $DB_NAME"

# Create database if it doesn't exist
psql -h $DB_HOST -p $DB_PORT -U $DB_USER postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database already exists"

echo "📋 Running database schema..."

# Run schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📊 Database Info:"
    echo "   Host: $DB_HOST:$DB_PORT"
    echo "   Database: $DB_NAME"
    echo "   User: $DB_USER"
    echo ""
    echo "🔐 Default admin user created:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo "   Email: admin@gpstrucksjapan.com"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Start the backend: cd backend && npm install && npm run dev"
    echo "   2. Start the frontend: cd frontend && npm install && npm run dev"
    echo "   3. Start the admin panel: cd admin && npm install && npm run dev"
else
    echo "❌ Database setup failed!"
    exit 1
fi