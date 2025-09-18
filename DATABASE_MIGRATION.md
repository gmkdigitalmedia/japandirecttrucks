# Database Migration Guide - Safe Schema Handling

## Problem
The GCP database has schema differences that prevent direct import to local containers.

## Solution 1: Use Existing Local Database (Recommended for Quick Deploy)
Your GitHub repo will start with a clean database that gets populated by the backend.

```bash
# Clone and start - database starts empty
git clone https://github.com/gmkdigitalmedia/japandirecttrucks.git
cd japandirecttrucks
git checkout production
docker-compose up -d

# Backend will create schema automatically
# You'll have 0 vehicles but a working site
```

## Solution 2: Copy Only Compatible Data (Advanced)
If you want to transfer just the vehicles data without schema conflicts:

```bash
# Start with clean local database
docker-compose up -d postgres
sleep 10

# Get only the vehicle records that match local schema
docker run --rm -e PGPASSWORD=Megumi12 postgres:15-alpine psql \
  -h 34.29.174.102 -U gp -d gps_trucks_japan \
  -c "SELECT COUNT(*) FROM vehicles;"
# This will tell you how many vehicles are available (5,289+)

# For now, start with local schema and add vehicles via scraper later
```

## Solution 3: Run Local Scraper (Best Long-term)
```bash
# Once your local site is running, run your scraper to populate with fresh data
# This ensures schema compatibility and gets the latest vehicles
```

## Current Database Status
- **Local**: 4,198 vehicles (through Aug 26, 2025)
- **GCP**: 5,289+ vehicles (through Sep 17, 2025)
- **Missing**: ~1,370 vehicles from recent scraping

## Safe Deployment Strategy
1. Deploy with current local database structure (4,198 vehicles)
2. Site will be fully functional with loading animations and all features
3. Run scraper locally to add missing vehicles when ready
4. This avoids schema conflicts and ensures compatibility

## Database Schema Notes
- Local and GCP schemas appear similar but have subtle differences
- Direct imports fail with "extra data after last expected column" errors
- Better to use application-level data sync (scraper) than database-level imports