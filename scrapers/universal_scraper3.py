#!/usr/bin/env python3
"""
Universal CarSensor Scraper for GPS Trucks Japan
Reads configuration from CSV file and scrapes multiple makes/models
Automatically creates missing manufacturers and models in database
"""

import asyncio
import sys
import os
import csv

# Add current directory to Python path
sys.path.insert(0, '/mnt/c/Users/ibm/Documents/GPSTrucksJapan/scrapers')
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
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# Configuration
DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"
CONFIG_FILE = "vehicle_config2.csv"
MIN_YEAR = 1990
IMAGE_DIR = Path("car_images")
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

    async def connect(self):
        if not self.pool:
            try:
                self.pool = await asyncpg.create_pool(
                    self.database_url,
                    min_size=2,
                    max_size=10,
                    command_timeout=60
                )
                logger.info("Database connection pool created")
            except Exception as e:
                logger.error(f"Failed to connect to the database: {e}")
                raise

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")

    async def get_stats(self):
        async with self.pool.acquire() as conn:
            return await conn.fetchrow("SELECT COUNT(*) as total_vehicles FROM vehicles")

    async def get_or_create_manufacturer(self, name):
        """Get manufacturer ID or create if doesn't exist"""
        async with self.pool.acquire() as conn:
            # Try to find existing manufacturer
            existing = await conn.fetchrow(
                "SELECT id FROM manufacturers WHERE LOWER(name) = LOWER($1)", name
            )
            
            if existing:
                logger.info(f"Found existing manufacturer: {name} (ID: {existing['id']})")
                return existing['id']
            
            # Create new manufacturer
            manufacturer_id = await conn.fetchval(
                """
                INSERT INTO manufacturers (name, country, is_active)
                VALUES ($1, 'Japan', TRUE)
                RETURNING id
                """, name
            )
            logger.success(f"✅ Created new manufacturer: {name} (ID: {manufacturer_id})")
            return manufacturer_id

    async def get_or_create_model(self, manufacturer_id, model_name):
        """Get model ID or create if doesn't exist"""
        async with self.pool.acquire() as conn:
            # Try to find existing model
            existing = await conn.fetchrow(
                "SELECT id FROM models WHERE manufacturer_id = $1 AND LOWER(name) = LOWER($2)",
                manufacturer_id, model_name
            )
            
            if existing:
                logger.info(f"Found existing model: {model_name} (ID: {existing['id']})")
                return existing['id']
            
            # Create new model
            model_id = await conn.fetchval(
                """
                INSERT INTO models (manufacturer_id, name, body_type, is_popular)
                VALUES ($1, $2, 'SUV', TRUE)
                RETURNING id
                """, manufacturer_id, model_name
            )
            logger.success(f"✅ Created new model: {model_name} (ID: {model_id})")
            return model_id

    async def create_vehicle(self, vehicle):
        async with self.pool.acquire() as conn:
            # First try to find existing vehicle
            existing = await conn.fetchrow(
                "SELECT id, is_available FROM vehicles WHERE source_id = $1 AND source_site = $2",
                vehicle["source_id"], vehicle["source_site"]
            )
            
            if existing:
                existing_id = existing['id']
                
                # Check if vehicle was marked sold but is now back
                if not existing['is_available']:
                    await conn.execute("""
                        UPDATE vehicles 
                        SET is_available = TRUE,
                            notes = COALESCE(notes, '') || ' [RELISTED: ' || NOW()::date::text || ']'
                        WHERE id = $1
                    """, existing_id)
                    logger.success(f"🔄 RELISTED: Vehicle {vehicle['source_id']} is available again!")
                
                # Update existing vehicle
                await conn.execute(
                    """
                    UPDATE vehicles SET
                        source_url = $2,
                        title_description = $3,
                        price_vehicle_yen = $4,
                        price_total_yen = $5,
                        mileage_km = $6,
                        location_prefecture = $7,
                        model_year_ad = $8,
                        last_scraped_at = NOW(),
                        updated_at = NOW()
                    WHERE id = $1
                    """,
                    existing_id, vehicle["source_url"], 
                    vehicle["title_description"], vehicle["price_vehicle_yen"],
                    vehicle["price_total_yen"], vehicle["mileage_km"], 
                    vehicle["location_prefecture"], vehicle["model_year_ad"]
                )
                return existing_id
            else:
                # Insert new vehicle
                return await conn.fetchval(
                    """
                    INSERT INTO vehicles (
                        source_id, source_url, source_site, manufacturer_id, model_id, 
                        title_description, price_vehicle_yen, price_total_yen, 
                        model_year_ad, mileage_km, location_prefecture,
                        has_repair_history, has_warranty, is_available, last_scraped_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, NOW()
                    ) RETURNING id
                    """,
                    vehicle["source_id"], vehicle["source_url"], vehicle["source_site"], 
                    vehicle["manufacturer_id"], vehicle["model_id"], vehicle["title_description"], 
                    vehicle["price_vehicle_yen"], vehicle["price_total_yen"], vehicle["model_year_ad"],
                    vehicle["mileage_km"], vehicle["location_prefecture"], 
                    vehicle["has_repair_history"], vehicle["has_warranty"]
                )

    async def create_vehicle_image(self, image):
        async with self.pool.acquire() as conn:
            # Check if image already exists
            existing = await conn.fetchval(
                "SELECT id FROM vehicle_images WHERE vehicle_id = $1 AND filename = $2",
                image["vehicle_id"], image["filename"]
            )
            
            if not existing:
                await conn.execute(
                    """
                    INSERT INTO vehicle_images (
                        vehicle_id, original_url, local_path, filename, 
                        is_primary, file_size, alt_text, image_order
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """,
                    image["vehicle_id"], image.get("original_url"), image["local_path"], 
                    image["filename"], image.get("is_primary", False), 
                    image.get("file_size", 0), image.get("alt_text"), image.get("image_order", 0)
                )

    async def get_active_vehicles_for_model(self, model_id):
        """Get all active vehicles for this model from database"""
        async with self.pool.acquire() as conn:
            vehicles = await conn.fetch("""
                SELECT id, source_id 
                FROM vehicles 
                WHERE model_id = $1 
                AND is_available = TRUE
                AND source_site = 'carsensor'
            """, model_id)
            return {v['source_id']: v['id'] for v in vehicles}
    
    async def mark_vehicle_sold(self, vehicle_id, source_id):
        """Mark a vehicle as sold"""
        async with self.pool.acquire() as conn:
            await conn.execute("""
                UPDATE vehicles 
                SET is_available = FALSE,
                    sold_detected_at = NOW(),
                    notes = COALESCE(notes, '') || ' [AUTO-DETECTED SOLD: ' || NOW()::date::text || ']'
                WHERE id = $1
            """, vehicle_id)
            logger.warning(f"🚫 MARKED SOLD: Vehicle ID {vehicle_id} (source: {source_id})")

class UniversalCarSensorScraper:
    def __init__(self, config):
        self.config = config
        self.db = DatabaseManager(config.database_url)
        self.image_dir = IMAGE_DIR
        self.image_dir.mkdir(exist_ok=True)
        self.translator = VehicleTranslator()
        self.driver = None
        self.found_vehicle_ids = set()

    def load_vehicle_configs(self):
        """Load vehicle configurations from CSV file"""
        configs = []
        config_path = Path(CONFIG_FILE)
        
        if not config_path.exists():
            logger.error(f"Configuration file {CONFIG_FILE} not found!")
            return configs
            
        with open(config_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Only load enabled configurations
                if row.get('enabled', '').lower() == 'true':
                    configs.append({
                        'manufacturer': row['manufacturer'].strip(),
                        'model': row['model'].strip(),
                        'url': row['carsensor_url'].strip(),
                        'page2_url': row.get('page2_url', '').strip(),
                        'min_year': int(row.get('min_year', MIN_YEAR)),
                        'max_pages': int(row.get('max_pages', 20)),
                        'priority': int(row.get('priority', 999)),
                        'notes': row.get('notes', '').strip()
                    })
        
        # Process in CSV file order (removed priority sorting)
        logger.info(f"Loaded {len(configs)} enabled vehicle configurations")
        
        for config in configs:
            logger.info(f"  {config['priority']}: {config['manufacturer']} {config['model']} (max {config['max_pages']} pages)")
        
        return configs

    async def setup_model_ids(self, vehicle_config):
        """Get or create manufacturer and model IDs"""
        if not self.db.pool:
            await self.db.connect()
            
        manufacturer_id = await self.db.get_or_create_manufacturer(vehicle_config['manufacturer'])
        model_id = await self.db.get_or_create_model(manufacturer_id, vehicle_config['model'])
        
        return manufacturer_id, model_id

    async def fetch_page(self, session, url, retries=3):
        for attempt in range(retries):
            headers = {
                "User-Agent": random.choice(USER_AGENTS),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Cache-Control": "no-cache"
            }
            try:
                timeout = aiohttp.ClientTimeout(total=30, connect=10)
                async with session.get(url, headers=headers, timeout=timeout, ssl=False) as response:
                    if response.status == 200:
                        text = await response.text()
                        logger.info(f"Successfully fetched {url} ({len(text)} chars)")
                        return text
                    else:
                        logger.warning(f"HTTP {response.status} for {url}")
            except asyncio.TimeoutError:
                logger.warning(f"Timeout fetching {url} (attempt {attempt + 1})")
            except Exception as e:
                logger.error(f"Error fetching {url} (attempt {attempt + 1}): {e}")
            
            if attempt < retries - 1:
                logger.info(f"Retrying {url} in {2 + attempt} seconds...")
                await asyncio.sleep(2 + attempt)
        
        logger.error(f"Failed to fetch {url} after {retries} attempts")
        return None

    def setup_selenium_driver(self):
        """Setup headless Chrome driver for JavaScript-heavy pages"""
        if self.driver is None:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            logger.info("Selenium Chrome driver initialized")
        return self.driver

    async def get_image_urls_from_detail_page(self, detail_url, max_retries=2):
        """Uses Selenium to get all images from the detail page gallery"""
        for attempt in range(max_retries):
            try:
                driver = self.setup_selenium_driver()
                logger.info(f"Loading detail page to get all gallery images (attempt {attempt + 1}/{max_retries}): {detail_url}")
                driver.get(detail_url)
                
                # Wait for page to load
                time.sleep(3)
                
                # Get the main image URL from the detail page
                image_urls = []
                bkkn_images = []
                try:
                    main_img = driver.find_element(By.ID, "js-mainPhoto")
                    if main_img:
                        main_src = main_img.get_attribute("src")
                        if main_src and ("ccsrpcma.carsensor.net" in main_src or "ccsrpcml.carsensor.net" in main_src):
                            bkkn_images.append(main_src)
                            format_type = "BKKN" if "bkkn" in main_src else "ML"
                            logger.info(f"Found {format_type} main image: {main_src}")
                        else:
                            logger.info(f"Main image not CarSensor format, will search gallery: {main_src}")
                        
                except Exception as e:
                    logger.warning(f"Could not find main image, will search gallery: {e}")

                # Click the gallery expansion button to open the full gallery
                try:
                    expansion_buttons = driver.find_elements(By.CSS_SELECTOR, "div.detailSlider__expansion")
                    if not expansion_buttons:
                        raise Exception(f"No gallery expansion button found for {detail_url}")
                    
                    logger.info("Found gallery expansion button. Clicking to open gallery...")
                    expansion_button = expansion_buttons[0]
                    driver.execute_script("arguments[0].scrollIntoView(true);", expansion_button)
                    time.sleep(1)
                    driver.execute_script("arguments[0].click();", expansion_button)
                
                    # Wait for the gallery to load
                    time.sleep(3)
                    
                    # Navigate through all gallery images
                    max_attempts = 50  # Safety limit
                    attempts = 0
                    
                    while attempts < max_attempts:
                        try:
                            # Get current image URL from gallery
                            gallery_img = driver.find_element(By.ID, "js-mainPhoto")
                            if gallery_img:
                                img_src = gallery_img.get_attribute("src")
                                if img_src and ("ccsrpcma.carsensor.net" in img_src or "ccsrpcml.carsensor.net" in img_src):
                                    if img_src not in bkkn_images:
                                        bkkn_images.append(img_src)
                                        format_type = "BKKN" if "bkkn" in img_src else "ML"
                                        logger.info(f"Found {format_type} image {len(bkkn_images)}: {img_src}")
                            
                            # Try to click next button to get next image
                            next_buttons = driver.find_elements(By.ID, "js-nextPhoto")
                            if next_buttons and next_buttons[0].is_enabled():
                                driver.execute_script("arguments[0].click();", next_buttons[0])
                                time.sleep(1)
                                attempts += 1
                                
                                # Check if we've cycled back to the first image
                                current_img = driver.find_element(By.ID, "js-mainPhoto")
                                current_src = current_img.get_attribute("src")
                                if current_src in image_urls[:1]:
                                    logger.info("Cycled back to first image, all gallery images collected")
                                    break
                            else:
                                logger.info("No next button found or disabled, finished collecting gallery images")
                                break
                            
                        except Exception as e:
                            logger.debug(f"Error in gallery navigation: {e}")
                            break
                    
                    # Use the bkkn images we collected
                    image_urls = bkkn_images
                    
                except Exception as e:
                    logger.warning(f"Could not access gallery for {detail_url}: {e}. Using any bkkn images found: {len(bkkn_images)}")
                    image_urls = bkkn_images
            
                if image_urls:
                    logger.info(f"Successfully extracted {len(image_urls)} CarSensor image URLs")
                    return image_urls
                else:
                    logger.warning(f"No images found on attempt {attempt + 1}/{max_retries} for {detail_url}")
                    if attempt < max_retries - 1:
                        logger.info(f"Retrying in 5 seconds...")
                        time.sleep(5)
                        continue
                    else:
                        logger.error(f"FAILED: No CarSensor images found after {max_retries} attempts for {detail_url}")
                        return []

            except Exception as e:
                logger.error(f"Error with Selenium image extraction (attempt {attempt + 1}/{max_retries}) for {detail_url}: {e}")
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in 5 seconds...")
                    time.sleep(5)
                    continue
                else:
                    logger.error(f"FAILED: All {max_retries} attempts failed for {detail_url}")
                    return []
        
        return []

    def cleanup_selenium(self):
        """Clean up Selenium driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None

    async def parse_vehicle(self, session, vehicle_div, manufacturer_id, model_id, manufacturer_name, model_name):
        vehicle = {"source_site": "carsensor"}
        try:
            # Ensure database is connected
            if not self.db.pool:
                await self.db.connect()
                
            # Find the main image link (contains the detail URL)
            link_tag = vehicle_div.select_one('.cassetteMain__mainImg a')
            if not link_tag or not link_tag.get('href'):
                logger.warning("Could not find detail link for a vehicle.")
                return None
            
            detail_url = link_tag['href']
            if not detail_url.startswith('http'):
                detail_url = "https://www.carsensor.net" + detail_url
            
            vehicle["source_url"] = detail_url
            
            # Extract source ID from CarSensor URL
            source_id_match = re.search(r'/([A-Z0-9]+)/index\.html', detail_url)
            if source_id_match:
                vehicle["source_id"] = source_id_match.group(1)
            else:
                alt_match = re.search(r'/detail/([A-Z0-9]+)/', detail_url)
                vehicle["source_id"] = alt_match.group(1) if alt_match else "N/A"
                
            if vehicle["source_id"] == "N/A":
                logger.warning(f"Could not extract source_id from URL: {detail_url}")
                return None

            # Set manufacturer and model IDs
            vehicle["manufacturer_id"] = manufacturer_id
            vehicle["model_id"] = model_id

            # Get title from image alt text
            img_elem = vehicle_div.select_one('.cassetteMain__mainImg img')
            if img_elem and img_elem.get('alt'):
                japanese_title = img_elem['alt'].strip()
                english_title = self.translator.translate_text(japanese_title)
                
                # Include manufacturer and model in title
                if manufacturer_name not in english_title and model_name not in english_title:
                    english_title = f"{manufacturer_name} {model_name} {english_title}"
                
                vehicle["title_description"] = english_title[:500] if len(english_title) > 500 else english_title
            else:
                vehicle["title_description"] = f"{manufacturer_name} {model_name}"

            # Parse price
            price_main_elem = vehicle_div.select_one(".totalPrice__mainPriceNum")
            price_sub_elem = vehicle_div.select_one(".totalPrice__subPriceNum")
            if price_main_elem:
                price_str = price_main_elem.text.strip()
                if price_sub_elem:
                    price_str += price_sub_elem.text.strip()
                vehicle["price_vehicle_yen"] = int(float(price_str) * 10000)
            else:
                 vehicle["price_vehicle_yen"] = 0
            vehicle["price_total_yen"] = vehicle["price_vehicle_yen"]

            # Parse year and mileage
            vehicle["model_year_ad"] = 0
            vehicle["mileage_km"] = 0
            spec_boxes = vehicle_div.select(".specList__detailBox")
            for box in spec_boxes:
                dt = box.find("dt")
                dd = box.find("dd")
                if dt and dd:
                    label = dt.text.strip()
                    value = dd.text.strip()
                    if "年式" in label:
                        year_match = re.search(r'(\d{4})', value)
                        if year_match:
                            vehicle["model_year_ad"] = int(year_match.group(1))
                    elif "走行距離" in label:
                        mileage_match = re.search(r'([\d\.]+)', value)
                        if mileage_match:
                            mileage_val = float(mileage_match.group(1))
                            if "万km" in value:
                                vehicle["mileage_km"] = int(mileage_val * 10000)
                            else:
                                vehicle["mileage_km"] = int(mileage_val)
            
            # Skip old vehicles
            if vehicle["model_year_ad"] != 0 and vehicle["model_year_ad"] < MIN_YEAR:
                return None
            
            # Parse location
            area_div = vehicle_div.select_one(".cassetteSub__area")
            if area_div:
                location_parts = [p.text.strip() for p in area_div.find_all("p")]
                vehicle["location_prefecture"] = " ".join(location_parts)
            else:
                vehicle["location_prefecture"] = "N/A"

            vehicle["has_repair_history"] = False
            vehicle["has_warranty"] = False

            # Get all image URLs from detail page gallery
            image_urls = await self.get_image_urls_from_detail_page(detail_url)
            
            vehicle["images"] = []
            if image_urls:
                logger.info(f"Found {len(image_urls)} image URLs for vehicle {vehicle['source_id']}")
                
                # Store all gallery images
                gallery_images = []
                for i, url in enumerate(image_urls):
                    try:
                        # Determine file extension from URL
                        ext = "jpg"
                        if ".png" in url.lower():
                            ext = "png"
                        elif ".webp" in url.lower():
                            ext = "webp"
                        elif ".JPG" in url:
                            ext = "JPG"
                        
                        filename = f"image_{i+1:03d}.{ext}"
                        
                        gallery_images.append({
                            "local_path": None,
                            "original_url": url,
                            "filename": filename,
                            "file_size": 0,
                            "is_primary": i == 0,
                            "alt_text": f"{model_name} Image {i + 1}",
                            "vehicle_id": None,
                            "image_order": i
                        })
                        logger.info(f"✅ Stored gallery image {i+1}/{len(image_urls)}: {url[:80]}...")
                        
                    except Exception as e:
                        logger.error(f"Error processing gallery image {i+1}: {e}")
                
                vehicle["images"] = gallery_images
                logger.info(f"🎉 Successfully stored {len(gallery_images)} gallery images for vehicle {vehicle['source_id']}")
            else:
                logger.warning(f"No image URLs found for vehicle {vehicle['source_id']}")

            return vehicle
        except Exception as e:
            logger.error(f"Error parsing vehicle. URL: {vehicle.get('source_url', 'N/A')}, Error: {e}", exc_info=True)
            return None

    async def scrape_model(self, vehicle_config):
        """Scrape a single make/model based on configuration"""
        logger.info(f"🚗 Starting scraper for {vehicle_config['manufacturer']} {vehicle_config['model']}")
        logger.info(f"📋 URL: {vehicle_config['url']}")
        logger.info(f"📋 Max pages: {vehicle_config['max_pages']}")
        
        # Get or create manufacturer and model IDs
        manufacturer_id, model_id = await self.setup_model_ids(vehicle_config)
        
        # Create session with better connection settings
        connector = aiohttp.TCPConnector(
            limit=10,
            limit_per_host=3,
            ttl_dns_cache=300,
            use_dns_cache=True,
            ssl=False
        )
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            page_num = 1
            all_vehicles = []
            found_vehicle_ids = set()  # Track vehicle IDs we've already processed
            
            while True:
                logger.info(f"📄 STARTING PAGE {page_num} - Searching for {vehicle_config['manufacturer']} {vehicle_config['model']}...")
                
                # Build page URL with DUAL URL SUPPORT
                if page_num == 1:
                    url = vehicle_config['url']
                    logger.info(f"📄 Page 1 URL: {url}")
                elif page_num == 2 and vehicle_config.get('page2_url'):
                    url = vehicle_config['page2_url']
                    logger.info(f"📄 Page 2 URL: {url}")
                else:
                    # For page 3+, replace index2.html with indexN.html in page2_url
                    if vehicle_config.get('page2_url') and 'index2.html' in vehicle_config['page2_url']:
                        url = vehicle_config['page2_url'].replace('index2.html', f'index{page_num}.html')
                        logger.info(f"📄 Page {page_num} URL (generated): {url}")
                    else:
                        # Fallback to original method if no page2_url
                        base_url = vehicle_config['url'].split('?')[0]
                        params = vehicle_config['url'].split('?')[1] if '?' in vehicle_config['url'] else ''
                        url = f"{base_url}/index{page_num}.html?{params}"
                        logger.warning(f"📄 Page {page_num} URL (fallback): {url}")
                
                html = await self.fetch_page(session, url)
                if not html:
                    logger.warning(f"Failed to fetch page {page_num}")
                    break
                    
                soup = BeautifulSoup(html, "html.parser")
                
                # Find vehicle containers
                vehicle_divs = soup.find_all("div", class_="cassetteMain")
                logger.info(f"Found {len(vehicle_divs)} vehicle cassettes on page {page_num}")

                if not vehicle_divs:
                    logger.info(f"No vehicles found on page {page_num}. Reached end of results.")
                    break
                
                # Process vehicles and track duplicates
                processed_count = 0
                new_vehicles_on_page = 0
                duplicate_vehicles_on_page = 0
                
                # First pass: quickly check for duplicates by extracting source_ids
                page_source_ids = []
                for div in vehicle_divs:
                    try:
                        link_tag = div.select_one('.cassetteMain__mainImg a')
                        if link_tag and link_tag.get('href'):
                            detail_url = link_tag['href']
                            if not detail_url.startswith('http'):
                                detail_url = "https://www.carsensor.net" + detail_url
                            
                            # Extract source ID
                            source_id_match = re.search(r'/([A-Z0-9]+)/index\.html', detail_url)
                            if source_id_match:
                                source_id = source_id_match.group(1)
                            else:
                                alt_match = re.search(r'/detail/([A-Z0-9]+)/', detail_url)
                                source_id = alt_match.group(1) if alt_match else None
                            
                            if source_id:
                                page_source_ids.append(source_id)
                                if source_id in found_vehicle_ids:
                                    duplicate_vehicles_on_page += 1
                                else:
                                    new_vehicles_on_page += 1
                    except:
                        pass
                
                # Calculate duplicate percentage
                total_on_page = len(page_source_ids)
                duplicate_percentage = (duplicate_vehicles_on_page / total_on_page * 100) if total_on_page > 0 else 0
                
                logger.info(f"📊 Page {page_num} Quick Check: {new_vehicles_on_page} new, {duplicate_vehicles_on_page} duplicates ({duplicate_percentage:.1f}% duplicates)")
                
                # STOP CONDITIONS:
                # 1. If page has fewer than 30 vehicles AND no duplicates (true last page)
                if len(vehicle_divs) < 30 and duplicate_percentage == 0:
                    logger.success(f"🏁 LAST PAGE detected: {len(vehicle_divs)} vehicles (< 30) with no duplicates")
                # 2. If more than 80% are duplicates (we've gone past the end)
                elif duplicate_percentage > 80:
                    logger.warning(f"⚠️ Page {page_num} has {duplicate_percentage:.1f}% duplicates. We've likely gone past the last page.")
                    logger.success(f"🏁 Stopping - reached end of unique results for {vehicle_config['manufacturer']} {vehicle_config['model']}")
                    break
                # 3. If ALL vehicles are duplicates
                elif new_vehicles_on_page == 0 and total_on_page > 0:
                    logger.warning(f"⚠️ Page {page_num} has 100% duplicates. Definitely past the last page.")
                    logger.success(f"🏁 Stopping - no new vehicles found for {vehicle_config['manufacturer']} {vehicle_config['model']}")
                    break
                
                # Process only the new vehicles
                for i, div in enumerate(vehicle_divs):
                    try:
                        # Quick check if this is a duplicate
                        link_tag = div.select_one('.cassetteMain__mainImg a')
                        if link_tag and link_tag.get('href'):
                            detail_url = link_tag['href']
                            if not detail_url.startswith('http'):
                                detail_url = "https://www.carsensor.net" + detail_url
                            
                            # Extract source ID for quick duplicate check
                            source_id_match = re.search(r'/([A-Z0-9]+)/index\.html', detail_url)
                            if source_id_match:
                                quick_source_id = source_id_match.group(1)
                            else:
                                alt_match = re.search(r'/detail/([A-Z0-9]+)/', detail_url)
                                quick_source_id = alt_match.group(1) if alt_match else None
                            
                            # Skip if duplicate
                            if quick_source_id and quick_source_id in found_vehicle_ids:
                                logger.debug(f"⭕ Skipping duplicate vehicle {quick_source_id}")
                                continue
                        
                        # Process the vehicle
                        vehicle = await self.parse_vehicle(
                            session, div, manufacturer_id, model_id, 
                            vehicle_config['manufacturer'], vehicle_config['model']
                        )
                        
                        if vehicle:
                            source_id = vehicle["source_id"]
                            
                            # Double-check for duplicate (belt and suspenders)
                            if source_id in found_vehicle_ids:
                                logger.debug(f"⭕ Skipping duplicate vehicle {source_id} (caught in processing)")
                                continue
                            
                            # Add to tracking set
                            found_vehicle_ids.add(source_id)
                            
                            # Save vehicle to database
                            vehicle_id = await self.db.create_vehicle(vehicle)
                            logger.info(f"💾 Saved vehicle: {vehicle['title_description'][:40]}...")
                            
                            # Save images
                            for img in vehicle.get("images", []):
                                img["vehicle_id"] = vehicle_id
                                await self.db.create_vehicle_image(img)
                            
                            all_vehicles.append(vehicle)
                            processed_count += 1
                            
                    except Exception as e:
                        logger.error(f"Failed to process vehicle {i+1}: {e}")
                
                logger.success(f"✅ PAGE {page_num} COMPLETE: {processed_count} new vehicles saved | TOTAL: {len(all_vehicles)} vehicles")
                
                # Check if this is the last page (< 30 vehicles with low duplicate rate)
                if len(vehicle_divs) < 30 and duplicate_percentage < 50:
                    logger.success(f"🏁 Reached last page (only {len(vehicle_divs)} vehicles on page)")
                    break
                
                page_num += 1
                
                # Stop conditions
                if page_num > vehicle_config['max_pages']:
                    logger.info(f"Reached max pages limit ({vehicle_config['max_pages']})")
                    break
                
                # Safety: hard limit
                if page_num > 50:
                    logger.warning(f"Reached hard limit of 50 pages")
                    break
                
                # Add delay between pages
                await asyncio.sleep(random.uniform(1, 3))
            
            logger.success(f"✅ Completed {vehicle_config['manufacturer']} {vehicle_config['model']}: {len(all_vehicles)} vehicles scraped")
            return all_vehicles

    async def scrape_all_models(self):
        """Scrape all enabled models from configuration"""
        vehicle_configs = self.load_vehicle_configs()
        
        if not vehicle_configs:
            logger.error("No vehicle configurations loaded!")
            return
        
        await self.db.connect()
        
        total_vehicles = 0
        failed_models = []
        
        for i, config in enumerate(vehicle_configs, 1):
            try:
                logger.info(f"\n{'='*60}")
                logger.info(f"SCRAPING MODEL {i}/{len(vehicle_configs)}: {config['manufacturer']} {config['model']}")
                logger.info(f"{'='*60}")
                
                vehicles = await self.scrape_model(config)
                total_vehicles += len(vehicles)
                
                logger.success(f"✅ COMPLETED: {config['manufacturer']} {config['model']} - {len(vehicles)} vehicles")
                
            except Exception as e:
                logger.error(f"❌ FAILED: {config['manufacturer']} {config['model']} - {e}")
                failed_models.append(f"{config['manufacturer']} {config['model']}")
                continue
            
            # Add delay between models
            if i < len(vehicle_configs):
                logger.info(f"⏳ Waiting 10 seconds before next model...")
                await asyncio.sleep(10)
        
        # Final summary
        logger.info(f"\n{'='*60}")
        logger.info(f"SCRAPING COMPLETE!")
        logger.info(f"{'='*60}")
        logger.success(f"✅ Total vehicles scraped: {total_vehicles}")
        logger.info(f"📊 Models processed: {len(vehicle_configs) - len(failed_models)}/{len(vehicle_configs)}")
        
        if failed_models:
            logger.warning(f"❌ Failed models: {', '.join(failed_models)}")
        
        await self.db.disconnect()
        self.cleanup_selenium()

async def main():
    logger.info("🚗 Universal CarSensor Scraper Starting")
    logger.info("=" * 60)
    
    config = type('Config', (), {'database_url': DATABASE_URL})()
    scraper = UniversalCarSensorScraper(config)
    
    try:
        await scraper.scrape_all_models()
    except Exception as e:
        logger.error(f"Scraper failed: {e}", exc_info=True)
        return False

if __name__ == "__main__":
    logger.remove()
    
    # Enhanced terminal logging
    logger.add(
        sys.stderr, 
        level="INFO",
        format="<green>{time:HH:mm:ss}</green> | <level>{level:8}</level> | <cyan>{message}</cyan>",
        colorize=True
    )
    
    # File logging
    logger.add(
        "/mnt/c/Users/ibm/Documents/GPSTrucksJapan/scrapers/universal_scraper.log", 
        level="DEBUG", 
        rotation="10 MB",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level:8} | {message}"
    )
    
    print("🚀 Starting Universal CarSensor Scraper")
    print("=" * 60)
    print("📄 Configuration: vehicle_config.csv")
    print("📝 Logs: universal_scraper.log")
    print("=" * 60)

    asyncio.run(main())