# Japan Direct Trucks - Local Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Git installed
- Internet connection for database download

## Step 1: Clone Repository
```bash
git clone https://github.com/gmkdigitalmedia/japandirecttrucks.git
cd japandirecttrucks
git checkout production
```

## Step 2: Start Infrastructure
```bash
# Start PostgreSQL, Redis, and Backend
docker-compose up -d postgres redis backend
```

## Step 3: Download Database from GCP
```bash
# Create fresh database backup from GCP (5,289+ vehicles)
docker run --rm -e PGPASSWORD=Megumi12 postgres:15-alpine pg_dump \
  -h 34.29.174.102 -U gp -d gps_trucks_japan > database_backup.sql

# Wait for PostgreSQL to be ready (about 10 seconds)
sleep 10

# Import database to local PostgreSQL
docker exec -i gps-trucks-db psql -U gp -d gps_trucks_japan < database_backup.sql
```

## Step 4: Start Frontend
```bash
docker-compose up -d frontend
```

## Step 5: Verify Deployment
- **Website**: http://localhost:3000
- **API**: http://localhost:3002/api/vehicles?limit=5
- **Database**: Should have 5,000+ vehicles

## Features Included
✅ 5,289+ vehicles from production database
✅ Loading animations and progress bars
✅ Page transition spinners
✅ Vehicle search with loading states
✅ Image loading optimizations
✅ All API endpoints functional

## Troubleshooting

### Database Connection Issues
If you can't connect to GCP database:
```bash
# Check if GCP VM is running
ping 34.29.174.102

# Verify PostgreSQL is accessible
docker run --rm -e PGPASSWORD=Megumi12 postgres:15-alpine psql \
  -h 34.29.174.102 -U gp -d gps_trucks_japan -c "SELECT COUNT(*) FROM vehicles;"
```

### Container Issues
```bash
# Check container status
docker-compose ps

# View container logs
docker logs gps-trucks-frontend
docker logs gps-trucks-backend
docker logs gps-trucks-db
```

### Reset Everything
```bash
# Stop all containers
docker-compose down

# Remove database volume (WARNING: deletes all data)
docker volume rm gps-trucks-postgres-data

# Start fresh
docker-compose up -d
```

## Database Credentials
- **Host**: 34.29.174.102 (GCP) or localhost (local)
- **Username**: gp
- **Password**: Megumi12
- **Database**: gps_trucks_japan
- **Port**: 5432

## Notes
- The GCP database is the source of truth with latest vehicles
- Local database will have whatever was imported
- Backend automatically detects and reports vehicle count on startup
- Frontend uses environment-specific API URLs (localhost vs production)