#!/usr/bin/env python3
"""
Toyota Prado scraper for GPS Trucks Japan
Scrapes CarSensor for Toyota Prado vehicles, collects full galleries,
and syncs with PostgreSQL database.
"""

import asyncio
import sys
import hashlib
import random
import aiohttp
import aiofiles
from pathlib import Path
from bs4 import BeautifulSoup
from loguru import logger
import asyncpg
from datetime import datetime
import re
from translator import VehicleTranslator
import json
import argparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# Configuration
DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"  # User-provided credentials
BASE_URL = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S152&SKIND=1"  # Prado search URL
MIN_YEAR = 1990
IMAGE_DIR = Path("car_images")
PROGRESS_FILE = Path("prado_scraper_progress.json")
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
]
TARGET_PREFECTURES = [
    "ibaraki", "tochigi", "gunma", "saitama", "chiba", "tokyo", "kanagawa"
]

class DatabaseManager:
    def __init__(self, database_url):
        self.database_url = database_url
        self.pool = None
        
    async def initialize(self):
        """Initialize database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
            logger.info("Database connection pool created successfully")
            
            # Test connection
            async with self.pool.acquire() as conn:
                result = await conn.fetchval("SELECT 1")
                logger.info("Database connection test successful")
                
            return True
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            return False
    
    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")

    async def get_existing_vehicle_ids(self):
        """Get all existing vehicle source IDs from database"""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("SELECT source_id FROM vehicles WHERE source_id IS NOT NULL")
                return {row['source_id'] for row in rows}
        except Exception as e:
            logger.error(f"Error fetching existing vehicle IDs: {e}")
            return set()
    
    async def insert_vehicle(self, vehicle_data):
        """Insert or update vehicle in database"""
        try:
            async with self.pool.acquire() as conn:
                # Check if vehicle already exists
                existing = await conn.fetchrow(
                    "SELECT id FROM vehicles WHERE source_id = $1",
                    vehicle_data['source_id']
                )
                
                if existing:
                    # Update existing vehicle
                    await conn.execute("""
                        UPDATE vehicles SET
                            source_url = $2,
                            title_description = $3,
                            price_vehicle_yen = $4,
                            price_total_yen = $5,
                            mileage_km = $6,
                            location_prefecture = $7,
                            model_year_ad = $8,
                            last_scraped_at = NOW(),
                            updated_at = NOW(),
                            is_available = TRUE
                        WHERE source_id = $1
                    """, 
                        vehicle_data['source_id'],
                        vehicle_data['source_url'],
                        vehicle_data['title_description'],
                        vehicle_data['price_vehicle_yen'],
                        vehicle_data['price_total_yen'],
                        vehicle_data['mileage_km'],
                        vehicle_data.get('location_prefecture'),
                        vehicle_data['model_year_ad']
                    )
                    return existing['id']
                else:
                    # Insert new vehicle
                    vehicle_id = await conn.fetchval("""
                        INSERT INTO vehicles (
                            source_id, source_url, source_site, manufacturer_id, model_id, 
                            title_description, price_vehicle_yen, price_total_yen, 
                            model_year_ad, mileage_km, location_prefecture,
                            has_repair_history, has_warranty, is_available, last_scraped_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, NOW()
                        ) RETURNING id
                    """,
                        vehicle_data['source_id'],
                        vehicle_data['source_url'],
                        'carsensor',
                        vehicle_data['manufacturer_id'],
                        vehicle_data['model_id'],
                        vehicle_data['title_description'],
                        vehicle_data['price_vehicle_yen'],
                        vehicle_data['price_total_yen'],
                        vehicle_data['model_year_ad'],
                        vehicle_data['mileage_km'],
                        vehicle_data.get('location_prefecture'),
                        vehicle_data.get('has_repair_history', False),
                        vehicle_data.get('has_warranty', False)
                    )
                    return vehicle_id
                    
        except Exception as e:
            logger.error(f"Error inserting/updating vehicle: {e}")
            logger.error(f"Vehicle data: {vehicle_data}")
            return None

    async def insert_vehicle_images(self, vehicle_id, image_urls):
        """Insert vehicle images"""
        try:
            async with self.pool.acquire() as conn:
                # Delete existing images for this vehicle
                await conn.execute("DELETE FROM vehicle_images WHERE vehicle_id = $1", vehicle_id)
                
                # Insert new images
                for i, url in enumerate(image_urls):
                    await conn.execute("""
                        INSERT INTO vehicle_images (vehicle_id, image_url, image_order, created_at)
                        VALUES ($1, $2, $3, NOW())
                    """, vehicle_id, url, i + 1)
                    
        except Exception as e:
            logger.error(f"Error inserting vehicle images: {e}")

    async def mark_vehicles_as_sold(self, existing_source_ids, found_source_ids):
        """Mark vehicles as sold if they weren't found in this scrape"""
        try:
            sold_vehicles = existing_source_ids - found_source_ids
            if sold_vehicles:
                async with self.pool.acquire() as conn:
                    await conn.execute("""
                        UPDATE vehicles 
                        SET is_available = FALSE, 
                            sold_detected_at = NOW(),
                            notes = COALESCE(notes, '') || ' [AUTO-DETECTED SOLD: ' || NOW()::date::text || ']'
                        WHERE source_id = ANY($1) AND is_available = TRUE
                    """, list(sold_vehicles))
                logger.info(f"Marked {len(sold_vehicles)} vehicles as sold")
        except Exception as e:
            logger.error(f"Error marking vehicles as sold: {e}")

class PradoScraper:
    def __init__(self, resume_mode=False):
        self.db = DatabaseManager(DATABASE_URL)
        self.translator = VehicleTranslator()
        
        # Resume functionality
        self.resume_mode = resume_mode
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.progress_data = {}
        self.found_vehicle_ids = set()
        
        if resume_mode and PROGRESS_FILE.exists():
            self.load_progress()
            
        # Setup logging
        logger.remove()
        logger.add(
            sys.stderr,
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
            level="INFO"
        )
        logger.add("prado_scraper.log", rotation="1 MB", retention="7 days")
        
    def load_progress(self):
        """Load progress from previous session"""
        try:
            with open(PROGRESS_FILE, 'r') as f:
                self.progress_data = json.load(f)
                self.found_vehicle_ids = set(self.progress_data.get('found_vehicle_ids', []))
                logger.info(f"Resumed from session {self.progress_data.get('session_id', 'unknown')}")
                logger.info(f"Previously found {len(self.found_vehicle_ids)} vehicles")
        except Exception as e:
            logger.error(f"Error loading progress: {e}")
            self.progress_data = {}
            
    def save_progress(self, current_page, total_pages, processed_vehicles, new_vehicles):
        """Save current progress to JSON file"""
        self.progress_data = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "current_page": current_page,
            "total_pages": total_pages,
            "processed_vehicles": processed_vehicles,
            "new_vehicles": new_vehicles,
            "found_vehicle_ids": list(self.found_vehicle_ids)
        }
        
        try:
            with open(PROGRESS_FILE, 'w') as f:
                json.dump(self.progress_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving progress: {e}")

    async def get_page_count(self, session):
        """Get total number of pages"""
        try:
            async with session.get(BASE_URL, headers={"User-Agent": random.choice(USER_AGENTS)}) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch first page: {response.status}")
                    return 1
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Find pagination - look for page numbers
                pagination = soup.find('div', class_='pagination') or soup.find('ul', class_='pagination')
                if pagination:
                    page_links = pagination.find_all('a')
                    page_numbers = []
                    for link in page_links:
                        try:
                            page_num = int(link.get_text().strip())
                            page_numbers.append(page_num)
                        except (ValueError, AttributeError):
                            continue
                    
                    if page_numbers:
                        total_pages = max(page_numbers)
                        logger.info(f"Found {total_pages} total pages")
                        return total_pages
                
                # Fallback: look for "!n30�" or similar
                next_link = soup.find('a', string=re.compile(r'!n\d+�'))
                if next_link:
                    logger.info("Multiple pages detected (next link found)")
                    return 50  # Conservative estimate
                
                logger.info("Only one page detected")
                return 1
                
        except Exception as e:
            logger.error(f"Error getting page count: {e}")
            return 1

    async def scrape_page(self, session, page_num=1):
        """Scrape a single page of vehicle listings"""
        try:
            if page_num == 1:
                url = BASE_URL
            else:
                url = f"{BASE_URL}&R={(page_num - 1) * 30}"
            
            logger.info(f"Scraping page {page_num}: {url}")
            
            async with session.get(url, headers={"User-Agent": random.choice(USER_AGENTS)}) as response:
                if response.status != 200:
                    logger.error(f"Failed to fetch page {page_num}: {response.status}")
                    return []
                
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Find vehicle listings - using cassetteMain as per working scraper
                vehicle_divs = soup.find_all('div', class_='cassetteMain')
                logger.info(f"Found {len(vehicle_divs)} vehicle listings on page {page_num}")
                
                vehicles = []
                for div in vehicle_divs:
                    try:
                        vehicle = await self.extract_vehicle_data(div)
                        if vehicle:
                            vehicles.append(vehicle)
                            self.found_vehicle_ids.add(vehicle['source_id'])
                        await asyncio.sleep(random.uniform(0.1, 0.3))  # Rate limiting
                    except Exception as e:
                        logger.error(f"Error extracting vehicle data: {e}")
                        continue
                
                return vehicles
                
        except Exception as e:
            logger.error(f"Error scraping page {page_num}: {e}")
            return []

    async def extract_vehicle_data(self, div):
        """Extract vehicle data from a listing div"""
        try:
            vehicle = {}
            
            # Extract source ID and URL using same method as LC300 scraper
            link_tag = div.select_one('.cassetteMain__mainImg a')
            if not link_tag or not link_tag.get('href'):
                return None
            
            detail_url = link_tag['href']
            if not detail_url.startswith('http'):
                detail_url = "https://www.carsensor.net" + detail_url
            
            vehicle["source_url"] = detail_url
            
            # Extract source ID from CarSensor URL format: /usedcar/detail/ABC123/index.html
            source_id_match = re.search(r'/([A-Z0-9]+)/index\.html', detail_url)
            if source_id_match:
                vehicle["source_id"] = source_id_match.group(1)
            else:
                # Try alternative pattern: /detail/ABC123/
                alt_match = re.search(r'/detail/([A-Z0-9]+)/', detail_url)
                vehicle["source_id"] = alt_match.group(1) if alt_match else "N/A"
                
            if vehicle["source_id"] == "N/A":
                return None
            
            # Skip if we've already processed this vehicle in resume mode
            if self.resume_mode and vehicle['source_id'] in self.found_vehicle_ids:
                return None
            
            # Use hardcoded IDs like working_scraper.py for reliability
            vehicle["manufacturer_id"] = 1        # Toyota (hardcoded)
            vehicle["model_id"] = 59              # Prado (hardcoded)
            
            # Get title from image alt text (contains full vehicle description)
            img_elem = div.select_one('.cassetteMain__mainImg img')
            if img_elem and img_elem.get('alt'):
                japanese_title = img_elem['alt'].strip()
                # Translate to English and truncate if too long
                english_title = self.translator.translate_text(japanese_title)
                
                # Ensure it's identified as Prado
                if "Prado" not in english_title and "Land Cruiser" not in english_title:
                    english_title = f"Toyota Land Cruiser Prado {english_title}"
                
                vehicle["title_description"] = english_title[:500] if len(english_title) > 500 else english_title
            else:
                vehicle["title_description"] = "Toyota Land Cruiser Prado"
            
            # Extract price
            price_elem = div.find(string=re.compile(r'�')) or div.find(class_=re.compile(r'price'))
            if price_elem:
                if hasattr(price_elem, 'parent'):
                    price_text = price_elem.parent.get_text(strip=True)
                else:
                    price_text = str(price_elem).strip()
                
                price_match = re.search(r'([\d.]+)�', price_text)
                if price_match:
                    vehicle['price_total_yen'] = int(float(price_match.group(1)) * 10000)
                else:
                    vehicle['price_total_yen'] = 0
            else:
                vehicle['price_total_yen'] = 0
            
            # Extract mileage
            mileage_elem = div.find(string=re.compile(r'km')) or div.find(class_=re.compile(r'mileage'))
            if mileage_elem:
                if hasattr(mileage_elem, 'parent'):
                    mileage_text = mileage_elem.parent.get_text(strip=True)
                else:
                    mileage_text = str(mileage_elem).strip()
                
                mileage_match = re.search(r'([\d.]+)?km', mileage_text)
                if mileage_match:
                    mileage_val = float(mileage_match.group(1))
                    if 'km' in mileage_text:
                        vehicle['mileage_km'] = int(mileage_val * 10000)
                    else:
                        vehicle['mileage_km'] = int(mileage_val)
                else:
                    vehicle['mileage_km'] = 0
            else:
                vehicle['mileage_km'] = 0
            
            # Extract year
            year_elem = div.find(string=re.compile(r't')) or div.find(class_=re.compile(r'year'))
            if year_elem:
                if hasattr(year_elem, 'parent'):
                    year_text = year_elem.parent.get_text(strip=True)
                else:
                    year_text = str(year_elem).strip()
                
                year_match = re.search(r'(\d{4})t?', year_text)
                if year_match:
                    vehicle['model_year_ad'] = int(year_match.group(1))
                else:
                    vehicle['model_year_ad'] = 2000  # Default
            else:
                vehicle['model_year_ad'] = 2000
            
            # Skip very old vehicles
            if vehicle['model_year_ad'] < MIN_YEAR:
                return None
            
            # Extract additional details with safe defaults
            vehicle['fuel_type'] = 'Gasoline'
            vehicle['transmission_type'] = 'Automatic'
            vehicle['drive_type'] = '4WD'
            vehicle['color'] = 'Unknown'
            vehicle['prefectural_location'] = 'Unknown'
            
            logger.info(f"Extracted vehicle: {vehicle['source_id']} - {vehicle['title_description']} - �{vehicle['price_total_yen']:,}")
            return vehicle
            
        except Exception as e:
            logger.error(f"Error extracting vehicle data: {e}")
            return None

    async def get_gallery_images(self, source_url):
        """Get gallery images using Selenium"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            
            try:
                driver.get(source_url)
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
                
                image_urls = []
                
                # Look for gallery images
                gallery_images = driver.find_elements(By.CSS_SELECTOR, 
                    "img[src*='cs.carsensor.net'], img[src*='img.carsensor.net'], .photo img, .gallery img")
                
                for img in gallery_images:
                    src = img.get_attribute('src')
                    if src and any(domain in src for domain in ['cs.carsensor.net', 'img.carsensor.net']):
                        # Convert to high-res version
                        high_res_src = src.replace('_S.jpg', '_L.jpg').replace('_M.jpg', '_L.jpg')
                        if high_res_src not in image_urls:
                            image_urls.append(high_res_src)
                
                logger.info(f"Found {len(image_urls)} gallery images")
                return image_urls[:15]  # Limit to first 15 images
                
            finally:
                driver.quit()
                
        except Exception as e:
            logger.error(f"Error getting gallery images: {e}")
            return []

    async def download_and_save_images(self, session, vehicle_id, source_id, image_urls):
        """Download and save vehicle images"""
        if not image_urls:
            return []
        
        try:
            # Create directory for this vehicle
            vehicle_dir = IMAGE_DIR / hashlib.md5(source_id.encode()).hexdigest()
            vehicle_dir.mkdir(parents=True, exist_ok=True)
            
            saved_paths = []
            for i, url in enumerate(image_urls):
                try:
                    async with session.get(url) as response:
                        if response.status == 200:
                            image_path = vehicle_dir / f"image_{i+1:03d}.jpg"
                            async with aiofiles.open(image_path, 'wb') as f:
                                await f.write(await response.read())
                            
                            # Store relative path for database
                            relative_path = f"/images/{vehicle_dir.name}/image_{i+1:03d}.jpg"
                            saved_paths.append(relative_path)
                            
                    await asyncio.sleep(0.1)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Error downloading image {url}: {e}")
                    continue
            
            logger.info(f"Downloaded {len(saved_paths)} images for vehicle {source_id}")
            return saved_paths
            
        except Exception as e:
            logger.error(f"Error in download_and_save_images: {e}")
            return []

    async def run(self):
        """Main scraping function"""
        try:
            # Initialize database
            if not await self.db.initialize():
                logger.error("Failed to initialize database connection")
                return
            
            # Get existing vehicle IDs for sold tracking
            existing_vehicle_ids = await self.db.get_existing_vehicle_ids()
            logger.info(f"Found {len(existing_vehicle_ids)} existing vehicles in database")
            
            # Create aiohttp session
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=5)
            timeout = aiohttp.ClientTimeout(total=30)
            
            async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
                # Get total pages
                total_pages = await self.get_page_count(session)
                
                # Resume from where we left off
                start_page = 1
                if self.resume_mode and 'current_page' in self.progress_data:
                    start_page = self.progress_data['current_page']
                    logger.info(f"Resuming from page {start_page}")
                
                processed_vehicles = 0
                new_vehicles = 0
                
                # Process each page
                for page_num in range(start_page, total_pages + 1):
                    logger.info(f"Processing page {page_num} of {total_pages}")
                    
                    vehicles = await self.scrape_page(session, page_num)
                    
                    for vehicle in vehicles:
                        try:
                            # Get gallery images
                            image_urls = await self.get_gallery_images(vehicle['source_url'])
                            
                            # Insert/update vehicle
                            vehicle_id = await self.db.insert_vehicle(vehicle)
                            if vehicle_id:
                                processed_vehicles += 1
                                
                                # Check if this is a new vehicle
                                if vehicle['source_id'] not in existing_vehicle_ids:
                                    new_vehicles += 1
                                
                                # Download and save images
                                saved_image_paths = await self.download_and_save_images(
                                    session, vehicle_id, vehicle['source_id'], image_urls
                                )
                                
                                # Insert image records
                                if saved_image_paths:
                                    await self.db.insert_vehicle_images(vehicle_id, saved_image_paths)
                                
                                logger.info(f" Processed vehicle {vehicle['source_id']}: {vehicle['title_description']}")
                            
                        except Exception as e:
                            logger.error(f"Error processing vehicle {vehicle.get('source_id', 'unknown')}: {e}")
                            continue
                    
                    # Save progress after each page
                    self.save_progress(page_num + 1, total_pages, processed_vehicles, new_vehicles)
                    
                    # Rate limiting between pages
                    await asyncio.sleep(random.uniform(2, 4))
                
                # Mark vehicles as sold
                await self.db.mark_vehicles_as_sold(existing_vehicle_ids, self.found_vehicle_ids)
                
                logger.info(f"<� Scraping completed!")
                logger.info(f"=� Total vehicles processed: {processed_vehicles}")
                logger.info(f"<� New vehicles added: {new_vehicles}")
                logger.info(f"=� Images downloaded and organized by vehicle")
                
                # Clean up progress file on successful completion
                if PROGRESS_FILE.exists():
                    PROGRESS_FILE.unlink()
                    logger.info("Progress file cleaned up")
            
        except Exception as e:
            logger.error(f"Fatal error in scraper: {e}")
            raise
        finally:
            await self.db.close()

async def main():
    parser = argparse.ArgumentParser(description='Toyota Prado Scraper')
    parser.add_argument('--resume', action='store_true', help='Resume from previous session')
    args = parser.parse_args()
    
    scraper = PradoScraper(resume_mode=args.resume)
    await scraper.run()

if __name__ == "__main__":
    asyncio.run(main())