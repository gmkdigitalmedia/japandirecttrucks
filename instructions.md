# Japanese Car Export Platform - Complete Development Specification

## Project Overview
Build a comprehensive car export platform that clones CarSensor.net's functionality but focuses on Japanese car exports with American English service. The platform consists of a React frontend, Node.js backend, PostgreSQL database, Python scrapers, and a comprehensive admin panel.

## Domain & Branding
- **Domain**: cars.xupra.ai (main site), admin.xupra.ai (admin panel)
- **Brand**: "American Car Hunter in Japan"
- **USP**: English-speaking American service for Japanese car exports
- **Focus**: Land Cruisers, luxury SUVs, commercial vehicles

## Technical Stack
```
Frontend: React 18 + TypeScript + Tailwind CSS
Backend: Node.js + Express + TypeScript
Database: PostgreSQL with detailed schema
Scrapers: Python + Playwright + BeautifulSoup
Images: Self-hosted with local processing
Admin: React admin panel with full CRUD
Hosting: Self-hosted on user's powerful hardware
```

## Database Schema

### Core Tables

```sql
-- Companies/Manufacturers
CREATE TABLE manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_path VARCHAR(255),
    country VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle Models
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    name VARCHAR(100) NOT NULL,
    body_type VARCHAR(50), -- SUV, Sedan, Truck, etc.
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Main Vehicles Table (Based on CarSensor Analysis)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255) UNIQUE, -- CarSensor ID for updates
    source_url TEXT,
    source_site VARCHAR(50), -- 'carsensor', 'goonet', etc.
    
    -- Identity
    manufacturer_id INTEGER REFERENCES manufacturers(id),
    model_id INTEGER REFERENCES models(id),
    title_description TEXT NOT NULL,
    grade VARCHAR(255), -- '4.7 4WD Multi-less'
    body_style VARCHAR(100), -- 'Cross-country/SUV'
    
    -- Pricing (stored as integers for precision)
    price_vehicle_yen INTEGER NOT NULL,
    price_total_yen INTEGER NOT NULL,
    price_misc_expenses_yen INTEGER GENERATED ALWAYS AS (price_total_yen - price_vehicle_yen) STORED,
    monthly_payment_yen INTEGER,
    
    -- Core Specifications
    model_year_ad INTEGER NOT NULL,
    model_year_era VARCHAR(10), -- 'H18', 'R02'
    mileage_km INTEGER NOT NULL,
    color VARCHAR(100),
    transmission_details VARCHAR(100),
    engine_displacement_cc INTEGER,
    fuel_type VARCHAR(50),
    drive_type VARCHAR(20), -- 4WD, 2WD, AWD
    
    -- Boolean Flags
    has_repair_history BOOLEAN NOT NULL,
    is_one_owner BOOLEAN DEFAULT FALSE,
    has_warranty BOOLEAN NOT NULL,
    is_accident_free BOOLEAN DEFAULT TRUE,
    
    -- Detailed Information
    warranty_details TEXT,
    maintenance_details TEXT,
    shaken_status TEXT, -- Vehicle inspection status
    equipment_details TEXT,
    
    -- Location & Dealer
    dealer_name VARCHAR(512),
    location_prefecture VARCHAR(100),
    location_city VARCHAR(100),
    dealer_phone VARCHAR(50),
    
    -- Status & Management
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    export_status VARCHAR(50) DEFAULT 'available', -- available, reserved, sold, shipped
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_scraped_at TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            title_description || ' ' || 
            COALESCE(grade, '') || ' ' || 
            COALESCE(color, '')
        )
    ) STORED
);

-- Vehicle Images (Self-hosted)
CREATE TABLE vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    original_url TEXT, -- Source URL from scraping
    local_path VARCHAR(512) NOT NULL, -- /images/vehicles/123/image_1.jpg
    filename VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    file_size INTEGER,
    image_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tags/Features
CREATE TABLE vehicle_tags (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    tag_category VARCHAR(50), -- 'feature', 'condition', 'dealer_special'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Inquiries/Leads
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    customer_country VARCHAR(100),
    message TEXT,
    inquiry_type VARCHAR(50) DEFAULT 'general', -- general, quote, inspection
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, quoted, closed
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_vehicles_search ON vehicles USING GIN(search_vector);
CREATE INDEX idx_vehicles_manufacturer_model ON vehicles(manufacturer_id, model_id);
CREATE INDEX idx_vehicles_price ON vehicles(price_total_yen);
CREATE INDEX idx_vehicles_year_mileage ON vehicles(model_year_ad, mileage_km);
CREATE INDEX idx_vehicles_available ON vehicles(is_available, export_status);
CREATE INDEX idx_vehicles_featured ON vehicles(is_featured, is_available);
```

## Frontend Components Structure

### Public Website (cars.xupra.ai)

#### Homepage Components
```jsx
// pages/index.js - Homepage
- HeroSection: Search bar + featured messaging
- FeaturedVehicles: 6-8 premium Land Cruisers
- BrowseByCategory: SUVs, Trucks, Luxury, Commercial
- TrustSignals: American service, years in Japan, testimonials
- ProcessSteps: How export process works
- RecentlyAdded: Latest inventory updates

// components/HeroSection.js
interface HeroSectionProps {
  featuredCount: number;
  totalInventory: number;
}
```

#### Vehicle Listing Components
```jsx
// pages/vehicles/index.js - Main listing page
- SearchFilters: Live search with manufacturer, model, price, year
- VehicleGrid: Responsive grid of vehicle cards
- Pagination: Handle large result sets
- SortOptions: Price, year, mileage, newest first

// components/VehicleCard.js
interface VehicleCardProps {
  vehicle: {
    id: number;
    title_description: string;
    price_total_yen: number;
    price_vehicle_yen: number;
    model_year_ad: number;
    mileage_km: number;
    color: string;
    location_prefecture: string;
    dealer_name: string;
    primary_image: string;
    has_repair_history: boolean;
    is_one_owner: boolean;
  };
}

// Features:
- Image hover effects (cycle through multiple images)
- Price in yen + USD conversion
- Key specs display
- "Export Ready" badge
- WhatsApp inquiry button
- Favorite/save functionality
```

#### Vehicle Detail Page
```jsx
// pages/vehicles/[id].js
- ImageGallery: Main image + thumbnail grid
- VehicleSpecs: Complete specifications table
- PriceBreakdown: Vehicle price + estimated export costs
- DealerInfo: Location, contact details
- InquiryForm: WhatsApp + email contact options
- SimilarVehicles: Related vehicles
- ExportCalculator: Shipping cost estimator

// components/ImageGallery.js
- Full-screen image viewing
- Zoom functionality
- Thumbnail navigation
- Image loading optimization

// components/ExportCalculator.js
- Country selection
- Shipping method (RoRo vs Container)
- Total cost estimation
- Timeline estimation
```

#### Reactive Features Implementation
```jsx
// Custom hooks for reactive functionality
const useVehicleSearch = (filters) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Debounced search API call
    const searchVehicles = debounce(async () => {
      setLoading(true);
      const response = await fetch('/api/vehicles/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      const data = await response.json();
      setVehicles(data.vehicles);
      setTotal(data.total);
      setLoading(false);
    }, 300);

    searchVehicles();
  }, [filters]);

  return { vehicles, loading, total };
};

// Live price conversion
const useCurrencyConverter = (yenAmount) => {
  const [usdAmount, setUsdAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(150);

  useEffect(() => {
    // Fetch current exchange rate
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => setExchangeRate(data.rate));
  }, []);

  useEffect(() => {
    setUsdAmount(Math.round(yenAmount / exchangeRate));
  }, [yenAmount, exchangeRate]);

  return { usdAmount, exchangeRate };
};
```

## Admin Panel (admin.xupra.ai)

### Admin Dashboard
```jsx
// admin/pages/dashboard.js
- Statistics Overview: Total vehicles, inquiries, recent activity
- Quick Actions: Add vehicle, view inquiries, scraper status
- Recent Activity Feed
- Performance Metrics: Popular models, inquiry conversion

// admin/components/StatsCards.js
- Total Inventory Count
- Available vs Sold
- Inquiries This Month
- Revenue Pipeline
- Top Performing Models
```

### Vehicle Management
```jsx
// admin/pages/vehicles/index.js
- VehicleDataTable: Sortable, filterable table
- Bulk Actions: Delete, change status, export data
- Search and Advanced Filters
- Import from CSV functionality

// admin/pages/vehicles/add.js
- VehicleForm: Complete form for manual entry
- ImageUpload: Drag and drop with preview
- SpecsInput: Structured input for all specifications
- PreviewMode: See how it will appear on public site

// admin/pages/vehicles/[id]/edit.js
- Edit existing vehicle
- Image management (add, remove, reorder)
- Inquiry history for this vehicle
- Export status tracking
```

### Image Management System
```jsx
// admin/components/ImageManager.js
interface ImageManagerProps {
  vehicleId: number;
  images: VehicleImage[];
  onImagesUpdate: (images: VehicleImage[]) => void;
}

// Features:
- Drag and drop upload
- Image reordering (set primary image)
- Bulk image processing
- Automatic resizing and optimization
- Alt text management
- Source URL tracking
```

### Company/Manufacturer Management
```jsx
// admin/pages/manufacturers/index.js
- ManufacturerList: All manufacturers with vehicle counts
- AddManufacturer: Form for new manufacturers
- LogoUpload: Brand logo management

// admin/pages/models/index.js
- ModelsByManufacturer: Organized model list
- AddModel: New model form
- PopularModels: Toggle popular status for homepage features
```

### Inquiry Management
```jsx
// admin/pages/inquiries/index.js
- InquiryList: All customer inquiries
- StatusFilters: New, contacted, quoted, closed
- QuickResponse: Template responses
- CustomerHistory: Previous inquiries from same customer

// admin/components/InquiryDetail.js
- Customer information
- Vehicle details
- Response history
- Quick actions (call, email, WhatsApp)
```

### Scraper Management
```jsx
// admin/pages/scrapers/index.js
- ScraperStatus: Current running status
- ScheduleManagement: Set scraping schedules
- ErrorLogs: View scraping errors
- DataStats: Items scraped, success rates

// admin/components/ScraperControl.js
- Start/stop individual scrapers
- View real-time scraping progress
- Configure scraping parameters
- Manual scraping triggers
```

## Python Scraper Implementation

### Main Scraper Architecture
```python
# scrapers/main.py
import asyncio
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import psycopg2
from typing import List, Dict
import logging
import time
import random
from urllib.parse import urljoin, urlparse
import requests
import os
from PIL import Image

class CarSensorScraper:
    def __init__(self, db_config: Dict):
        self.db_config = db_config
        self.base_url = "https://www.carsensor.net"
        self.session = requests.Session()
        self.logger = self.setup_logging()
        
    async def scrape_land_cruisers(self):
        """Main scraping method for Land Cruisers and SUVs"""
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Configure browser to look human
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            # Target URLs for different vehicle types
            target_searches = [
                {
                    'name': 'Land Cruiser',
                    'url': '/usedcar/search/?STID=CS210610&MD=TO077',
                    'max_pages': 20
                },
                {
                    'name': 'Land Cruiser Prado', 
                    'url': '/usedcar/search/?STID=CS210610&MD=TO078',
                    'max_pages': 15
                },
                {
                    'name': 'Luxury SUVs',
                    'url': '/usedcar/search/?STID=CS210610&CAT=1&CARC=SUV',
                    'max_pages': 10
                }
            ]
            
            for search in target_searches:
                await self.scrape_vehicle_category(page, search)
                
            await browser.close()
    
    async def scrape_vehicle_category(self, page, search_config):
        """Scrape a specific category of vehicles"""
        base_url = self.base_url + search_config['url']
        vehicle_urls = []
        
        # Phase 1: Collect all vehicle URLs
        for page_num in range(1, search_config['max_pages'] + 1):
            try:
                url = f"{base_url}&P={page_num}"
                await page.goto(url, wait_until='networkidle')
                
                # Extract vehicle URLs from listing page
                links = await page.query_selector_all('a[href*="/usedcar/detail/"]')
                for link in links:
                    href = await link.get_attribute('href')
                    if href:
                        full_url = urljoin(self.base_url, href)
                        vehicle_urls.append(full_url)
                
                # Human-like delay
                await asyncio.sleep(random.uniform(2, 4))
                
            except Exception as e:
                self.logger.error(f"Error on page {page_num}: {e}")
                continue
        
        # Phase 2: Scrape detailed data for each vehicle
        for i, vehicle_url in enumerate(vehicle_urls):
            try:
                await self.scrape_vehicle_detail(page, vehicle_url)
                
                # Progress logging
                if i % 10 == 0:
                    self.logger.info(f"Processed {i}/{len(vehicle_urls)} vehicles")
                
                # Respectful delay
                await asyncio.sleep(random.uniform(3, 6))
                
            except Exception as e:
                self.logger.error(f"Error scraping {vehicle_url}: {e}")
                continue
    
    async def scrape_vehicle_detail(self, page, vehicle_url):
        """Extract detailed information from individual vehicle page"""
        await page.goto(vehicle_url, wait_until='networkidle')
        
        # Wait for critical elements to load
        await page.wait_for_selector('.title_detail', timeout=10000)
        
        # Extract source ID from URL
        source_id = self.extract_source_id(vehicle_url)
        
        vehicle_data = {
            'source_id': source_id,
            'source_url': vehicle_url,
            'source_site': 'carsensor'
        }
        
        # Extract title and basic info
        title_element = await page.query_selector('.title_detail')
        if title_element:
            vehicle_data['title_description'] = await title_element.inner_text()
        
        # Extract pricing information
        await self.extract_pricing(page, vehicle_data)
        
        # Extract specifications from table
        await self.extract_specifications(page, vehicle_data)
        
        # Extract dealer and location info
        await self.extract_dealer_info(page, vehicle_data)
        
        # Extract and download images
        await self.extract_and_download_images(page, vehicle_data)
        
        # Save to database
        await self.save_vehicle_to_db(vehicle_data)
    
    async def extract_pricing(self, page, vehicle_data):
        """Extract pricing information"""
        try:
            # Total payment amount
            total_price_element = await page.query_selector('.price_total')
            if total_price_element:
                price_text = await total_price_element.inner_text()
                # Convert "312.9万円" to 3129000
                price_clean = price_text.replace('万円', '').replace(',', '')
                vehicle_data['price_total_yen'] = int(float(price_clean) * 10000)
            
            # Vehicle price
            vehicle_price_element = await page.query_selector('.price_main')
            if vehicle_price_element:
                price_text = await vehicle_price_element.inner_text()
                price_clean = price_text.replace('万円', '').replace(',', '')
                vehicle_data['price_vehicle_yen'] = int(float(price_clean) * 10000)
            
            # Monthly payment (optional)
            monthly_element = await page.query_selector('.monthly_payment')
            if monthly_element:
                monthly_text = await monthly_element.inner_text()
                monthly_clean = monthly_text.replace('円', '').replace(',', '')
                vehicle_data['monthly_payment_yen'] = int(monthly_clean)
                
        except Exception as e:
            self.logger.error(f"Error extracting pricing: {e}")
    
    async def extract_specifications(self, page, vehicle_data):
        """Extract vehicle specifications from the specs table"""
        try:
            spec_rows = await page.query_selector_all('table.specList tr')
            
            for row in spec_rows:
                header_element = await row.query_selector('th')
                value_element = await row.query_selector('td')
                
                if not header_element or not value_element:
                    continue
                
                header = await header_element.inner_text()
                value = await value_element.inner_text()
                
                # Parse different specification types
                if '年式' in header:  # Model year
                    # "2003(H15)" -> year: 2003, era: H15
                    if '(' in value:
                        year_str = value.split('(')[0]
                        era_str = value.split('(')[1].replace(')', '')
                        vehicle_data['model_year_ad'] = int(year_str)
                        vehicle_data['model_year_era'] = era_str
                    else:
                        vehicle_data['model_year_ad'] = int(value)
                
                elif '走行距離' in header:  # Mileage
                    # "7.0万km" -> 70000
                    if '万km' in value:
                        km_str = value.replace('万km', '')
                        vehicle_data['mileage_km'] = int(float(km_str) * 10000)
                
                elif '修復歴' in header:  # Repair history
                    vehicle_data['has_repair_history'] = 'あり' in value
                
                elif '車検' in header:  # Vehicle inspection
                    vehicle_data['shaken_status'] = value
                
                elif 'ミッション' in header or '変速機' in header:  # Transmission
                    vehicle_data['transmission_details'] = value
                
                elif '排気量' in header:  # Engine displacement
                    # "4700cc" -> 4700
                    displacement_str = value.replace('cc', '').replace(',', '')
                    if displacement_str.isdigit():
                        vehicle_data['engine_displacement_cc'] = int(displacement_str)
                
                elif '色' in header or 'カラー' in header:  # Color
                    vehicle_data['color'] = value
                
                elif '燃料' in header:  # Fuel type
                    vehicle_data['fuel_type'] = value
                
                elif '駆動' in header:  # Drive type
                    vehicle_data['drive_type'] = value
                
                elif 'グレード' in header:  # Grade
                    vehicle_data['grade'] = value
                
                elif '保証' in header:  # Warranty
                    vehicle_data['has_warranty'] = 'あり' in value or '保証付' in value
                    vehicle_data['warranty_details'] = value
                
                elif '整備' in header:  # Maintenance
                    vehicle_data['maintenance_details'] = value
                    
        except Exception as e:
            self.logger.error(f"Error extracting specifications: {e}")
    
    async def extract_dealer_info(self, page, vehicle_data):
        """Extract dealer and location information"""
        try:
            # Dealer name
            dealer_element = await page.query_selector('.dealer_name, .shop_name')
            if dealer_element:
                vehicle_data['dealer_name'] = await dealer_element.inner_text()
            
            # Location
            location_element = await page.query_selector('.location, .address')
            if location_element:
                location_text = await location_element.inner_text()
                # Parse "愛知県 小牧市" -> prefecture: 愛知県, city: 小牧市
                location_parts = location_text.split()
                if len(location_parts) >= 1:
                    vehicle_data['location_prefecture'] = location_parts[0]
                if len(location_parts) >= 2:
                    vehicle_data['location_city'] = location_parts[1]
            
            # Phone number
            phone_element = await page.query_selector('.phone_number')
            if phone_element:
                vehicle_data['dealer_phone'] = await phone_element.inner_text()
                
        except Exception as e:
            self.logger.error(f"Error extracting dealer info: {e}")
    
    async def extract_and_download_images(self, page, vehicle_data):
        """Extract image URLs and download them locally"""
        try:
            # Find all gallery images
            image_elements = await page.query_selector_all('.gallery_thum img, .image_gallery img')
            image_data = []
            
            for i, img_element in enumerate(image_elements):
                src = await img_element.get_attribute('src')
                if not src:
                    continue
                
                # Convert thumbnail URL to full-size image
                # CarSensor often uses _s.jpg for thumbnails
                full_size_url = src.replace('_s.jpg', '.jpg').replace('_thumb.jpg', '.jpg')
                
                # Download and save image
                local_path = await self.download_image(
                    full_size_url, 
                    vehicle_data['source_id'], 
                    i,
                    is_primary=(i == 0)
                )
                
                if local_path:
                    image_data.append({
                        'original_url': full_size_url,
                        'local_path': local_path,
                        'is_primary': i == 0,
                        'image_order': i
                    })
            
            vehicle_data['images'] = image_data
            
        except Exception as e:
            self.logger.error(f"Error extracting images: {e}")
    
    async def download_image(self, image_url, vehicle_source_id, image_index, is_primary=False):
        """Download image and save locally with optimization"""
        try:
            # Create directory structure
            vehicle_dir = f"public/images/vehicles/{vehicle_source_id}"
            os.makedirs(vehicle_dir, exist_ok=True)
            
            # Download image
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Determine file extension
            file_extension = image_url.split('.')[-1].lower()
            if file_extension not in ['jpg', 'jpeg', 'png', 'webp']:
                file_extension = 'jpg'
            
            # Generate filename
            if is_primary:
                filename = f"main.{file_extension}"
            else:
                filename = f"image_{image_index + 1}.{file_extension}"
            
            file_path = os.path.join(vehicle_dir, filename)
            
            # Save original
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            # Create optimized versions
            await self.optimize_image(file_path)
            
            # Return relative path for database storage
            return f"/images/vehicles/{vehicle_source_id}/{filename}"
            
        except Exception as e:
            self.logger.error(f"Error downloading image {image_url}: {e}")
            return None
    
    async def optimize_image(self, file_path):
        """Create optimized versions of images"""
        try:
            with Image.open(file_path) as img:
                # Create thumbnail (300x200)
                thumb_path = file_path.replace('.', '_thumb.')
                thumb = img.copy()
                thumb.thumbnail((300, 200), Image.Resampling.LANCZOS)
                thumb.save(thumb_path, optimize=True, quality=85)
                
                # Create medium size (800x600)
                medium_path = file_path.replace('.', '_medium.')
                medium = img.copy()
                medium.thumbnail((800, 600), Image.Resampling.LANCZOS)
                medium.save(medium_path, optimize=True, quality=90)
                
                # Optimize original
                img.save(file_path, optimize=True, quality=95)
                
        except Exception as e:
            self.logger.error(f"Error optimizing image {file_path}: {e}")
    
    async def save_vehicle_to_db(self, vehicle_data):
        """Save vehicle data to PostgreSQL with UPSERT"""
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            
            # UPSERT vehicle data
            insert_query = """
            INSERT INTO vehicles (
                source_id, source_url, source_site, title_description,
                price_vehicle_yen, price_total_yen, monthly_payment_yen,
                model_year_ad, model_year_era, mileage_km, grade, color,
                transmission_details, engine_displacement_cc, fuel_type, drive_type,
                has_repair_history, has_warranty, warranty_details, maintenance_details,
                shaken_status, dealer_name, location_prefecture, location_city,
                dealer_phone, last_scraped_at
            ) VALUES (
                %(source_id)s, %(source_url)s, %(source_site)s, %(title_description)s,
                %(price_vehicle_yen)s, %(price_total_yen)s, %(monthly_payment_yen)s,
                %(model_year_ad)s, %(model_year_era)s, %(mileage_km)s, %(grade)s, %(color)s,
                %(transmission_details)s, %(engine_displacement_cc)s, %(fuel_type)s, %(drive_type)s,
                %(has_repair_history)s, %(has_warranty)s, %(warranty_details)s, %(maintenance_details)s,
                %(shaken_status)s, %(dealer_name)s, %(location_prefecture)s, %(location_city)s,
                %(dealer_phone)s, NOW()
            )
            ON CONFLICT (source_id) DO UPDATE SET
                price_vehicle_yen = EXCLUDED.price_vehicle_yen,
                price_total_yen = EXCLUDED.price_total_yen,
                is_available = CASE 
                    WHEN EXCLUDED.price_vehicle_yen IS NOT NULL THEN TRUE 
                    ELSE FALSE 
                END,
                last_scraped_at = NOW()
            RETURNING id;
            """
            
            cursor.execute(insert_query, vehicle_data)
            vehicle_id = cursor.fetchone()[0]
            
            # Save images
            if 'images' in vehicle_data:
                for image_data in vehicle_data['images']:
                    image_query = """
                    INSERT INTO vehicle_images (
                        vehicle_id, original_url, local_path, filename, 
                        is_primary, image_order
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (vehicle_id, local_path) DO NOTHING;
                    """
                    
                    filename = os.path.basename(image_data['local_path'])
                    cursor.execute(image_query, (
                        vehicle_id,
                        image_data['original_url'],
                        image_data['local_path'],
                        filename,
                        image_data['is_primary'],
                        image_data['image_order']
                    ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            self.logger.info(f"Saved vehicle {vehicle_data['source_id']} to database")
            
        except Exception as e:
            self.logger.error(f"Error saving to database: {e}")

# Scheduler for automated scraping
class ScrapingScheduler:
    def __init__(self):
        self.scrapers = {
            'carsensor': CarSensorScraper(db_config),
            'goonet': GoonetScraper(db_config),  # Implement similar to CarSensor
        }
    
    async def run_daily_scraping(self):
        """Run all scrapers on schedule"""
        for scraper_name, scraper in self.scrapers.items():
            try:
                self.logger.info(f"Starting {scraper_name} scraper")
                await scraper.scrape_land_cruisers()
                self.logger.info(f"Completed {scraper_name} scraper")
            except Exception as e:
                self.logger.error(f"Error in {scraper_name} scraper: {e}")

# Main execution
if __name__ == "__main__":
    db_config = {
        'host': 'localhost',
        'database': 'car_export',
        'user': 'postgres',
        'password': 'your_password'
    }
    
    scheduler = ScrapingScheduler()
    asyncio.run(scheduler.run_daily_scraping())
```

## Backend API Endpoints

### Core API Structure
```typescript
// backend/src/routes/vehicles.ts
import express from 'express';
import { VehicleService } from '../services/VehicleService';

const router = express.Router();
const vehicleService = new VehicleService();

// Public endpoints
router.get('/search', async (req, res) => {
  const {
    query,
    manufacturer,
    model,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;
  
  const filters = {
    query: query as string,
    manufacturer: manufacturer as string,
    model: model as string,
    priceRange: [parseInt(minPrice as string), parseInt(maxPrice as string)],
    yearRange: [parseInt(minYear as string), parseInt(maxYear as string)],
    pagination: { page: parseInt(page as string), limit: parseInt(limit as string) },
    sort: { field: sortBy as string, order: sortOrder as string }
  };
  
  try {
    const result = await vehicleService.searchVehicles(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(parseInt(req.params.id));
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const similar = await vehicleService.getSimilarVehicles(parseInt(req.params.id));
    res.json(similar);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch similar vehicles' });
  }
});

// Admin endpoints (with authentication middleware)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(parseInt(req.params.id), req.body);
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Image upload endpoint
router.post('/:id/images', authenticateAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const images = await vehicleService.addVehicleImages(
      parseInt(req.params.id), 
      req.files as Express.Multer.File[]
    );
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

export default router;
```

## File Structure
```
car-export-platform/
├── frontend/                 # React app (cars.xupra.ai)
│   ├── public/
│   │   └── images/
│   │       └── vehicles/     # Self-hosted vehicle images
│   ├── src/
│   │   ├── components/
│   │   │   ├── VehicleCard.tsx
│   │   │   ├── VehicleGrid.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   └── ExportCalculator.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx     # Homepage
│   │   │   ├── vehicles/
│   │   │   │   ├── index.tsx # Vehicle listings
│   │   │   │   └── [id].tsx  # Vehicle detail
│   │   │   └── contact.tsx
│   │   ├── hooks/
│   │   │   ├── useVehicleSearch.ts
│   │   │   └── useCurrencyConverter.ts
│   │   └── utils/
│   └── package.json
├── admin/                    # Admin panel (admin.xupra.ai)
│   ├── src/
│   │   ├── components/
│   │   │   ├── VehicleForm.tsx
│   │   │   ├── ImageManager.tsx
│   │   │   └── DataTable.tsx
│   │   ├── pages/
│   │   │   ├── dashboard.tsx
│   │   │   ├── vehicles/
│   │   │   ├── inquiries/
│   │   │   ├── manufacturers/
│   │   │   └── scrapers/
│   │   └── services/
│   └── package.json
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── vehicles.ts
│   │   │   ├── inquiries.ts
│   │   │   ├── manufacturers.ts
│   │   │   └── admin.ts
│   │   ├── services/
│   │   │   ├── VehicleService.ts
│   │   │   ├── ImageService.ts
│   │   │   └── EmailService.ts
│   │   ├── models/
│   │   └── utils/
│   └── package.json
├── scrapers/                 # Python scrapers
│   ├── main.py
│   ├── carsensor_scraper.py
│   ├── goonet_scraper.py
│   ├── image_processor.py
│   └── scheduler.py
├── database/
│   ├── migrations/
│   └── seeds/
└── docker-compose.yml        # For easy deployment
```

## Development Priorities

### Phase 1: Core Infrastructure (Week 1)
1. Set up database with complete schema
2. Build basic React frontend with vehicle listing
3. Implement Node.js API with search endpoints
4. Create admin panel for manual vehicle entry
5. Set up image upload and storage system

### Phase 2: Scraper Integration (Week 2)
1. Build CarSensor scraper with image downloading
2. Implement automated scraping schedule
3. Add scraper monitoring to admin panel
4. Set up data validation and deduplication
5. Create scraper error handling and logging

### Phase 3: Advanced Features (Week 3)
1. Implement live search and filtering
2. Add export cost calculator
3. Build inquiry management system
4. Set up email notifications
5. Add SEO optimization and meta tags

### Phase 4: Production Ready (Week 4)
1. Performance optimization
2. Image optimization and CDN setup
3. Security hardening
4. Backup and monitoring systems
5. Mobile responsive testing

## Key Requirements for Agent

### CRITICAL: Self-Hosted Images
- Download ALL vehicle images from scraped sources
- Store locally in organized directory structure
- Create multiple sizes (thumbnail, medium, full)
- Implement proper image optimization
- Track original source URLs for updates

### Admin Panel Must-Haves
- Complete CRUD for vehicles, manufacturers, models
- Bulk image upload with drag-and-drop
- Scraper status and control dashboard
- Inquiry management with response tracking
- Data export and import capabilities

### SEO & Performance
- Server-side rendering for vehicle detail pages
- Proper meta tags and structured data
- Image lazy loading and optimization
- Fast search with database indexes
- Mobile-first responsive design

### Business Logic
- Automatic USD price conversion
- Export cost calculation by destination country
- Availability status tracking
- Featured vehicle promotion system
- Customer inquiry workflow

This specification provides a complete roadmap for building a professional car export platform that clones CarSensor's functionality while adding export-specific features and American service positioning.