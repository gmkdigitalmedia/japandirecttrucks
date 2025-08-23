#!/usr/bin/env python3
import asyncio
import aiohttp
import asyncpg
import sys
import json
import logging
import re
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'scrapers/logs/generic_scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

class GenericCarSensorScraper:
    def __init__(self, search_url, manufacturer_id, model_id, job_id=None):
        self.search_url = search_url
        self.manufacturer_id = int(manufacturer_id)
        self.model_id = int(model_id)
        self.job_id = int(job_id) if job_id else None
        self.base_url = "https://www.carsensor.net"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.db_pool = None
        self.total_found = 0
        self.total_added = 0
        
    async def connect_db(self):
        """Connect to PostgreSQL database"""
        self.db_pool = await asyncpg.create_pool(
            "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan",
            min_size=1,
            max_size=10
        )
        logging.info("Connected to database")
        
    async def update_job_status(self, status, error_message=None):
        """Update scraper job status in database"""
        if not self.job_id:
            return
            
        async with self.db_pool.acquire() as conn:
            if status == 'completed' or status == 'failed':
                await conn.execute("""
                    UPDATE scraper_jobs 
                    SET status = $1, total_found = $2, total_added = $3, 
                        error_message = $4, completed_at = NOW()
                    WHERE id = $5
                """, status, self.total_found, self.total_added, error_message, self.job_id)
            else:
                await conn.execute("""
                    UPDATE scraper_jobs 
                    SET status = $1, total_found = $2, total_added = $3
                    WHERE id = $4
                """, status, self.total_found, self.total_added, self.job_id)
                
    async def fetch_page(self, session, url):
        """Fetch a page with retry logic"""
        for attempt in range(3):
            try:
                async with session.get(url, headers=self.headers, timeout=30) as response:
                    if response.status == 200:
                        return await response.text()
                    else:
                        logging.warning(f"HTTP {response.status} for {url}")
            except Exception as e:
                logging.error(f"Attempt {attempt + 1} failed for {url}: {e}")
                await asyncio.sleep(2 ** attempt)
        return None
        
    def extract_vehicle_data(self, soup, url):
        """Extract vehicle data from detail page"""
        try:
            data = {
                'source_url': url,
                'manufacturer_id': self.manufacturer_id,
                'model_id': self.model_id
            }
            
            # Title
            title_elem = soup.find('h1', class_='cassetteMain__title')
            if title_elem:
                data['title_description'] = title_elem.text.strip()
            
            # Price
            price_elem = soup.find('p', class_='basePrice__price')
            if price_elem:
                price_text = price_elem.text.strip()
                price_match = re.search(r'([\d,]+)', price_text)
                if price_match:
                    price_yen = int(price_match.group(1).replace(',', '')) * 10000
                    data['price_total_yen'] = price_yen
            
            # Year
            for dt in soup.find_all('dt'):
                if '年式' in dt.text:
                    dd = dt.find_next_sibling('dd')
                    if dd:
                        year_text = dd.text.strip()
                        year_match = re.search(r'(\d{4})', year_text)
                        if year_match:
                            data['year_month'] = f"{year_match.group(1)}-01"
            
            # Mileage
            for dt in soup.find_all('dt'):
                if '走行距離' in dt.text:
                    dd = dt.find_next_sibling('dd')
                    if dd:
                        mileage_text = dd.text.strip()
                        mileage_match = re.search(r'([\d.]+)', mileage_text)
                        if mileage_match:
                            data['mileage_km'] = int(float(mileage_match.group(1)) * 10000)
            
            # Images
            images = []
            gallery = soup.find('div', class_='slick__container')
            if gallery:
                for img in gallery.find_all('img'):
                    img_url = img.get('src') or img.get('data-src')
                    if img_url and 'U00029' in img_url:
                        full_url = urljoin(self.base_url, img_url)
                        images.append(full_url)
            data['images'] = images[:10]  # Limit to 10 images
            
            return data
            
        except Exception as e:
            logging.error(f"Error extracting data from {url}: {e}")
            return None
            
    async def check_vehicle_exists(self, url):
        """Check if vehicle already exists in database"""
        async with self.db_pool.acquire() as conn:
            result = await conn.fetchval(
                "SELECT COUNT(*) FROM vehicles WHERE source_url = $1",
                url
            )
            return result > 0
            
    async def insert_vehicle(self, vehicle_data):
        """Insert vehicle into database"""
        async with self.db_pool.acquire() as conn:
            try:
                # Insert vehicle
                vehicle_id = await conn.fetchval("""
                    INSERT INTO vehicles (
                        source_url, manufacturer_id, model_id, title_description,
                        price_vehicle_yen, price_total_yen, model_year_ad, mileage_km,
                        is_available, source_site, has_repair_history, has_warranty,
                        body_style, fuel_type, drive_type, engine_displacement_cc
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 'carsensor', false, false,
                             'SUV', 'gasoline', 'AWD', 2500)
                    RETURNING id
                """, 
                    vehicle_data['source_url'],
                    vehicle_data['manufacturer_id'],
                    vehicle_data['model_id'],
                    vehicle_data.get('title_description', 'Vehicle'),
                    vehicle_data.get('price_total_yen', 0),
                    vehicle_data.get('price_total_yen', 0),
                    vehicle_data.get('model_year_ad', 2020),
                    vehicle_data.get('mileage_km', 0)
                )
                
                # Insert images
                if vehicle_data.get('images'):
                    for idx, img_url in enumerate(vehicle_data['images']):
                        await conn.execute("""
                            INSERT INTO vehicle_images (
                                vehicle_id, image_url, image_order, is_primary
                            ) VALUES ($1, $2, $3, $4)
                        """, vehicle_id, img_url, idx, idx == 0)
                
                self.total_added += 1
                logging.info(f"Added vehicle {vehicle_id}: {vehicle_data.get('title_description')}")
                return vehicle_id
                
            except Exception as e:
                logging.error(f"Error inserting vehicle: {e}")
                return None
                
    async def scrape_search_results(self):
        """Scrape all vehicles from search results"""
        async with aiohttp.ClientSession() as session:
            await self.update_job_status('running')
            
            try:
                # Fetch search page
                html = await self.fetch_page(session, self.search_url)
                if not html:
                    raise Exception("Failed to fetch search page")
                    
                soup = BeautifulSoup(html, 'html.parser')
                
                # Find all vehicle links
                vehicle_links = []
                
                # Try multiple CSS selectors that CarSensor uses
                cassettes = soup.find_all('div', class_='cassetteMain')
                if not cassettes:
                    cassettes = soup.find_all('div', class_='cassette')
                
                for cassette in cassettes:
                    # Try different link patterns
                    link = cassette.find('a', class_='cassetteMain__mainImg')
                    if not link:
                        link = cassette.find('a', class_='cassette__detail')
                    if not link:
                        link = cassette.find('a')
                    
                    if link and link.get('href'):
                        full_url = urljoin(self.base_url, link['href'])
                        vehicle_links.append(full_url)
                
                self.total_found = len(vehicle_links)
                logging.info(f"Found {self.total_found} vehicles to scrape")
                
                # Process each vehicle
                for idx, vehicle_url in enumerate(vehicle_links):
                    try:
                        # Check if already exists
                        if await self.check_vehicle_exists(vehicle_url):
                            logging.info(f"Vehicle already exists: {vehicle_url}")
                            continue
                        
                        # Fetch vehicle details
                        vehicle_html = await self.fetch_page(session, vehicle_url)
                        if not vehicle_html:
                            continue
                            
                        vehicle_soup = BeautifulSoup(vehicle_html, 'html.parser')
                        vehicle_data = self.extract_vehicle_data(vehicle_soup, vehicle_url)
                        
                        if vehicle_data:
                            await self.insert_vehicle(vehicle_data)
                        
                        # Update progress
                        if idx % 5 == 0:
                            await self.update_job_status('running')
                        
                        # Small delay to be respectful
                        await asyncio.sleep(1)
                        
                    except Exception as e:
                        logging.error(f"Error processing vehicle {vehicle_url}: {e}")
                        continue
                
                await self.update_job_status('completed')
                logging.info(f"Scraping completed: {self.total_added}/{self.total_found} vehicles added")
                
            except Exception as e:
                error_msg = f"Scraper failed: {str(e)}"
                logging.error(error_msg)
                await self.update_job_status('failed', error_msg)
                
    async def run(self):
        """Main entry point"""
        try:
            await self.connect_db()
            await self.scrape_search_results()
        finally:
            if self.db_pool:
                await self.db_pool.close()

def main():
    if len(sys.argv) < 4:
        print("Usage: python scraper_generic.py <search_url> <manufacturer_id> <model_id> [job_id]")
        sys.exit(1)
        
    search_url = sys.argv[1]
    manufacturer_id = sys.argv[2]
    model_id = sys.argv[3]
    job_id = sys.argv[4] if len(sys.argv) > 4 else None
    
    scraper = GenericCarSensorScraper(search_url, manufacturer_id, model_id, job_id)
    asyncio.run(scraper.run())

if __name__ == "__main__":
    main()