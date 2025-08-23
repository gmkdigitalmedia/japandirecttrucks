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
        logging.FileHandler(f'scrapers/logs/generic_scraper_v2_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)

class RobustCarSensorScraper:
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
                await asyncio.sleep(2 ** attempt)
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
            
            # Title - try multiple selectors and approaches
            title_selectors = [
                'h1.cassetteMain__title',
                'h1.vehicle-title', 
                'h1',
                '.title',
                '.car-name',
                '.vehicle-name'
            ]
            
            title_found = False
            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem and title_elem.text.strip():
                    data['title_description'] = title_elem.text.strip()
                    title_found = True
                    break
            
            # Try getting title from meta tags
            if not title_found:
                meta_title = soup.find('meta', property='og:title')
                if meta_title and meta_title.get('content'):
                    data['title_description'] = meta_title['content'].strip()
                    title_found = True
            
            # Try getting from page title
            if not title_found:
                page_title = soup.find('title')
                if page_title and page_title.text:
                    title_text = page_title.text.strip()
                    # Extract meaningful part from title
                    if '｜' in title_text:
                        data['title_description'] = title_text.split('｜')[0].strip()
                    elif ' - ' in title_text:
                        data['title_description'] = title_text.split(' - ')[0].strip()
                    else:
                        data['title_description'] = title_text
                    title_found = True
            
            # Fallback
            if not title_found or not data.get('title_description'):
                data['title_description'] = f"{self.manufacturer_name} {self.model_name}"
            
            # Price - try multiple selectors
            price_selectors = [
                'p.basePrice__price',
                '.price',
                '.vehicle-price'
            ]
            for selector in price_selectors:
                price_elem = soup.select_one(selector)
                if price_elem:
                    price_text = price_elem.text.strip()
                    price_match = re.search(r'([\\d,]+)', price_text)
                    if price_match:
                        price_yen = int(price_match.group(1).replace(',', '')) * 10000
                        data['price_total_yen'] = price_yen
                        data['price_vehicle_yen'] = price_yen
                        break
            
            # Default price if not found
            if not data.get('price_total_yen'):
                data['price_total_yen'] = 1000000  # Default 1M yen
                data['price_vehicle_yen'] = 1000000
            
            # Year - try multiple approaches
            year_found = False
            for dt in soup.find_all('dt'):
                if '年式' in dt.text:
                    dd = dt.find_next_sibling('dd')
                    if dd:
                        year_text = dd.text.strip()
                        year_match = re.search(r'(\\d{4})', year_text)
                        if year_match:
                            data['model_year_ad'] = int(year_match.group(1))
                            year_found = True
                            break
            
            if not year_found:
                data['model_year_ad'] = 2020  # Default year
            
            # Mileage
            mileage_found = False
            for dt in soup.find_all('dt'):
                if '走行距離' in dt.text:
                    dd = dt.find_next_sibling('dd')
                    if dd:
                        mileage_text = dd.text.strip()
                        mileage_match = re.search(r'([\\d.]+)', mileage_text)
                        if mileage_match:
                            # Convert from 万km to km
                            data['mileage_km'] = int(float(mileage_match.group(1)) * 10000)
                            mileage_found = True
                            break
            
            if not mileage_found:
                data['mileage_km'] = 50000  # Default 50,000km
            
            # Images - comprehensive image extraction
            images = []
            
            # Try multiple gallery selectors
            gallery_selectors = [
                'div.slick__container',
                '.image-gallery',
                '.vehicle-images',
                '.photo-gallery',
                '.car-photos',
                '#photoGallery',
                '.mainPhoto'
            ]
            
            # First try gallery containers
            for selector in gallery_selectors:
                gallery = soup.select_one(selector)
                if gallery:
                    for img in gallery.find_all('img'):
                        img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                        if img_url:
                            # Clean and validate image URL
                            if img_url.startswith('//'):
                                img_url = 'https:' + img_url
                            elif img_url.startswith('/'):
                                img_url = urljoin(self.base_url, img_url)
                            
                            # Check if it's a vehicle image (not icons/logos)
                            if any(x in img_url.lower() for x in ['photo', 'image', 'u00029', 'vehicle', 'car', '.jpg', '.jpeg', '.png']):
                                if img_url not in images:
                                    images.append(img_url)
                    
                    if images:
                        break
            
            # If no gallery found, try finding all images on page
            if not images:
                all_images = soup.find_all('img')
                for img in all_images:
                    img_url = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                    if img_url:
                        # Clean URL
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        elif img_url.startswith('/'):
                            img_url = urljoin(self.base_url, img_url)
                        
                        # Filter for vehicle images (exclude small icons, logos, etc.)
                        if (any(x in img_url.lower() for x in ['photo', 'image', 'vehicle', 'car', 'u00029']) and
                            not any(x in img_url.lower() for x in ['logo', 'icon', 'banner', 'header', 'footer', 'btn']) and
                            img_url.endswith(('.jpg', '.jpeg', '.png', '.webp'))):
                            
                            if img_url not in images:
                                images.append(img_url)
            
            data['images'] = images[:15]  # Limit to 15 images
            logging.info(f"Found {len(data['images'])} images for vehicle: {url}")
            
            return data
            
        except Exception as e:
            logging.error(f"Error extracting data from {url}: {e}")
            return None
            
    async def scrape_search_results(self):
        """Scrape all vehicles from search results with pagination"""
        async with aiohttp.ClientSession() as session:
            await self.update_job_status('running')
            
            try:
                all_vehicle_links = []
                page = 1
                
                while True:
                    # Construct page URL - CarSensor uses different pagination patterns
                    if page == 1:
                        page_url = self.search_url
                    else:
                        # Try different CarSensor pagination patterns
                        base_url = self.search_url
                        if '?' in base_url:
                            page_url = f"{base_url}&page={page}"
                        else:
                            page_url = f"{base_url}?page={page}"
                    
                    logging.info(f"Scraping page {page}: {page_url}")
                    
                    # Fetch search page
                    html = await self.fetch_page(session, page_url)
                    if not html:
                        logging.error(f"Failed to fetch page {page}")
                        break
                        
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Find all vehicle links on this page
                    page_vehicle_links = []
                    
                    # Try different CSS selectors that CarSensor uses
                    cassette_selectors = [
                        'div.cassetteMain',
                        'div.cassette',
                        '.vehicle-item',
                        '.car-item'
                    ]
                    
                    cassettes = []
                    for selector in cassette_selectors:
                        cassettes = soup.select(selector)
                        if cassettes:
                            if page == 1:
                                logging.info(f"Found vehicles using selector: {selector}")
                            break
                    
                    for cassette in cassettes:
                        # Try different link patterns
                        link_selectors = [
                            'a.cassetteMain__mainImg',
                            'a.cassette__detail',
                            'a[href*="/usedcar/detail/"]',
                            'a'
                        ]
                        
                        link = None
                        for selector in link_selectors:
                            link = cassette.select_one(selector)
                            if link and link.get('href'):
                                break
                        
                        if link and link.get('href'):
                            full_url = urljoin(self.base_url, link['href'])
                            page_vehicle_links.append(full_url)
                    
                    if not page_vehicle_links:
                        logging.info(f"No vehicles found on page {page}, ending pagination")
                        break
                    
                    logging.info(f"Found {len(page_vehicle_links)} vehicles on page {page}")
                    all_vehicle_links.extend(page_vehicle_links)
                    
                    # Check if there's a next page - try multiple methods
                    next_page = None
                    
                    # Method 1: Look for "次へ" (Next) link
                    next_page = soup.find('a', string='次へ') or soup.find('a', string='次のページ')
                    
                    # Method 2: Look for next page in pager
                    if not next_page:
                        pager = soup.find('div', class_='pager')
                        if pager:
                            next_page = pager.find('a', string='次へ') or pager.find('a', string=str(page + 1))
                    
                    # Method 3: Look for rel="next" link
                    if not next_page:
                        next_page = soup.find('link', rel='next') or soup.find('a', rel='next')
                    
                    # Method 4: Try constructing next page URL manually
                    if not next_page and page == 1:
                        # Try page 2 to see if it exists
                        test_url = f"{self.search_url}&page=2"
                        test_html = await self.fetch_page(session, test_url)
                        if test_html:
                            test_soup = BeautifulSoup(test_html, 'html.parser')
                            test_vehicles = test_soup.select('div.cassetteMain')
                            if test_vehicles:
                                logging.info("Found page 2 via manual construction")
                                next_page = True  # Indicate there's a next page
                    
                    if not next_page:
                        logging.info(f"No next page found, ending pagination after page {page}")
                        break
                    
                    page += 1
                    
                    # Safety limit - don't scrape more than 100 pages
                    if page > 100:
                        logging.warning("Reached 100 page limit, stopping pagination")
                        break
                    
                    # Small delay between pages
                    await asyncio.sleep(0.5)
                
                self.total_found = len(all_vehicle_links)
                logging.info(f"Found {self.total_found} total vehicles across {page} pages")
                
                if self.total_found == 0:
                    logging.warning("No vehicles found. This might indicate a change in CarSensor's HTML structure.")
                    logging.info("Available CSS classes on page:")
                    for div in soup.find_all('div', class_=True)[:10]:
                        logging.info(f"  div.{' '.join(div.get('class', []))}")
                
                # Process each vehicle
                for idx, vehicle_url in enumerate(all_vehicle_links):
                    try:
                        # Check if already exists
                        if await self.db_helper.check_vehicle_exists(vehicle_url):
                            logging.info(f"Vehicle already exists: {vehicle_url}")
                            continue
                        
                        # Fetch vehicle details
                        vehicle_html = await self.fetch_page(session, vehicle_url)
                        if not vehicle_html:
                            continue
                            
                        vehicle_soup = BeautifulSoup(vehicle_html, 'html.parser')
                        vehicle_data = self.extract_vehicle_data(vehicle_soup, vehicle_url)
                        
                        if vehicle_data:
                            # Use safe insertion method
                            vehicle_id = await self.db_helper.insert_vehicle_safe(vehicle_data)
                            if vehicle_id:
                                self.total_added += 1
                                logging.info(f"Added vehicle {vehicle_id}: {vehicle_data.get('title_description')}")
                        
                        # Update progress every 10 vehicles
                        if idx % 10 == 0:
                            await self.update_job_status('running')
                            logging.info(f"Progress: {self.total_added}/{self.total_found} vehicles processed")
                        
                        # Small delay to be respectful
                        await asyncio.sleep(0.3)
                        
                    except Exception as e:
                        logging.error(f"Error processing vehicle {vehicle_url}: {e}")
                        continue
                
                await self.update_job_status('completed')
                logging.info(f"Scraping completed: {self.total_added}/{self.total_found} vehicles added")
                
            except Exception as e:
                error_msg = f"Scraper failed: {str(e)}"
                logging.error(error_msg)
                await self.update_job_status('failed', error_msg)
                raise
                
    async def run(self):
        """Main entry point"""
        try:
            await self.initialize()
            await self.scrape_search_results()
        except Exception as e:
            logging.error(f"Scraper failed: {e}")
            raise

def main():
    if len(sys.argv) < 4:
        print("Usage: python scraper_generic_v2.py <search_url> <manufacturer_name> <model_name> [job_id]")
        print("Example: python scraper_generic_v2.py 'https://...' 'Mazda' 'CX-5' 123")
        sys.exit(1)
        
    search_url = sys.argv[1]
    manufacturer_name = sys.argv[2]
    model_name = sys.argv[3]
    job_id = sys.argv[4] if len(sys.argv) > 4 else None
    
    scraper = RobustCarSensorScraper(search_url, manufacturer_name, model_name, job_id)
    asyncio.run(scraper.run())

if __name__ == "__main__":
    main()