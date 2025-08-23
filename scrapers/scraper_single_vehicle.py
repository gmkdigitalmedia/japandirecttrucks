#!/usr/bin/env python3
import asyncio
import aiohttp
import asyncpg
import sys
import logging
import re
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class SingleVehicleScraper:
    def __init__(self, vehicle_url, manufacturer_id, model_id):
        self.vehicle_url = vehicle_url
        self.manufacturer_id = int(manufacturer_id)
        self.model_id = int(model_id)
        self.base_url = "https://www.carsensor.net"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.db_pool = None
        
    async def connect_db(self):
        """Connect to PostgreSQL database"""
        self.db_pool = await asyncpg.create_pool(
            "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan",
            min_size=1,
            max_size=5
        )
        
    async def fetch_page(self, session, url):
        """Fetch a page"""
        try:
            async with session.get(url, headers=self.headers, timeout=30) as response:
                if response.status == 200:
                    return await response.text()
        except Exception as e:
            logging.error(f"Error fetching {url}: {e}")
        return None
        
    def extract_vehicle_data(self, soup):
        """Extract vehicle data from detail page"""
        try:
            data = {
                'url': self.vehicle_url,
                'manufacturer_id': self.manufacturer_id,
                'model_id': self.model_id
            }
            
            # Title
            title_elem = soup.find('h1', class_='cassetteMain__title')
            if title_elem:
                data['title_description'] = title_elem.text.strip()
            else:
                data['title_description'] = 'Vehicle'
            
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
            logging.error(f"Error extracting data: {e}")
            return None
            
    async def insert_vehicle(self, vehicle_data):
        """Insert vehicle into database"""
        async with self.db_pool.acquire() as conn:
            try:
                # Insert vehicle
                vehicle_id = await conn.fetchval("""
                    INSERT INTO vehicles (
                        url, manufacturer_id, model_id, title_description,
                        price_total_yen, year_month, mileage_km,
                        is_available, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())
                    RETURNING id
                """, 
                    vehicle_data['url'],
                    vehicle_data['manufacturer_id'],
                    vehicle_data['model_id'],
                    vehicle_data.get('title_description', 'Vehicle'),
                    vehicle_data.get('price_total_yen'),
                    vehicle_data.get('year_month'),
                    vehicle_data.get('mileage_km')
                )
                
                # Insert images
                if vehicle_data.get('images'):
                    for idx, img_url in enumerate(vehicle_data['images']):
                        await conn.execute("""
                            INSERT INTO vehicle_images (
                                vehicle_id, image_url, image_order, is_primary
                            ) VALUES ($1, $2, $3, $4)
                        """, vehicle_id, img_url, idx, idx == 0)
                
                logging.info(f"Added vehicle {vehicle_id}: {vehicle_data.get('title_description')}")
                return vehicle_id
                
            except Exception as e:
                logging.error(f"Error inserting vehicle: {e}")
                raise
                
    async def scrape_vehicle(self):
        """Scrape single vehicle"""
        async with aiohttp.ClientSession() as session:
            html = await self.fetch_page(session, self.vehicle_url)
            if not html:
                raise Exception("Failed to fetch vehicle page")
                
            soup = BeautifulSoup(html, 'html.parser')
            vehicle_data = self.extract_vehicle_data(soup)
            
            if not vehicle_data:
                raise Exception("Failed to extract vehicle data")
                
            await self.insert_vehicle(vehicle_data)
            
    async def run(self):
        """Main entry point"""
        try:
            await self.connect_db()
            await self.scrape_vehicle()
            sys.exit(0)
        except Exception as e:
            logging.error(f"Scraper failed: {e}")
            sys.exit(1)
        finally:
            if self.db_pool:
                await self.db_pool.close()

def main():
    if len(sys.argv) < 4:
        print("Usage: python scraper_single_vehicle.py <vehicle_url> <manufacturer_id> <model_id>")
        sys.exit(1)
        
    vehicle_url = sys.argv[1]
    manufacturer_id = sys.argv[2]
    model_id = sys.argv[3]
    
    scraper = SingleVehicleScraper(vehicle_url, manufacturer_id, model_id)
    asyncio.run(scraper.run())

if __name__ == "__main__":
    main()