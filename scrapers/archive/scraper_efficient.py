#!/usr/bin/env python3
import asyncio
import aiohttp
import sys
import json
import logging
import re
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs
from database_helper import get_db_helper

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'scrapers/logs/efficient_scraper_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

class EfficientCarSensorScraper:
    def __init__(self, search_url, manufacturer_name, model_name, job_id=None):
        self.search_url = search_url
        self.manufacturer_name = manufacturer_name
        self.model_name = model_name
        self.job_id = int(job_id) if job_id else None
        self.base_url = "https://www.carsensor.net"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.db_helper = None
        self.manufacturer_id = None
        self.model_id = None
        self.total_found = 0
        self.total_added = 0
        self.total_skipped = 0
        
    async def initialize(self):
        """Initialize database connection and get/create manufacturer and model IDs"""
        self.db_helper = await get_db_helper()
        
        # Get or create manufacturer
        self.manufacturer_id = await self.db_helper.get_manufacturer_id(self.manufacturer_name)
        if not self.manufacturer_id:
            raise Exception(f"Could not get/create manufacturer: {self.manufacturer_name}")
        
        # Get or create model
        self.model_id = await self.db_helper.get_model_id(self.model_name, self.manufacturer_id)
        if not self.model_id:
            raise Exception(f"Could not get/create model: {self.model_name}")
        
        logging.info(f"Initialized: {self.manufacturer_name} (ID: {self.manufacturer_id}) "
                    f"-> {self.model_name} (ID: {self.model_id})")
        
    async def update_job_status(self, status, error_message=None):
        """Update scraper job status in database"""
        if not self.job_id:
            return
            
        async with self.db_helper.db_pool.acquire() as conn:
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
                await asyncio.sleep(1)
        return None
        
    def extract_vehicle_data(self, soup, url):
        """Extract vehicle data from detail page"""
        try:
            data = {
                'source_url': url,
                'manufacturer_id': self.manufacturer_id,
                'model_id': self.model_id,
                'source_site': 'carsensor',
                'is_available': True
            }
            
            # Title - multiple approaches
            title_found = False
            title_selectors = ['h1', '.title', '.car-name', '.vehicle-name']
            
            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem and title_elem.text.strip():
                    data['title_description'] = title_elem.text.strip()
                    title_found = True
                    break
            
            if not title_found:
                # Try meta tags
                meta_title = soup.find('meta', property='og:title')
                if meta_title and meta_title.get('content'):
                    data['title_description'] = meta_title['content'].strip()
                elif soup.find('title'):
                    title_text = soup.find('title').text.strip()
                    if '｜' in title_text:
                        data['title_description'] = title_text.split('｜')[0].strip()
                    else:
                        data['title_description'] = title_text
                else:
                    data['title_description'] = f"{self.manufacturer_name} {self.model_name}"
            
            # Price
            price_elem = soup.select_one('p.basePrice__price, .price, .vehicle-price')
            if price_elem:
                price_text = price_elem.text.strip()
                price_match = re.search(r'([\\d,]+)', price_text)
                if price_match:
                    price_yen = int(price_match.group(1).replace(',', '')) * 10000
                    data['price_total_yen'] = price_yen
                    data['price_vehicle_yen'] = price_yen
            
            if not data.get('price_total_yen'):
                data['price_total_yen'] = 1000000
                data['price_vehicle_yen'] = 1000000
            
            # Year and mileage from specs
            year_found = False
            mileage_found = False
            
            for dt in soup.find_all('dt'):
                dt_text = dt.text.strip()
                if '年式' in dt_text:
                    dd = dt.find_next_sibling('dd')
                    if dd:
                        year_match = re.search(r'(\\d{4})', dd.text)
                        if year_match:
                            data['model_year_ad'] = int(year_match.group(1))
                            year_found = True
                
                if '走行距離' in dt_text:
                    dd = dt.find_next_sibling('dd')
                    if dd:
                        mileage_match = re.search(r'([\\d.]+)', dd.text)
                        if mileage_match:
                            data['mileage_km'] = int(float(mileage_match.group(1)) * 10000)
                            mileage_found = True
            
            if not year_found:
                data['model_year_ad'] = 2020
            if not mileage_found:
                data['mileage_km'] = 50000
            
            # Images - comprehensive extraction
            images = []
            all_images = soup.find_all('img')
            
            for img in all_images:
                img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if img_url and img_url.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    # Clean URL
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    elif img_url.startswith('/'):
                        img_url = urljoin(self.base_url, img_url)
                    
                    # Filter for vehicle photos
                    if ('ccsrpcml.carsensor.net' in img_url or 
                        any(x in img_url.lower() for x in ['photo', 'image', 'vehicle', 'car']) and
                        not any(x in img_url.lower() for x in ['logo', 'icon', 'banner', 'btn'])):
                        if img_url not in images:
                            images.append(img_url)
            
            data['images'] = images[:15]
            logging.info(f"Found {len(data['images'])} images for: {data['title_description'][:50]}...")
            
            return data
            
        except Exception as e:
            logging.error(f"Error extracting data from {url}: {e}")
            return None
            
    async def scrape_and_process(self):
        """Scrape and process vehicles page by page efficiently"""
        async with aiohttp.ClientSession() as session:
            await self.update_job_status('running')
            
            try:
                page = 1
                
                while True:
                    # Construct page URL
                    if page == 1:
                        page_url = self.search_url
                    else:
                        page_url = f"{self.search_url}&page={page}"
                    
                    logging.info(f"Processing page {page}: {page_url}")
                    
                    # Fetch search page
                    html = await self.fetch_page(session, page_url)
                    if not html:
                        logging.error(f"Failed to fetch page {page}")
                        break
                        
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find vehicles on this page
                    cassettes = soup.select('div.cassetteMain')
                    if not cassettes:
                        cassettes = soup.select('div.cassette')
                    
                    if not cassettes:
                        logging.info(f"No vehicles found on page {page}, ending")
                        break
                    
                    page_vehicles = []
                    for cassette in cassettes:
                        link = cassette.select_one('a[href*="/usedcar/detail/"], a')
                        if link and link.get('href'):
                            full_url = urljoin(self.base_url, link['href'])
                            page_vehicles.append(full_url)
                    
                    logging.info(f"Found {len(page_vehicles)} vehicles on page {page}")
                    self.total_found += len(page_vehicles)
                    
                    # Process each vehicle immediately
                    for i, vehicle_url in enumerate(page_vehicles):
                        try:
                            # Check if already exists
                            if await self.db_helper.check_vehicle_exists(vehicle_url):
                                self.total_skipped += 1
                                continue
                            
                            # Fetch and process vehicle
                            vehicle_html = await self.fetch_page(session, vehicle_url)
                            if not vehicle_html:
                                continue
                                
                            vehicle_soup = BeautifulSoup(vehicle_html, 'html.parser')
                            vehicle_data = self.extract_vehicle_data(vehicle_soup, vehicle_url)
                            
                            if vehicle_data:
                                vehicle_id = await self.db_helper.insert_vehicle_safe(vehicle_data)
                                if vehicle_id:
                                    self.total_added += 1
                                    logging.info(f"✅ Added vehicle {vehicle_id}: {vehicle_data.get('title_description', 'Unknown')[:50]}...")
                            
                            # Brief pause
                            await asyncio.sleep(0.2)
                            
                        except Exception as e:
                            logging.error(f"Error processing vehicle {vehicle_url}: {e}")
                            continue
                    
                    # Update progress after each page
                    await self.update_job_status('running')
                    logging.info(f"Page {page} complete. Total: {self.total_added} added, {self.total_skipped} skipped, {self.total_found} found")
                    
                    page += 1
                    
                    # Safety limit
                    if page > 100:
                        logging.warning("Reached 100 page limit")
                        break
                    
                    # Small delay between pages
                    await asyncio.sleep(0.5)
                
                await self.update_job_status('completed')
                logging.info(f"✅ Scraping completed! Added: {self.total_added}, Skipped: {self.total_skipped}, Total found: {self.total_found}")
                
            except Exception as e:
                error_msg = f"Scraper failed: {str(e)}"
                logging.error(error_msg)
                await self.update_job_status('failed', error_msg)
                raise
                
    async def run(self):
        """Main entry point"""
        try:
            await self.initialize()
            await self.scrape_and_process()
        except Exception as e:
            logging.error(f"Scraper failed: {e}")
            raise

def main():
    if len(sys.argv) < 4:
        print("Usage: python scraper_efficient.py <search_url> <manufacturer_name> <model_name> [job_id]")
        sys.exit(1)
        
    search_url = sys.argv[1]
    manufacturer_name = sys.argv[2]
    model_name = sys.argv[3]
    job_id = sys.argv[4] if len(sys.argv) > 4 else None
    
    scraper = EfficientCarSensorScraper(search_url, manufacturer_name, model_name, job_id)
    asyncio.run(scraper.run())

if __name__ == "__main__":
    main()