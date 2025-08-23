#!/usr/bin/env python3
"""
Working scraper for Land Cruiser 70 - minimal version that definitely works
Based on the successful test_scraper.py but with fixed syntax
"""

import asyncio
import aiohttp
from pathlib import Path
from bs4 import BeautifulSoup
from loguru import logger

# Configure detailed logging
logger.remove()  # Remove default handler
logger.add(
    "realtime_scraper.log",
    rotation="10 MB",
    retention="1 day",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level:8} | {message}",
    backtrace=True,
    diagnose=True
)
logger.add(
    lambda msg: print(msg, end=""),  # Also print to console
    level="INFO",
    format="{time:HH:mm:ss} | {level:8} | {message}\n"
)
import asyncpg
from datetime import datetime
import re
from translator import VehicleTranslator
import time

# Configuration
DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"
BASE_URL = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S149&AR=1*7&SKIND=1"

class WorkingScraper:
    def __init__(self):
        self.translator = VehicleTranslator()
        self.db_pool = None
        
    async def connect_db(self):
        """Connect to database"""
        self.db_pool = await asyncpg.create_pool(DATABASE_URL)
        logger.info("Database connected")
        
    async def save_vehicle(self, vehicle_data):
        """Save vehicle immediately to database - using exact same format as test_scraper.py"""
        logger.debug(f"🔄 Attempting to save vehicle: {vehicle_data['source_id']}")
        
        try:
            async with self.db_pool.acquire() as conn:
                # Insert vehicle with exact same fields that worked for vehicles 274-278
                vehicle_id = await conn.fetchval("""
                    INSERT INTO vehicles (
                        source_id, source_url, source_site, manufacturer_id, model_id, 
                        title_description, price_vehicle_yen, price_total_yen, 
                        model_year_ad, mileage_km, location_prefecture,
                        has_repair_history, has_warranty, is_available, last_scraped_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, NOW()
                    )
                    RETURNING id
                """, 
                vehicle_data['source_id'],
                vehicle_data['source_url'], 
                'carsensor',
                1,  # Toyota
                54, # Land Cruiser 70
                vehicle_data['title_description'],
                vehicle_data['price_total_yen'],  # price_vehicle_yen
                vehicle_data['price_total_yen'],  # price_total_yen
                vehicle_data['model_year_ad'],
                vehicle_data['mileage_km'],
                vehicle_data.get('location_prefecture', ''),
                False,  # has_repair_history
                False   # has_warranty
                )
                
                logger.success(f"✅ NEW VEHICLE {vehicle_id}: {vehicle_data['source_id']} - {vehicle_data['title_description'][:60]}...")
                
                # Save images if any
                image_count = 0
                if 'images' in vehicle_data and vehicle_data['images']:
                    for i, img_url in enumerate(vehicle_data['images']):
                        try:
                            await conn.execute("""
                                INSERT INTO vehicle_images (
                                    vehicle_id, original_url, filename, is_primary, alt_text
                                ) VALUES ($1, $2, $3, $4, $5)
                            """, vehicle_id, img_url, f"image_{i+1:03d}.jpg", i == 0, f"Vehicle image {i+1}")
                            image_count += 1
                        except Exception as img_err:
                            logger.warning(f"⚠️  Failed to save image {i+1} for vehicle {vehicle_id}: {img_err}")
                    
                    if image_count > 0:
                        logger.success(f"📷 Saved {image_count} images for vehicle {vehicle_id}")
                else:
                    logger.warning(f"📷 No images found for vehicle {vehicle_id}: {vehicle_data['source_id']}")
                
                return vehicle_id
                
        except Exception as e:
            if "duplicate key" in str(e):
                logger.info(f"⏭️  Vehicle {vehicle_data['source_id']} already exists - skipping")
                return None
            else:
                logger.error(f"❌ Error saving vehicle {vehicle_data['source_id']}: {e}")
                return None

    async def fetch_page(self, url):
        """Fetch a page with proper headers"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/108.0.0.0 Safari/537.36'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    content = await response.text()
                    logger.info(f"Fetched page: {len(content)} chars")
                    return content
                else:
                    logger.error(f"Failed to fetch {url}: {response.status}")
                    return None

    def parse_vehicles(self, html_content, page_url):
        """Parse vehicles from HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        vehicles = []
        
        # Find vehicle listings
        vehicle_divs = soup.find_all('div', class_='cassetteMain')
        logger.info(f"Found {len(vehicle_divs)} vehicles on page")
        
        for div in vehicle_divs:
            try:
                vehicle = {}
                
                # Extract source ID and URL
                link_elem = div.find('a', href=True)
                if link_elem:
                    detail_url = "https://www.carsensor.net" + link_elem['href']
                    vehicle['source_url'] = detail_url
                    
                    # Extract source ID from URL
                    match = re.search(r'/([A-Z0-9]+)/index\.html', detail_url)
                    if match:
                        vehicle['source_id'] = match.group(1)
                    else:
                        continue
                else:
                    continue
                
                # Get title from image alt text
                img_elem = div.select_one('.cassetteMain__mainImg img')
                if img_elem and img_elem.get('alt'):
                    japanese_title = img_elem['alt'].strip()
                    english_title = self.translator.translate_text(japanese_title)
                    vehicle['title_description'] = english_title[:500]
                else:
                    vehicle['title_description'] = "Toyota Land Cruiser 70"
                
                # Extract price using LC300 scraper logic
                price_main_elem = div.select_one(".totalPrice__mainPriceNum")
                price_sub_elem = div.select_one(".totalPrice__subPriceNum")
                if price_main_elem:
                    price_str = price_main_elem.text.strip()
                    if price_sub_elem:
                        price_str += price_sub_elem.text.strip()
                    vehicle['price_total_yen'] = int(float(price_str) * 10000)
                else:
                    # Fallback to cassettePrice__total 
                    price_elem = div.find('span', class_='cassettePrice__total')
                    if price_elem:
                        price_text = price_elem.get_text(strip=True)
                        # Remove commas and extract numbers properly
                        price_clean = price_text.replace(',', '').replace('万円', '').replace('円', '')
                        price_match = re.search(r'(\d+\.?\d*)', price_clean)
                        if price_match:
                            vehicle['price_total_yen'] = int(float(price_match.group(1)) * 10000)
                        else:
                            vehicle['price_total_yen'] = 0
                    else:
                        vehicle['price_total_yen'] = 0
                
                # Extract year, mileage, and location
                detail_items = div.find_all('li', class_='cassetteDetail__detailItem')
                vehicle['model_year_ad'] = 2020  # Default
                vehicle['mileage_km'] = 0       # Default
                vehicle['location_prefecture'] = ''  # Default
                
                for item in detail_items:
                    text = item.get_text(strip=True)
                    # Year
                    year_match = re.search(r'(\d{4})', text)
                    if year_match and 1990 <= int(year_match.group(1)) <= 2024:
                        vehicle['model_year_ad'] = int(year_match.group(1))
                    # Mileage
                    mileage_match = re.search(r'([\d,\.]+)km', text)
                    if mileage_match:
                        mileage_str = mileage_match.group(1).replace(',', '').replace('.', '')
                        try:
                            vehicle['mileage_km'] = int(float(mileage_str))
                        except:
                            vehicle['mileage_km'] = 0
                
                # Try to find location from other elements
                location_elem = div.find('span', class_='cassettePrice__area')
                if location_elem:
                    vehicle['location_prefecture'] = location_elem.get_text(strip=True)
                else:
                    vehicle['location_prefecture'] = '関東'  # Default for this search
                
                # For now, just use the main image from the listing
                if img_elem and img_elem.get('src'):
                    main_img_url = img_elem['src']
                    if 'carsensor.net' in main_img_url:
                        vehicle['images'] = [main_img_url]
                    else:
                        vehicle['images'] = []
                else:
                    vehicle['images'] = []
                
                vehicles.append(vehicle)
                logger.info(f"✅ Parsed vehicle: {vehicle['source_id']}")
                
            except Exception as e:
                logger.error(f"Error parsing vehicle: {e}")
                continue
        
        return vehicles

    async def scrape_page(self, page_url, page_num):
        """Scrape a single page"""
        logger.info(f"📄 PAGE {page_num} START: {page_url}")
        
        html_content = await self.fetch_page(page_url)
        if not html_content:
            logger.error(f"❌ Failed to fetch page {page_num}")
            return []
        
        vehicles = self.parse_vehicles(html_content, page_url)
        logger.info(f"🚗 Found {len(vehicles)} vehicles on page {page_num}")
        
        # Save each vehicle immediately
        saved_count = 0
        new_vehicles = 0
        
        for i, vehicle in enumerate(vehicles, 1):
            logger.info(f"🔄 Processing vehicle {i}/{len(vehicles)}: {vehicle['source_id']}")
            
            try:
                vehicle_id = await self.save_vehicle(vehicle)
                if vehicle_id:
                    new_vehicles += 1
                    logger.info(f"🎉 NEW: Vehicle {i}/{len(vehicles)} saved as ID {vehicle_id}")
                else:
                    logger.info(f"⏭️  SKIP: Vehicle {i}/{len(vehicles)} already exists")
                saved_count += 1
                
                # Small delay between saves
                await asyncio.sleep(0.5)
                
            except Exception as e:
                logger.error(f"❌ ERROR: Vehicle {i}/{len(vehicles)} - {vehicle.get('source_id', 'unknown')}: {e}")
        
        logger.success(f"✅ PAGE {page_num} COMPLETE: {new_vehicles} new vehicles, {saved_count - new_vehicles} duplicates, {len(vehicles) - saved_count} errors")
        return vehicles

    async def get_next_page_url(self, html_content, current_page):
        """Get next page URL - handles CarSensor's pagination format"""
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

    async def run(self):
        """Main scraping loop"""
        logger.info("🚀 STARTING LAND CRUISER 70 AUTO-SCRAPER")
        logger.info("=" * 60)
        
        await self.connect_db()
        
        # Get initial database count
        async with self.db_pool.acquire() as conn:
            initial_count = await conn.fetchval('SELECT COUNT(*) FROM vehicles')
            logger.info(f"📊 Starting with {initial_count} vehicles in database")
        
        current_url = BASE_URL
        page_num = 1
        total_vehicles = 0
        total_new_vehicles = 0
        
        logger.info(f"🎯 TARGET: Collect all Toyota Land Cruiser 70 vehicles across all pages")
        logger.info("=" * 60)
        
        while current_url and page_num <= 10:  # Safety limit
            try:
                logger.info(f"📄 STARTING PAGE {page_num}")
                
                # Scrape current page
                vehicles = await self.scrape_page(current_url, page_num)
                total_vehicles += len(vehicles)
                
                # Check database for new count
                async with self.db_pool.acquire() as conn:
                    current_count = await conn.fetchval('SELECT COUNT(*) FROM vehicles')
                    page_new_vehicles = current_count - initial_count - total_new_vehicles
                    total_new_vehicles = current_count - initial_count
                
                logger.success(f"📊 PROGRESS UPDATE:")
                logger.success(f"  ✅ Page {page_num}: {page_new_vehicles} new vehicles added")
                logger.success(f"  ✅ Total new vehicles: {total_new_vehicles}")
                logger.success(f"  ✅ Database total: {current_count} vehicles")
                
                # Get next page URL
                html_content = await self.fetch_page(current_url)
                if html_content:
                    current_url = await self.get_next_page_url(html_content, page_num)
                    if current_url:
                        logger.info(f"🔄 Found next page {page_num + 1}, continuing...")
                    else:
                        logger.info(f"🏁 No more pages found after page {page_num}")
                else:
                    logger.warning("⚠️  Could not fetch page for next page detection")
                    break
                
                page_num += 1
                
                # Delay between pages
                if current_url:
                    logger.info("⏳ Waiting 3 seconds before next page...")
                    await asyncio.sleep(3)
                
            except Exception as e:
                logger.error(f"❌ CRITICAL ERROR on page {page_num}: {e}")
                logger.error("🛑 Stopping scraper due to error")
                break
        
        # Final summary
        async with self.db_pool.acquire() as conn:
            final_count = await conn.fetchval('SELECT COUNT(*) FROM vehicles')
            
        logger.success("🎉 SCRAPING COMPLETED!")
        logger.success("=" * 60)
        logger.success(f"📊 FINAL RESULTS:")
        logger.success(f"  🚗 Pages processed: {page_num - 1}")
        logger.success(f"  📄 Total vehicles found: {total_vehicles}")
        logger.success(f"  ✅ New vehicles added: {total_new_vehicles}")
        logger.success(f"  📊 Final database count: {final_count}")
        logger.success("=" * 60)
        
        if self.db_pool:
            await self.db_pool.close()

async def main():
    scraper = WorkingScraper()
    await scraper.run()

if __name__ == "__main__":
    asyncio.run(main())