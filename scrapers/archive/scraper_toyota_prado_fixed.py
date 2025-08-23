#!/usr/bin/env python3
"""
Toyota Land Cruiser Prado scraper for GPS Trucks Japan
Scrapes CarSensor for Prado vehicles, collects full galleries,
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
BASE_URL = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S152&AR=1*7&SKIND=1"  # Toyota Prado search URL
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

    # Removed dynamic model creation methods - using hardcoded IDs for reliability

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

    async def delete_stale_vehicles(self, active_ids, source_site, model_id=None):
        async with self.pool.acquire() as conn:
            async with conn.transaction():
                if model_id:
                    # Only delete vehicles for this specific model
                    result = await conn.execute(
                        "DELETE FROM vehicles WHERE source_site = $1 AND model_id = $2 AND source_id NOT IN (SELECT unnest($3::text[]))",
                        source_site, model_id, list(active_ids)
                    )
                else:
                    # Original behavior (dangerous - deletes all models)
                    result = await conn.execute(
                        "DELETE FROM vehicles WHERE source_site = $1 AND source_id NOT IN (SELECT unnest($2::text[]))",
                    source_site, list(active_ids)
                )
                deleted_count = int(result.split(" ")[1]) if result.startswith("DELETE") else 0
                logger.info(f"Deleted {deleted_count} stale vehicles for {source_site}")
                return deleted_count

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

class CarSensorScraper:
    def __init__(self, config, resume=False):
        self.config = config
        self.db = DatabaseManager(config.database_url)
        self.image_dir = IMAGE_DIR
        self.image_dir.mkdir(exist_ok=True)
        self.translator = VehicleTranslator()
        self.driver = None
        self.found_vehicle_ids = set()  # Track vehicles found in this run
        self.resume_mode = resume
        self.progress_data = {}
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Load existing progress if resuming
        if self.resume_mode:
            self.load_progress()

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
            logger.info(f"💾 Progress saved: Page {current_page}/{total_pages}, {new_vehicles} new vehicles")
        except Exception as e:
            logger.warning(f"Failed to save progress: {e}")

    def load_progress(self):
        """Load progress from JSON file"""
        try:
            if PROGRESS_FILE.exists():
                with open(PROGRESS_FILE, 'r') as f:
                    self.progress_data = json.load(f)
                
                # Restore found vehicle IDs
                self.found_vehicle_ids = set(self.progress_data.get('found_vehicle_ids', []))
                
                logger.info(f"📂 Resuming from: Page {self.progress_data.get('current_page', 1)}")
                logger.info(f"📊 Previous session: {self.progress_data.get('new_vehicles', 0)} vehicles found")
                return True
            else:
                logger.info("🆕 No previous progress found - starting fresh")
                return False
        except Exception as e:
            logger.warning(f"Failed to load progress: {e} - starting fresh")
            return False

    def get_start_page(self):
        """Get the page to start from (for resume)"""
        if self.resume_mode and self.progress_data:
            # Start from the last incomplete page
            return self.progress_data.get('current_page', 1)
        return 1

    def clear_progress(self):
        """Clear progress file when scraping completes successfully"""
        try:
            if PROGRESS_FILE.exists():
                PROGRESS_FILE.unlink()
                logger.info("🗑️ Progress file cleared - scraping completed")
        except Exception as e:
            logger.warning(f"Failed to clear progress file: {e}")

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

    async def download_image(self, session, url, vehicle_dir, index):
        try:
            # Ensure URL is properly formatted
            if not url.startswith(('http:', 'https:')):
                if url.startswith('//'):
                    url = 'https:' + url
                else:
                    url = 'https://www.carsensor.net' + url

            # Add proper headers for image requests
            headers = {
                "User-Agent": random.choice(USER_AGENTS),
                "Referer": "https://www.carsensor.net/",
                "Accept": "image/webp,image/apng,image/*,*/*;q=0.8"
            }
            
            logger.info(f"Downloading image {index + 1}: {url}")
            
            timeout = aiohttp.ClientTimeout(total=30)
            async with session.get(url, headers=headers, timeout=timeout, ssl=False) as response:
                
                if response.status == 200:
                    content = await response.read()
                    if len(content) > 15000:  # Only save images larger than 15KB (high quality only)
                        ext = url.split(".")[-1].lower().split("?")[0] if "." in url else "jpg"
                        filename = f"image_{index:03d}.{ext}"
                        local_path = vehicle_dir / filename
                        
                        async with aiofiles.open(local_path, "wb") as f:
                            await f.write(content)
                        
                        file_size = local_path.stat().st_size
                        logger.info(f"Successfully saved HIGH-QUALITY image {index + 1}: {filename} ({file_size} bytes)")
                        
                        return {
                            "local_path": str(local_path),
                            "original_url": url,
                            "filename": filename,
                            "file_size": file_size,
                            "is_primary": index == 0,
                            "alt_text": f"Car Image {index + 1}",
                            "vehicle_id": None
                        }
                    else:
                        logger.debug(f"Image {index + 1} too small ({len(content)} bytes), skipping: {url}")
                elif response.status == 403:
                    logger.debug(f"Image {index + 1} - Access forbidden (403), skipping: {url}")
                elif response.status == 404:
                    logger.debug(f"Image {index + 1} - Not found (404), skipping: {url}")
                else:
                    logger.debug(f"Failed to download image {index + 1} - HTTP {response.status}: {url}")
                    
        except asyncio.TimeoutError:
            logger.error(f"Timeout downloading image {index + 1}: {url}")
        except Exception as e:
            logger.error(f"Error downloading image {index + 1} from {url}: {e}")
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
        """
        Uses Selenium to get all images from the detail page gallery.
        Follows the instructions from carsensorclicks.md to navigate through all gallery images.
        Includes retry logic for gallery failures to ensure every car gets images.
        """
        for attempt in range(max_retries):
            try:
                driver = self.setup_selenium_driver()
                logger.info(f"Loading detail page to get all gallery images (attempt {attempt + 1}/{max_retries}): {detail_url}")
                driver.get(detail_url)
                
                # Wait for page to load
                time.sleep(3)
                
                # Get the main image URL from the detail page (this is the correct format)
                image_urls = []
                bkkn_images = []
                try:
                    main_img = driver.find_element(By.ID, "js-mainPhoto")
                    if main_img:
                        main_src = main_img.get_attribute("src")
                        # Accept both bkkn and ml format images with proper parameters
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
                    # Check if gallery expansion button exists - if not, fail hard
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
                    
                    # Click on the first gallery thumbnail to exit any 360° mode and get into normal photo mode
                    try:
                        first_thumbnail = driver.find_element(By.CSS_SELECTOR, "a.js-photo")
                        if first_thumbnail:
                            logger.info("Clicking first gallery thumbnail to enter normal photo mode")
                            driver.execute_script("arguments[0].click();", first_thumbnail)
                            time.sleep(2)
                            
                            # Then click on main photo to ensure we're in the right state
                            main_photo = driver.find_element(By.ID, "js-mainPhoto")
                            if main_photo:
                                logger.info("Clicking main photo to clear any extra elements")
                                driver.execute_script("arguments[0].click();", main_photo)
                                time.sleep(1)
                    except Exception as e:
                        logger.warning(f"Could not click first thumbnail or main photo: {e}")
                    
                    # Now navigate through all gallery images
                    collected_urls = set(image_urls)  # Start with main image
                    max_attempts = 50  # Safety limit
                    attempts = 0
                    
                    while attempts < max_attempts:
                        try:
                            # Get current image URL from gallery
                            gallery_img = driver.find_element(By.ID, "js-mainPhoto")
                            if gallery_img:
                                img_src = gallery_img.get_attribute("src")
                                # Collect both bkkn and ml format images (both work with proper parameters)
                                if img_src and ("ccsrpcma.carsensor.net" in img_src or "ccsrpcml.carsensor.net" in img_src):
                                    if img_src not in bkkn_images:
                                        bkkn_images.append(img_src)
                                        format_type = "BKKN" if "bkkn" in img_src else "ML"
                                        logger.info(f"Found {format_type} image {len(bkkn_images)}: {img_src}")
                                # Skip other formats
                            
                            # Try to click next button to get next image
                            next_buttons = driver.find_elements(By.ID, "js-nextPhoto")
                            if next_buttons and next_buttons[0].is_enabled():
                                driver.execute_script("arguments[0].click();", next_buttons[0])
                                time.sleep(1)  # Wait longer for image to load
                                attempts += 1
                                
                                # Check if we've cycled back to the first image (end of gallery)
                                current_img = driver.find_element(By.ID, "js-mainPhoto")
                                current_src = current_img.get_attribute("src")
                                if current_src in image_urls[:1]:  # Back to first image
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
            
                # Every car should have at least one image - if we got images, return them
                if image_urls:
                    logger.info(f"Successfully extracted {len(image_urls)} CarSensor image URLs (BKKN + ML)")
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
        
        # This should never be reached, but just in case
        return []

    async def download_image_with_selenium(self, image_url, vehicle_dir, filename):
        """Download image using aiohttp with proper headers"""
        try:
            # Create session with proper headers mimicking a browser
            headers = {
                "User-Agent": random.choice(USER_AGENTS),
                "Referer": "https://www.carsensor.net/",
                "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
                "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
                "Cache-Control": "no-cache"
            }
            
            timeout = aiohttp.ClientTimeout(total=30)
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url, headers=headers, timeout=timeout, ssl=False) as response:
                    if response.status == 200:
                        image_data = await response.read()
                        if len(image_data) > 5000:  # Only save images larger than 5KB
                            file_path = vehicle_dir / filename
                            async with aiofiles.open(file_path, "wb") as f:
                                await f.write(image_data)
                            logger.info(f"✅ Downloaded {filename}: {len(image_data)} bytes")
                            return file_path
                        else:
                            logger.warning(f"⚠️ Image too small: {len(image_data)} bytes")
                            return None
                    else:
                        logger.warning(f"⚠️ HTTP {response.status} for {image_url}")
                        return None
                        
        except Exception as e:
            logger.error(f"❌ Error downloading {image_url}: {e}")
            return None

    def cleanup_selenium(self):
        """Clean up Selenium driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None

    async def parse_vehicle(self, session, vehicle_div):
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
            
            # Extract source ID from CarSensor URL format: /usedcar/detail/ABC123/index.html
            source_id_match = re.search(r'/([A-Z0-9]+)/index\.html', detail_url)
            if source_id_match:
                vehicle["source_id"] = source_id_match.group(1)
            else:
                # Try alternative pattern: /detail/ABC123/
                alt_match = re.search(r'/detail/([A-Z0-9]+)/', detail_url)
                vehicle["source_id"] = alt_match.group(1) if alt_match else "N/A"
                
            if vehicle["source_id"] == "N/A":
                logger.warning(f"Could not extract source_id from URL: {detail_url}")
                return None  # Skip this vehicle

            # Check if vehicle already has sufficient images
            async with self.db.pool.acquire() as conn:
                existing = await conn.fetchrow("""
                    SELECT v.id, COUNT(vi.id) as image_count
                    FROM vehicles v
                    LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
                    WHERE v.source_id = $1
                    GROUP BY v.id
                """, vehicle["source_id"])
                
                if existing and existing['image_count'] >= 40:
                    logger.info(f"⏭️ Skipping vehicle {vehicle['source_id']} - already has {existing['image_count']} images")
                    return None

            # Get title from image alt text (contains full vehicle description)
            img_elem = vehicle_div.select_one('.cassetteMain__mainImg img')
            if img_elem and img_elem.get('alt'):
                japanese_title = img_elem['alt'].strip()
                # Translate to English and truncate if too long
                english_title = self.translator.translate_text(japanese_title)
                
                # Force correct model name for Prado scraper
                if "Prado" not in english_title and "Land Cruiser" not in english_title:
                    # If no Prado mentioned, prepend it
                    english_title = f"Toyota Land Cruiser Prado {english_title}"
                
                vehicle["title_description"] = english_title[:500] if len(english_title) > 500 else english_title
            else:
                vehicle["title_description"] = "Toyota Land Cruiser Prado"
            
            # Use hardcoded IDs like working_scraper.py for reliability
            vehicle["manufacturer_id"] = 1   # Toyota (hardcoded)
            vehicle["model_id"] = 59         # Prado (hardcoded)

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
            
            if vehicle["model_year_ad"] != 0 and vehicle["model_year_ad"] < MIN_YEAR:
                return None
            
            area_div = vehicle_div.select_one(".cassetteSub__area")
            if area_div:
                location_parts = [p.text.strip() for p in area_div.find_all("p")]
                vehicle["location_prefecture"] = " ".join(location_parts)
            else:
                vehicle["location_prefecture"] = "N/A"

            vehicle["has_repair_history"] = False
            vehicle["has_warranty"] = False

            # --- STORE ALL GALLERY IMAGE URLS ---
            # Get all image URLs from detail page gallery (correct bkkn format)
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
                            "is_primary": i == 0,  # First image is primary
                            "alt_text": f"Toyota Land Cruiser Prado Image {i + 1}",
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
            # --- END OF GALLERY IMAGE STORAGE ---

            return vehicle
        except Exception as e:
            logger.error(f"Error parsing vehicle. URL: {vehicle.get('source_url', 'N/A')}, Error: {e}", exc_info=True)
            return None

    async def scrape_page(self, session, page_num):
        # Use the correct URL pattern: first page uses search URL, subsequent pages use index pattern
        if page_num == 1:
            url = BASE_URL
        else:
            url = f"https://www.carsensor.net/usedcar/bTO/s152/index{page_num}.html?AR=1%2A7"
        
        logger.info(f"Scraping page {page_num} ({url})")
        html = await self.fetch_page(session, url)
        if not html:
            return []
        soup = BeautifulSoup(html, "html.parser")
        
        # This method just returns vehicles, pagination handled separately
        
        # Find vehicle containers using the correct CarSensor structure
        vehicle_divs = soup.find_all("div", class_="cassetteMain")
        
        logger.info(f"Found {len(vehicle_divs)} vehicle cassettes on page {page_num}")

        if not vehicle_divs:
            logger.warning(f"No vehicle cassettes found on page {page_num}")
            return []
        
        # Process vehicles one by one and save immediately
        processed_count = 0
        vehicles = []  # Define the vehicles list
        for i, div in enumerate(vehicle_divs):
            try:
                vehicle = await self.parse_vehicle(session, div)
                if vehicle:
                    # Save vehicle to database immediately
                    await self.save_vehicle_to_db(vehicle)
                    vehicles.append(vehicle)  # Add to list
                    processed_count += 1
                    logger.info(f"✅ Saved vehicle {processed_count}/{len(vehicle_divs)} to database")
            except Exception as e:
                logger.error(f"Failed to process vehicle {i+1}: {e}")
        
        logger.info(f"✅ Processed {processed_count} vehicles on page {page_num}")
        return vehicles

    async def get_next_page_url(self, html_content, current_page):
        """Get next page URL - handles CarSensor's pagination format (copied from working_scraper.py)"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Method 1: Look for rel="next" link (CarSensor uses this)
        next_link = soup.find('link', rel='next')
        if next_link and next_link.get('href'):
            href = next_link['href']
            if href.startswith('http'):
                next_url = href
            else:
                next_url = "https://www.carsensor.net" + href
            logger.info(f"Found next page via rel='next': {next_url}")
            return next_url
        
        # Method 2: Look for "次へ" (Next) button
        next_button = soup.find('a', string=re.compile(r'次へ|Next'))
        if next_button and next_button.get('href'):
            next_url = "https://www.carsensor.net" + next_button['href']
            logger.info(f"Found next page via '次へ' button: {next_url}")
            return next_url
        
        # Method 3: Look for index2.html, index3.html pattern
        for link in soup.find_all('a', href=True):
            href = link['href']
            if re.search(r'/index(\d+)\.html', href):
                match = re.search(r'/index(\d+)\.html', href)
                page_num = int(match.group(1))
                if page_num == current_page + 1:
                    next_url = "https://www.carsensor.net" + href
                    logger.info(f"Found next page via index pattern: {next_url}")
                    return next_url
        
        # Method 4: Check if there are any pagination indicators
        pager = soup.find('div', class_='pager')
        if pager:
            page_links = pager.find_all('a', href=True)
            logger.info(f"Found {len(page_links)} pagination links")
            for link in page_links:
                href = link['href']
                if 'index' in href and str(current_page + 1) in href:
                    next_url = "https://www.carsensor.net" + href
                    logger.info(f"Found next page in pager: {next_url}")
                    return next_url
        
        logger.info(f"No more pages found after page {current_page}")
        return None
    
    async def save_vehicle_to_db(self, vehicle):
        """Save a single vehicle to database immediately"""
        if not self.db.pool:
            await self.db.connect()
        
        try:
            vehicle_id = await self.db.create_vehicle(vehicle)
            logger.info(f"💾 Saved vehicle: {vehicle['title_description'][:40]}...")
            
            for img in vehicle.get("images", []):
                img["vehicle_id"] = vehicle_id
                await self.db.create_vehicle_image(img)
            
            logger.info(f"💾 Saved {len(vehicle.get('images', []))} images for vehicle {vehicle_id}")
            
        except Exception as e:
            logger.error(f"Database save error: {e}")
            raise

    async def scrape_vehicles(self, max_pages=None):
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
            # Start from resume point or page 1
            start_page = self.get_start_page()
            page_num = start_page
            all_vehicles = []
            total_new_vehicles = 0
            
            if self.resume_mode and start_page > 1:
                logger.info(f"🔄 RESUMING from page {start_page}")
                total_new_vehicles = self.progress_data.get('new_vehicles', 0)
            
            while True:
                logger.info(f"📄 STARTING PAGE {page_num} - Searching for vehicles...")
                vehicles = await self.scrape_page(session, page_num)
                
                if not vehicles:
                    logger.info(f"No vehicles found on page {page_num}. Reached end of results.")
                    break
                        
                all_vehicles.extend(vehicles)
                page_new_vehicles = len(vehicles)  # All vehicles on this page are "new" for progress tracking
                total_new_vehicles += page_new_vehicles
                
                logger.success(f"✅ PAGE {page_num} COMPLETE: {len(vehicles)} vehicles processed | TOTAL: {len(all_vehicles)} vehicles")
                
                # Save progress after each page
                estimated_total_pages = max_pages if max_pages else 50  # Estimate if not known
                self.save_progress(page_num, estimated_total_pages, len(all_vehicles), total_new_vehicles)
                
                page_num += 1
                logger.info(f"➡️  Moving to page {page_num}...")
                if max_pages is not None and page_num > max_pages:
                    logger.info(f"Reached max pages limit ({max_pages})")
                    break
                
                # Safety: hard limit to prevent runaway scraping 
                if page_num > 50:  # Allow up to 50 pages to get all vehicles
                    logger.warning(f"Reached hard limit of 50 pages, stopping to prevent runaway scraping")
                    break
                
                # Add delay between pages to be respectful
                await asyncio.sleep(random.uniform(1, 3))
            
            logger.info(f"Scraping completed. Total vehicles found: {len(all_vehicles)} across {page_num - 1} pages")
            return all_vehicles

    async def sync_with_db(self, vehicles):
        if not vehicles:
            logger.info("No vehicles scraped, skipping database sync.")
            return
        if not self.db.pool:
            await self.db.connect()
        # Filter out None vehicles (skipped vehicles)
        valid_vehicles = [v for v in vehicles if v is not None]
        active_ids = {v["source_id"] for v in valid_vehicles if v.get("source_id") != "N/A"}
        
        logger.info(f"Processing {len(valid_vehicles)} valid vehicles out of {len(vehicles)} total")
        
        # Get model ID for Prado
        model_id = 59  # Prado model ID
        
        # Get active vehicles before processing
        all_active_vehicles = await self.db.get_active_vehicles_for_model(model_id)
        logger.info(f"📊 Currently tracking {len(all_active_vehicles)} active Prado vehicles")
        
        # Clear and track found vehicles
        self.found_vehicle_ids.clear()
        self.found_vehicle_ids.update(active_ids)
        
        try:
            for vehicle in valid_vehicles:
                vehicle_id = await self.db.create_vehicle(vehicle)
                logger.info(f"Upserted vehicle: {vehicle['title_description'][:40]}...")
                for img in vehicle.get("images", []):
                    img["vehicle_id"] = vehicle_id
                    await self.db.create_vehicle_image(img)
            
            # Note: Auto-sold marking and stale vehicle deletion disabled
            # A separate dedicated scraper will handle vehicle availability checking
            logger.info("ℹ️ Auto-sold marking disabled - vehicles will remain available until manually verified")
        finally:
            await self.db.disconnect()
            self.cleanup_selenium()

async def test_database_connection():
    print("🔍 Testing database connection...")
    db = DatabaseManager(DATABASE_URL)
    try:
        await db.connect()
        stats = await db.get_stats()
        print(f"✅ Database connected successfully!")
        print(f"   Current vehicles in database: {stats.get('total_vehicles', 0)}")
        await db.disconnect()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_scraper_basic(max_pages=1):
    print(f"\n🤖 Testing scraper ({max_pages} page(s) only)...")
    config = type('Config', (), {'database_url': DATABASE_URL})()
    scraper = CarSensorScraper(config)
    
    # Ensure database is connected
    await scraper.db.connect()
    
    try:
        vehicles = await scraper.scrape_vehicles(max_pages=max_pages)
        print(f"✅ Found {len(vehicles)} vehicles")
        
        if vehicles:
            print(f"\n📊 Sample vehicles:")
            for i, v in enumerate(vehicles[:3]):
                print(f"   {i+1}. {v.get('title_description', 'N/A')[:50]}...")
                print(f"      Price: ¥{v.get('price_vehicle_yen', 0):,}")
                print(f"      Images: {len(v.get('images', []))}")
        
        if vehicles:
            await scraper.sync_with_db(vehicles)
            print(f"✅ Data synced to database!")
        
        return True
    except Exception as e:
        logger.error(f"Scraper test failed: {e}", exc_info=True)
        print(f"❌ Scraper test failed: {e}")
        return False
    finally:
        await scraper.db.disconnect()

async def run_full_scraper(resume=False):
    if resume:
        print("🚗 Running full CarSensor scraper (RESUMING from previous progress)")
    else:
        print("🚗 Running full CarSensor scraper (all pages until end)")
    print("=" * 50)
    
    config = type('Config', (), {'database_url': DATABASE_URL})()
    scraper = CarSensorScraper(config, resume=resume)
    
    try:
        # Run scraper without page limit - will automatically go to the end
        vehicles = await scraper.scrape_vehicles()
        print(f"✅ Scraping completed! Found {len(vehicles)} total vehicles")
        
        if vehicles:
            print(f"\n📊 Sample vehicles:")
            for i, v in enumerate(vehicles[:5]):
                print(f"   {i+1}. {v.get('title_description', 'N/A')[:60]}...")
                print(f"      Price: ¥{v.get('price_vehicle_yen', 0):,}")
                print(f"      Year: {v.get('model_year_ad', 'N/A')}")
                print(f"      Images: {len(v.get('images', []))}")
        
        if vehicles:
            print(f"\n💾 Syncing {len(vehicles)} vehicles to database...")
            await scraper.sync_with_db(vehicles)
            print(f"✅ Database sync completed!")
            
            # Update featured vehicles
            await scraper.db.connect()
            async with scraper.db.pool.acquire() as conn:
                await conn.execute("UPDATE vehicles SET is_featured = TRUE WHERE id IN (SELECT id FROM vehicles ORDER BY created_at DESC LIMIT 12)")
                featured_count = await conn.fetchval("SELECT COUNT(*) FROM vehicles WHERE is_featured = TRUE")
                print(f"✅ Updated {featured_count} vehicles as featured")
            await scraper.db.disconnect()
        
        # Clear progress file on successful completion
        scraper.clear_progress()
        print("✅ Scraping completed successfully!")
        
        return True
    except Exception as e:
        logger.error(f"Full scraper failed: {e}", exc_info=True)
        print(f"❌ Full scraper failed: {e}")
        return False

async def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Daihatsu Hijet CarSensor Scraper')
    parser.add_argument('--resume', action='store_true', help='Resume from previous progress')
    parser.add_argument('--test', action='store_true', help='Run in test mode')
    args = parser.parse_args()
    
    print("🚗 CarSensor Japan - Daihatsu Hijet Scraper")
    print("=" * 40)
    
    if args.resume:
        print("🔄 Resume mode enabled")
    
    # Check if we should run test mode
    if args.test:
        db_ok = await test_database_connection()
        if not db_ok:
            print("\n❌ Database test failed. Make sure Docker containers are running and credentials are correct.")
            return
        
        scraper_ok = await test_scraper_basic(max_pages=1)
        if not scraper_ok:
            print("\n❌ Scraper test failed.")
            return
        
        print("\n🎉 All tests passed! Ready to run full scraper.")
        print("To run the full scraper: python test_scraper.py")
        return
    
    # Run full scraper by default
    await run_full_scraper(resume=args.resume)

if __name__ == "__main__":
    logger.remove()
    
    # Enhanced terminal logging with colors and timestamps
    logger.add(
        sys.stderr, 
        level="INFO",
        format="<green>{time:HH:mm:ss}</green> | <level>{level:8}</level> | <cyan>{message}</cyan>",
        colorize=True
    )
    
    # Detailed file logging
    logger.add(
        "scraper_lc200.log", 
        level="DEBUG", 
        rotation="10 MB",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level:8} | {message}"
    )
    
    print("🚀 Starting Land Cruiser 200 Gallery Scraper")
    print("=" * 60)
    print("📺 Live logs will appear below...")
    print("📁 Detailed logs saved to: scraper_lc200.log")
    print("=" * 60)

    asyncio.run(main())