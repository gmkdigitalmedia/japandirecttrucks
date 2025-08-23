#!/bin/bash

echo "🔄 GPS Trucks Japan - Quick Restart"
echo "=================================="

if [ "$1" = "frontend" ]; then
    echo "🔄 Restarting Frontend..."
    docker-compose restart frontend
    echo "✅ Frontend restarted!"
elif [ "$1" = "backend" ]; then
    echo "🔄 Restarting Backend..."
    docker-compose restart backend
    echo "✅ Backend restarted!"
elif [ "$1" = "admin" ]; then
    echo "🔄 Restarting Admin..."
    docker-compose restart admin
    echo "✅ Admin restarted!"
elif [ "$1" = "all" ] || [ "$1" = "" ]; then
    echo "🔄 Restarting All Services..."
    docker-compose restart
    echo "✅ All services restarted!"
else
    echo "Usage: ./restart.sh [frontend|backend|admin|all]"
    echo ""
    echo "Examples:"
    echo "  ./restart.sh frontend  # Restart only frontend"
    echo "  ./restart.sh backend   # Restart only backend" 
    echo "  ./restart.sh           # Restart everything"
fi