"""
CarSensor Scraper
Scrapes vehicle data from carsensor.net
"""

import asyncio
import re
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse, parse_qs
from loguru import logger

from .base_scraper import BaseScraper


class CarSensorScraper(BaseScraper):
    """Scraper for CarSensor.net"""
    
    def __init__(self, config):
        super().__init__(config)
        self.base_url = config.carsensor_base_url
        self.site_name = 'carsensor'
        
        # Search parameters for Toyota Land Cruisers
        self.search_params = {
            'CARC': 'TO_S149',   # Toyota Land Cruiser
            'AR': '1*7',         # All regions  
            'SKIND': '1',        # Search kind
        }
    
    async def scrape_vehicles(self, max_pages: int = 10) -> List[Dict]:
        """Scrape vehicles from CarSensor"""
        all_vehicles = []
        
        async with self:
            logger.info(f"Starting CarSensor scrape (max {max_pages} pages)")
            
            # Get search results pages
            for page_num in range(1, max_pages + 1):
                try:
                    logger.info(f"Scraping CarSensor page {page_num}")
                    
                    vehicles = await self._scrape_search_page(page_num)
                    if not vehicles:
                        logger.info("No more vehicles found, stopping")
                        break
                    
                    all_vehicles.extend(vehicles)
                    logger.info(f"Found {len(vehicles)} vehicles on page {page_num}")
                    
                    # Delay between pages
                    await asyncio.sleep(self.config.request_delay)
                    
                except Exception as e:
                    logger.error(f"Error scraping page {page_num}: {e}")
                    continue
        
        logger.info(f"CarSensor scraping completed: {len(all_vehicles)} vehicles")
        return all_vehicles
    
    async def _scrape_search_page(self, page_num: int) -> List[Dict]:
        """Scrape a single search results page"""
        page = await self.create_page()
        vehicles = []
        
        try:
            # Build search URL
            search_url = f"{self.base_url}/usedcar/search.php"
            params = self.search_params.copy()
            params['PAGE'] = str(page_num)
            
            # Navigate to search page
            await page.goto(f"{search_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}")
            await self.handle_popup(page)
            
            # Wait for vehicle listings to load
            if not await self.safe_wait_for_selector(page, '.cassetteItem', timeout=15000):
                logger.warning(f"No vehicle listings found on page {page_num}")
                return vehicles
            
            # Get all vehicle listing elements
            vehicle_elements = await page.query_selector_all('.cassetteItem')
            logger.debug(f"Found {len(vehicle_elements)} vehicle elements")
            
            for element in vehicle_elements:
                try:
                    vehicle_data = await self._parse_vehicle_listing(element, page)
                    if vehicle_data:
                        vehicles.append(vehicle_data)
                except Exception as e:
                    logger.error(f"Error parsing vehicle element: {e}")
                    continue
            
        except Exception as e:
            logger.error(f"Error scraping search page {page_num}: {e}")
        finally:
            await page.close()
        
        return vehicles
    
    async def _parse_vehicle_listing(self, element, page) -> Optional[Dict]:
        """Parse a single vehicle listing element"""
        try:
            # Get basic info
            title_elem = await element.query_selector('.cassetteItem_title a')
            if not title_elem:
                return None
            
            title = await title_elem.inner_text()
            detail_url = await title_elem.get_attribute('href')
            
            if detail_url:
                detail_url = urljoin(self.base_url, detail_url)
            
            # Extract source ID from URL
            source_id = self.generate_source_id(detail_url, self.site_name)
            
            # Get price information
            price_elem = await element.query_selector('.cassetteItem_price')
            price_text = await price_elem.inner_text() if price_elem else ""
            
            # Get year and mileage
            specs_elem = await element.query_selector('.cassetteItem_detail')
            specs_text = await specs_elem.inner_text() if specs_elem else ""
            
            # Get location
            location_elem = await element.query_selector('.cassetteItem_dealer')
            location_text = await location_elem.inner_text() if location_elem else ""
            
            # Get images
            image_urls = await self._extract_image_urls(element)
            
            # Parse the extracted data
            vehicle_data = {
                'source_id': source_id,
                'source_url': detail_url,
                'source_site': self.site_name,
                'title_description': self.clean_text(title),
                'price_vehicle_yen': self.extract_price(price_text),
                'price_total_yen': self.extract_price(price_text),  # Will be updated if different
                'model_year_ad': self.extract_year(specs_text),
                'mileage_km': self.extract_mileage(specs_text),
                'has_repair_history': False,  # Default, might be updated from detail page
                'has_warranty': False,  # Default, might be updated from detail page
                'is_available': True,
                'images': image_urls,
                'raw_specs': specs_text,
                'raw_location': location_text,
                'raw_price': price_text
            }
            
            # Try to get more detailed information
            if detail_url and len(vehicle_data.get('images', [])) < 3:
                detailed_data = await self._scrape_vehicle_details(detail_url)
                if detailed_data:
                    vehicle_data.update(detailed_data)
            
            return vehicle_data
            
        except Exception as e:
            logger.error(f"Error parsing vehicle listing: {e}")
            return None
    
    async def _extract_image_urls(self, element) -> List[str]:
        """Extract image URLs from vehicle listing"""
        image_urls = []
        
        try:
            # Look for main image
            img_elem = await element.query_selector('img')
            if img_elem:
                src = await img_elem.get_attribute('src')
                if src:
                    image_urls.append(urljoin(self.base_url, src))
            
            # Look for additional images in gallery
            gallery_imgs = await element.query_selector_all('.cassetteItem_img img')
            for img in gallery_imgs:
                src = await img.get_attribute('src')
                if src and src not in image_urls:
                    image_urls.append(urljoin(self.base_url, src))
                    
        except Exception as e:
            logger.debug(f"Error extracting image URLs: {e}")
        
        return image_urls
    
    async def _scrape_vehicle_details(self, detail_url: str) -> Optional[Dict]:
        """Scrape detailed vehicle information from detail page"""
        page = await self.create_page()
        
        try:
            await page.goto(detail_url, wait_until='networkidle')
            await self.handle_popup(page)
            
            details = {}
            
            # Get more images
            image_urls = []
            img_elements = await page.query_selector_all('.photoGallery img, .vehiclePhoto img')
            for img in img_elements:
                src = await img.get_attribute('src')
                if src:
                    image_urls.append(urljoin(self.base_url, src))
            
            if image_urls:
                details['images'] = image_urls
            
            # Get detailed specs
            spec_elements = await page.query_selector_all('.detailTableMod tr')
            for row in spec_elements:
                try:
                    header = await row.query_selector('th')
                    data = await row.query_selector('td')
                    
                    if header and data:
                        header_text = await header.inner_text()
                        data_text = await data.inner_text()
                        
                        # Parse specific fields
                        if '年式' in header_text:
                            year = self.extract_year(data_text)
                            if year:
                                details['model_year_ad'] = year
                        
                        elif '走行距離' in header_text:
                            mileage = self.extract_mileage(data_text)
                            if mileage is not None:
                                details['mileage_km'] = mileage
                        
                        elif 'カラー' in header_text or '色' in header_text:
                            details['color'] = self.clean_text(data_text)
                        
                        elif '排気量' in header_text:
                            displacement = self.extract_engine_displacement(data_text)
                            if displacement:
                                details['engine_displacement_cc'] = displacement
                        
                        elif 'ミッション' in header_text or '変速機' in header_text:
                            details['transmission_details'] = self.clean_text(data_text)
                        
                        elif '燃料' in header_text:
                            details['fuel_type'] = self.clean_text(data_text)
                        
                        elif '駆動' in header_text:
                            details['drive_type'] = self.clean_text(data_text)
                        
                        elif '修復歴' in header_text:
                            details['has_repair_history'] = self.parse_boolean_field(
                                data_text, ['あり', 'yes', '有']
                            )
                        
                        elif '保証' in header_text:
                            details['has_warranty'] = self.parse_boolean_field(
                                data_text, ['あり', 'yes', '有', '付']
                            )
                            details['warranty_details'] = self.clean_text(data_text)
                
                except Exception as e:
                    logger.debug(f"Error parsing spec row: {e}")
                    continue
            
            # Get dealer information
            dealer_elem = await page.query_selector('.shopInfo_name')
            if dealer_elem:
                details['dealer_name'] = self.clean_text(await dealer_elem.inner_text())
            
            location_elem = await page.query_selector('.shopInfo_address')
            if location_elem:
                location_text = await location_elem.inner_text()
                # Try to extract prefecture
                prefecture_match = re.search(r'([^県]+県|[^府]+府|[^都]+都|[^道]+道)', location_text)
                if prefecture_match:
                    details['location_prefecture'] = prefecture_match.group(1)
            
            return details
            
        except Exception as e:
            logger.error(f"Error scraping vehicle details from {detail_url}: {e}")
            return None
        finally:
            await page.close()
    
    def parse_vehicle_details(self, vehicle_element) -> Dict:
        """Parse vehicle details from HTML element (abstract method implementation)"""
        # This is handled by _parse_vehicle_listing in this implementation
        return {}