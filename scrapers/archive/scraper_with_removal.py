#!/usr/bin/env python3
"""
Enhanced scraper that automatically marks vehicles as sold when they disappear from listings
"""

import asyncio
import aiohttp
from pathlib import Path
from bs4 import BeautifulSoup
from loguru import logger
import asyncpg
from datetime import datetime
import re
from translator import VehicleTranslator
import time

# Configuration
DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"
BASE_URL = "https://www.carsensor.net/usedcar/search.php?CARC=TO_S149&AR=1*7&SKIND=1"

class SmartScraper:
    def __init__(self):
        self.translator = VehicleTranslator()
        self.db_pool = None
        self.found_vehicle_ids = set()  # Track vehicles found in this run
        
    async def connect_db(self):
        """Connect to database"""
        self.db_pool = await asyncpg.create_pool(DATABASE_URL)
        logger.info("Database connected")
        
    async def mark_vehicle_sold(self, vehicle_id, source_id):
        """Mark a vehicle as sold"""
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                UPDATE vehicles 
                SET is_available = FALSE,
                    sold_detected_at = NOW(),
                    notes = COALESCE(notes, '') || ' [AUTO-DETECTED SOLD: ' || NOW()::date::text || ']'
                WHERE id = $1
            """, vehicle_id)
            logger.warning(f"🚫 MARKED SOLD: Vehicle ID {vehicle_id} (source: {source_id})")
            
    async def get_active_vehicles_for_model(self, model_id):
        """Get all active vehicles for this model from database"""
        async with self.db_pool.acquire() as conn:
            vehicles = await conn.fetch("""
                SELECT id, source_id 
                FROM vehicles 
                WHERE model_id = $1 
                AND is_available = TRUE
                AND source_site = 'carsensor'
            """, model_id)
            return {v['source_id']: v['id'] for v in vehicles}
    
    async def save_vehicle(self, vehicle_data):
        """Save vehicle and track that we found it"""
        # Add to found set
        self.found_vehicle_ids.add(vehicle_data['source_id'])
        
        # Rest of save logic (same as before)
        logger.debug(f"🔄 Attempting to save vehicle: {vehicle_data['source_id']}")
        
        try:
            async with self.db_pool.acquire() as conn:
                # First check if vehicle exists
                existing = await conn.fetchrow("""
                    SELECT id, is_available 
                    FROM vehicles 
                    WHERE source_id = $1 AND source_site = 'carsensor'
                """, vehicle_data['source_id'])
                
                if existing:
                    if not existing['is_available']:
                        # Vehicle was marked sold but is back!
                        await conn.execute("""
                            UPDATE vehicles 
                            SET is_available = TRUE,
                                last_scraped_at = NOW(),
                                notes = COALESCE(notes, '') || ' [RELISTED: ' || NOW()::date::text || ']'
                            WHERE id = $1
                        """, existing['id'])
                        logger.success(f"🔄 RELISTED: Vehicle {vehicle_data['source_id']} is available again!")
                    else:
                        # Just update last seen
                        await conn.execute("""
                            UPDATE vehicles 
                            SET last_scraped_at = NOW()
                            WHERE id = $1
                        """, existing['id'])
                        logger.info(f"⏭️  Vehicle {vehicle_data['source_id']} already exists - updated last seen")
                    return existing['id']
                
                # Insert new vehicle
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
                vehicle_data['price_total_yen'],
                vehicle_data['price_total_yen'],
                vehicle_data['model_year_ad'],
                vehicle_data['mileage_km'],
                vehicle_data.get('location_prefecture', ''),
                False,
                False
                )
                
                logger.success(f"✅ NEW VEHICLE {vehicle_id}: {vehicle_data['source_id']}")
                
                # Save images if any
                if 'images' in vehicle_data and vehicle_data['images']:
                    for i, img_url in enumerate(vehicle_data['images']):
                        try:
                            await conn.execute("""
                                INSERT INTO vehicle_images (
                                    vehicle_id, original_url, filename, is_primary, alt_text
                                ) VALUES ($1, $2, $3, $4, $5)
                            """, vehicle_id, img_url, f"image_{i+1:03d}.jpg", i == 0, f"Vehicle image {i+1}")
                        except Exception as img_err:
                            logger.warning(f"Failed to save image: {img_err}")
                
                return vehicle_id
                
        except Exception as e:
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
                    
                    match = re.search(r'/([A-Z0-9]+)/index\.html', detail_url)
                    if match:
                        vehicle['source_id'] = match.group(1)
                    else:
                        continue
                else:
                    continue
                
                # Get title
                img_elem = div.select_one('.cassetteMain__mainImg img')
                if img_elem and img_elem.get('alt'):
                    japanese_title = img_elem['alt'].strip()
                    english_title = self.translator.translate_text(japanese_title)
                    vehicle['title_description'] = english_title[:500]
                else:
                    vehicle['title_description'] = "Toyota Land Cruiser 70"
                
                # Extract price
                price_elem = div.find('span', class_='cassettePrice__total')
                if price_elem:
                    price_text = price_elem.get_text(strip=True)
                    price_match = re.search(r'([\d,]+)', price_text.replace(',', ''))
                    if price_match:
                        vehicle['price_total_yen'] = int(price_match.group(1))
                    else:
                        vehicle['price_total_yen'] = 0
                else:
                    vehicle['price_total_yen'] = 0
                
                # Extract year and mileage
                detail_items = div.find_all('li', class_='cassetteDetail__detailItem')
                vehicle['model_year_ad'] = 2020
                vehicle['mileage_km'] = 0
                vehicle['location_prefecture'] = ''
                
                for item in detail_items:
                    text = item.get_text(strip=True)
                    year_match = re.search(r'(\d{4})', text)
                    if year_match and 1990 <= int(year_match.group(1)) <= 2024:
                        vehicle['model_year_ad'] = int(year_match.group(1))
                    mileage_match = re.search(r'([\d,\.]+)km', text)
                    if mileage_match:
                        mileage_str = mileage_match.group(1).replace(',', '').replace('.', '')
                        try:
                            vehicle['mileage_km'] = int(float(mileage_str))
                        except:
                            vehicle['mileage_km'] = 0
                
                # Location
                location_elem = div.find('span', class_='cassettePrice__area')
                if location_elem:
                    vehicle['location_prefecture'] = location_elem.get_text(strip=True)
                else:
                    vehicle['location_prefecture'] = '関東'
                
                # Images
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
        
        # Save each vehicle
        for i, vehicle in enumerate(vehicles, 1):
            logger.info(f"🔄 Processing vehicle {i}/{len(vehicles)}: {vehicle['source_id']}")
            
            try:
                await self.save_vehicle(vehicle)
                await asyncio.sleep(0.5)
            except Exception as e:
                logger.error(f"❌ ERROR: Vehicle {i}/{len(vehicles)}: {e}")
        
        return vehicles

    async def get_next_page_url(self, html_content, current_page):
        """Get next page URL"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Look for rel="next" link
        next_link = soup.find('link', rel='next')
        if next_link and next_link.get('href'):
            href = next_link['href']
            if href.startswith('http'):
                next_url = href
            else:
                next_url = "https://www.carsensor.net" + href
            return next_url
        
        # Look for numbered pages
        for link in soup.find_all('a', href=True):
            href = link['href']
            if re.search(r'/index(\d+)\.html', href):
                match = re.search(r'/index(\d+)\.html', href)
                page_num = int(match.group(1))
                if page_num == current_page + 1:
                    return "https://www.carsensor.net" + href
        
        return None

    async def run(self):
        """Main scraping loop with sold vehicle detection"""
        logger.info("🚀 STARTING SMART SCRAPER WITH SOLD DETECTION")
        logger.info("=" * 60)
        
        await self.connect_db()
        
        # Get all active vehicles before scraping
        model_id = 54  # Land Cruiser 70
        active_vehicles_before = await self.get_active_vehicles_for_model(model_id)
        logger.info(f"📊 Currently tracking {len(active_vehicles_before)} active vehicles")
        
        # Clear found set
        self.found_vehicle_ids.clear()
        
        # Scrape all pages
        current_url = BASE_URL
        page_num = 1
        total_vehicles = 0
        
        while current_url and page_num <= 10:
            try:
                vehicles = await self.scrape_page(current_url, page_num)
                total_vehicles += len(vehicles)
                
                # Get next page
                html_content = await self.fetch_page(current_url)
                if html_content:
                    current_url = await self.get_next_page_url(html_content, page_num)
                    if not current_url:
                        logger.info(f"🏁 No more pages after page {page_num}")
                else:
                    break
                
                page_num += 1
                
                if current_url:
                    await asyncio.sleep(3)
                    
            except Exception as e:
                logger.error(f"❌ Error on page {page_num}: {e}")
                break
        
        # Check for sold vehicles
        logger.info("🔍 Checking for sold vehicles...")
        sold_count = 0
        
        for source_id, vehicle_id in active_vehicles_before.items():
            if source_id not in self.found_vehicle_ids:
                await self.mark_vehicle_sold(vehicle_id, source_id)
                sold_count += 1
        
        # Final summary
        logger.success("🎉 SCRAPING COMPLETED!")
        logger.success("=" * 60)
        logger.success(f"📊 FINAL RESULTS:")
        logger.success(f"  🚗 Pages processed: {page_num - 1}")
        logger.success(f"  📄 Total vehicles found: {total_vehicles}")
        logger.success(f"  🚫 Vehicles marked sold: {sold_count}")
        logger.success(f"  ✅ Active vehicles: {len(self.found_vehicle_ids)}")
        logger.success("=" * 60)
        
        if self.db_pool:
            await self.db_pool.close()

async def main():
    scraper = SmartScraper()
    await scraper.run()

if __name__ == "__main__":
    asyncio.run(main())