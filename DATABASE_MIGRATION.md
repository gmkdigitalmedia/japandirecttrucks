# Database Migration Guide - Schema Compatibility Issues

## ⚠️ CRITICAL ISSUE: Schema Incompatibility
The GCP production database has evolved and now has **significant schema differences** from the local development version that prevent direct import.

## Detailed Schema Problems Discovered:

### 1. Missing Columns in Local Database
The GCP database has additional columns that don't exist locally:
- `ai_description` (text) - AI-generated vehicle descriptions
- `seo_metadata` (jsonb) - SEO data for vehicle pages
- `search_vector` (tsvector) - Full-text search indexing
- `seo_updated_at` (timestamp) - SEO generation timestamps

### 2. Column Constraint Differences
- **`vehicle_images.local_path`**: Required NOT NULL locally, but NULL in GCP data
- **Data types**: Some columns have different constraints between environments

### 3. Import Failure Symptoms
```bash
# Direct import fails with:
ERROR: extra data after last expected column
ERROR: column "ai_description" of relation "vehicles" does not exist
ERROR: null value in column "local_path" violates not-null constraint
```

### 4. Vehicle Count Discrepancy
- **GCP Production**: 5,289+ vehicles (includes Sept 16-17 scraping)
- **Local Development**: 4,198 vehicles (through Aug 26 only)
- **Missing Data**: ~1,091 vehicles from recent scraping sessions

## Solutions for New PC Deployment:

### Option A: Schema Migration (Advanced)
```bash
# 1. Add missing columns to local schema:
docker exec gps-trucks-db psql -U postgres -d gps_trucks_japan -c "
ALTER TABLE vehicles
ADD COLUMN ai_description text,
ADD COLUMN seo_metadata jsonb,
ADD COLUMN seo_updated_at timestamp without time zone,
ADD COLUMN search_vector tsvector;

ALTER TABLE vehicle_images
ALTER COLUMN local_path DROP NOT NULL;
"

# 2. Then try importing GCP data:
docker run --rm -e PGPASSWORD=Megumi12 postgres:15-alpine pg_dump \
  -h 34.29.174.102 -U gp -d gps_trucks_japan > gcp_full_backup.sql
docker exec -i gps-trucks-db psql -U gp -d gps_trucks_japan < gcp_full_backup.sql
```

### Option B: Scraper Population (Recommended)
```bash
# 1. Start with clean local database (0 vehicles)
docker-compose up -d

# 2. Run your vehicle scraper locally
# This will populate ~5,289+ vehicles with correct schema
# Ensures compatibility and gets latest data
```

### Option C: Partial Import (Compromise)
```bash
# Get just the older vehicles that match local schema
# Skip the newer vehicles with incompatible data
# Results in ~4,200 vehicles instead of 5,289+
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