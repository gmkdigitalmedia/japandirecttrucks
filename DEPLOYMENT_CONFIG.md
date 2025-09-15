# GPS Trucks Japan - Deployment Configuration

## Current Deployment Status (as of Sep 15, 2025)

### Google Cloud VM
- **IP Address**: 34.29.174.102
- **Zone**: us-central1-a
- **Name**: gps-trucks-vm
- **Status**: Running with Docker containers

### Services Running

#### Frontend (Next.js)
- **Container**: gp_frontend_1
- **Port**: 80 (public)
- **Internal Port**: 3000
- **Status**: ✅ Working

#### Backend (Node.js/Express)
- **Container**: gp_backend_1
- **Port**: 3002 (public)
- **Internal Port**: 8000
- **Status**: ✅ Working

#### Database (PostgreSQL)
- **Container**: gp_postgres_1
- **Port**: 5432 (public - restricted by firewall)
- **Database**: gps_trucks_japan
- **Username**: gp
- **Password**: Megumi12
- **Total Vehicles**: 4,198
- **Status**: ✅ Working

### URLs for Production (Cloudflare)

When moving to Cloudflare/production domain:

1. **Frontend Environment Variables to Update**:
   - `NEXT_PUBLIC_API_URL`: Change from `http://34.29.174.102:3002` to `https://japandirecttrucks.com`

2. **Backend CORS Configuration** (in simple-server.js):
   ```javascript
   origin: [
     'https://japandirecttrucks.com',
     'https://www.japandirecttrucks.com'
   ]
   ```

3. **Current Hardcoded References**:
   - ✅ Frontend: All API calls use `/api` proxy (correct)
   - ✅ SEO/Meta tags: Use japandirecttrucks.com (correct for production)
   - ⚠️ utils.ts: Has fallback to `34.29.174.102:3002` (update for production)

### Database Access

#### Database Location
- **Service**: PostgreSQL 15 (Alpine Linux)
- **Running in**: Docker container on Google Cloud VM
- **Company**: Google Cloud Platform (Compute Engine)
- **Container Name**: gp_postgres_1
- **Data Storage**: Docker volume on VM disk
- **Connection**: Direct TCP/IP on port 5432 (protected by firewall)

#### From Scrapers (Local Machine)
```python
# Remote connection string for scrapers
DATABASE_URL = "postgresql://gp:Megumi12@34.29.174.102:5432/gps_trucks_japan"
```

**Files created for remote operations**:
- `scrapers/universal_scraper_remote.py` - Scraper that updates remote DB
- `scrapers/check_data_remote.py` - Check remote DB contents
- `real_ai_analyzer_remote.py` - AI description generator for remote DB

#### AI Description Generation
There are multiple AI analyzer scripts:

1. **`ai_analyzer_continuous.py`** (Main production script)
   - **Model**: GPT-3.5-turbo (cheaper - $0.50 per 1M tokens)
   - **Function**: Runs continuously, monitoring for new vehicles
   - **Uses**: Environment variables for configuration

2. **`real_ai_analyzer.py`** / `real_ai_analyzer_remote.py`
   - **Model**: GPT-4o-mini (higher quality - $2.50 per 1M tokens)
   - **Function**: Can be run manually for better descriptions
   - **Features**: More detailed market analysis

3. **`scrapers/ai_vehicle_analyzer.py`**
   - **No AI**: Uses calculations only (no OpenAI)
   - **Function**: Generates competitive advantage analysis
   - **Features**: Calculates USA market prices and mileage comparisons

All scripts:
- Calculate USA market prices and savings
- Create sales-oriented descriptions
- Process vehicles automatically when added to database
- Include market analysis and export benefits

#### Firewall Rules
- **allow-postgres-scraper**: Allows PostgreSQL (5432) from 211.7.120.148 (your IP)
- **http-server**: Allows HTTP (80) and custom ports from anywhere

### Authentication System
- ✅ Registration endpoint: `/api/auth/register`
- ✅ Login endpoint: `/api/auth/login`
- ✅ JWT authentication working
- ✅ Favorites system working

### Features Status
- ✅ Vehicle listing pages
- ✅ Vehicle detail pages
- ✅ Search and filters
- ✅ User registration/login
- ✅ Favorites (save/remove vehicles)
- ✅ WhatsApp integration
- ✅ Multi-language support

### To-Do for Production Launch

1. **Update DNS**:
   - Point japandirecttrucks.com to Cloudflare
   - Configure Cloudflare proxy to VM IP

2. **Update Environment Variables**:
   - Change all references from VM IP to production domain
   - Update CORS settings for production domain

3. **SSL/HTTPS**:
   - Configure Cloudflare SSL
   - Update all http:// references to https://

4. **Database Backup**:
   - Latest backup: `database/database_backup_20250915.sql`
   - Set up automated backups

5. **Monitoring**:
   - Set up uptime monitoring
   - Configure error logging

### Important Commands

```bash
# SSH to VM
gcloud compute ssh gps-trucks-vm --zone=us-central1-a

# Check containers
sudo docker ps

# View logs
sudo docker logs gp_frontend_1
sudo docker logs gp_backend_1
sudo docker logs gp_postgres_1

# Restart services
sudo docker restart gp_frontend_1
sudo docker restart gp_backend_1

# Database access from local
PGPASSWORD=Megumi12 psql -h 34.29.174.102 -U gp -d gps_trucks_japan

# Run remote scraper
cd scrapers
python3 universal_scraper_remote.py

# Check remote data
python3 check_data_remote.py
```

### Git Branches
- **production**: Current deployment branch
- **development**: Main development branch

### Notes
- All sensitive files (.env, keys) are gitignored
- Database has 4,198 vehicles with images
- Scraper can update remote DB directly
- Favorites require user login