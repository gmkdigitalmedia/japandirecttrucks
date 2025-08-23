"""
Goo-net Scraper
Scrapes vehicle data from goo-net.com
"""

import asyncio
import re
from typing import List, Dict, Optional
from urllib.parse import urljoin
from loguru import logger

from .base_scraper import BaseScraper


class GoonetScraper(BaseScraper):
    """Scraper for Goo-net.com"""
    
    def __init__(self, config):
        super().__init__(config)
        self.base_url = config.goonet_base_url
        self.site_name = 'goonet'
        
        # Search parameters for export-friendly vehicles
        self.search_params = {
            'car_type': '1',  # Used cars
            'body_type': '4,5,6,7',  # SUV, Station Wagon, Van, Pickup
            'year_from': '1990',  # From 1990 onwards
            'sort': 'new',  # Sort by newest listings
        }
    
    async def scrape_vehicles(self, max_pages: int = 10) -> List[Dict]:
        """Scrape vehicles from Goo-net"""
        all_vehicles = []
        
        async with self:
            logger.info(f"Starting Goo-net scrape (max {max_pages} pages)")
            
            # Get search results pages
            for page_num in range(1, max_pages + 1):
                try:
                    logger.info(f"Scraping Goo-net page {page_num}")
                    
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
        
        logger.info(f"Goo-net scraping completed: {len(all_vehicles)} vehicles")
        return all_vehicles
    
    async def _scrape_search_page(self, page_num: int) -> List[Dict]:
        """Scrape a single search results page"""
        page = await self.create_page()
        vehicles = []
        
        try:
            # Build search URL
            search_url = f"{self.base_url}/usedcar/search"
            params = self.search_params.copy()
            params['page'] = str(page_num)
            
            # Navigate to search page
            full_url = f"{search_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
            await page.goto(full_url)
            await self.handle_popup(page)
            
            # Wait for vehicle listings to load
            if not await self.safe_wait_for_selector(page, '.basicSearchResultItemVehicle, .vehicle-item', timeout=15000):
                logger.warning(f"No vehicle listings found on page {page_num}")
                return vehicles
            
            # Get all vehicle listing elements
            vehicle_selectors = [
                '.basicSearchResultItemVehicle',
                '.vehicle-item',
                '.searchResultItem',
                '.itemList_item'
            ]
            
            vehicle_elements = []
            for selector in vehicle_selectors:
                elements = await page.query_selector_all(selector)
                if elements:
                    vehicle_elements = elements
                    break
            
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
            # Get basic info - try multiple selectors
            title_selectors = [
                '.itemTitle a',
                '.vehicle-title a',
                '.searchResultItem_title a',
                'a[class*="title"]'
            ]
            
            title_elem = None
            title = ""
            detail_url = ""
            
            for selector in title_selectors:
                title_elem = await element.query_selector(selector)
                if title_elem:
                    title = await title_elem.inner_text()
                    detail_url = await title_elem.get_attribute('href')
                    break
            
            if not title_elem or not title:
                return None
            
            if detail_url:
                detail_url = urljoin(self.base_url, detail_url)
            
            # Extract source ID from URL
            source_id = self.generate_source_id(detail_url, self.site_name)
            
            # Get price information - try multiple selectors
            price_selectors = [
                '.itemPrice',
                '.vehicle-price',
                '.searchResultItem_price',
                '.price'
            ]
            
            price_text = ""
            for selector in price_selectors:
                price_elem = await element.query_selector(selector)
                if price_elem:
                    price_text = await price_elem.inner_text()
                    break
            
            # Get specifications
            specs_selectors = [
                '.itemDetail',
                '.vehicle-specs',
                '.searchResultItem_detail',
                '.spec-info'
            ]
            
            specs_text = ""
            for selector in specs_selectors:
                specs_elem = await element.query_selector(selector)
                if specs_elem:
                    specs_text = await specs_elem.inner_text()
                    break
            
            # Get location/dealer
            location_selectors = [
                '.itemShop',
                '.dealer-info',
                '.shop-name',
                '.location'
            ]
            
            location_text = ""
            for selector in location_selectors:
                location_elem = await element.query_selector(selector)
                if location_elem:
                    location_text = await location_elem.inner_text()
                    break
            
            # Get images
            image_urls = await self._extract_image_urls(element)
            
            # Parse the extracted data
            vehicle_data = {
                'source_id': source_id,
                'source_url': detail_url,
                'source_site': self.site_name,
                'title_description': self.clean_text(title),
                'price_vehicle_yen': self.extract_price(price_text),
                'price_total_yen': self.extract_price(price_text),
                'model_year_ad': self.extract_year(specs_text),
                'mileage_km': self.extract_mileage(specs_text),
                'has_repair_history': False,
                'has_warranty': False,
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
            # Look for images with various selectors
            img_selectors = [
                'img',
                '.itemPhoto img',
                '.vehicle-image img',
                '.photo img'
            ]
            
            for selector in img_selectors:
                img_elements = await element.query_selector_all(selector)
                for img in img_elements:
                    src = await img.get_attribute('src')
                    data_src = await img.get_attribute('data-src')
                    
                    # Use data-src if available (lazy loading)
                    url = data_src or src
                    if url and url.startswith('http') and url not in image_urls:
                        image_urls.append(url)
                
                if image_urls:
                    break  # Found images, no need to try other selectors
                    
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
            img_selectors = [
                '.photoGallery img',
                '.vehicle-photos img',
                '.detail-images img',
                '.gallery img'
            ]
            
            for selector in img_selectors:
                img_elements = await page.query_selector_all(selector)
                for img in img_elements:
                    src = await img.get_attribute('src')
                    data_src = await img.get_attribute('data-src')
                    url = data_src or src
                    if url and url.startswith('http'):
                        image_urls.append(url)
                if image_urls:
                    break
            
            if image_urls:
                details['images'] = image_urls
            
            # Get detailed specs from table
            spec_selectors = [
                '.detailTable tr',
                '.spec-table tr',
                '.vehicle-details tr',
                '.info-table tr'
            ]
            
            spec_rows = []
            for selector in spec_selectors:
                spec_rows = await page.query_selector_all(selector)
                if spec_rows:
                    break
            
            for row in spec_rows:
                try:
                    header = await row.query_selector('th, .label, .spec-label')
                    data = await row.query_selector('td, .value, .spec-value')
                    
                    if header and data:
                        header_text = await header.inner_text()
                        data_text = await data.inner_text()
                        
                        # Parse specific fields
                        if any(keyword in header_text for keyword in ['年式', '年型', 'Year']):
                            year = self.extract_year(data_text)
                            if year:
                                details['model_year_ad'] = year
                        
                        elif any(keyword in header_text for keyword in ['走行距離', 'Mileage', 'キロ']):
                            mileage = self.extract_mileage(data_text)
                            if mileage is not None:
                                details['mileage_km'] = mileage
                        
                        elif any(keyword in header_text for keyword in ['カラー', '色', 'Color']):
                            details['color'] = self.clean_text(data_text)
                        
                        elif any(keyword in header_text for keyword in ['排気量', 'Engine', 'CC']):
                            displacement = self.extract_engine_displacement(data_text)
                            if displacement:
                                details['engine_displacement_cc'] = displacement
                        
                        elif any(keyword in header_text for keyword in ['ミッション', '変速機', 'Transmission']):
                            details['transmission_details'] = self.clean_text(data_text)
                        
                        elif any(keyword in header_text for keyword in ['燃料', 'Fuel']):
                            details['fuel_type'] = self.clean_text(data_text)
                        
                        elif any(keyword in header_text for keyword in ['駆動', 'Drive']):
                            details['drive_type'] = self.clean_text(data_text)
                        
                        elif any(keyword in header_text for keyword in ['修復歴', 'Repair', 'Accident']):
                            details['has_repair_history'] = self.parse_boolean_field(
                                data_text, ['あり', 'yes', '有', 'あった']
                            )
                        
                        elif any(keyword in header_text for keyword in ['保証', 'Warranty']):
                            details['has_warranty'] = self.parse_boolean_field(
                                data_text, ['あり', 'yes', '有', '付']
                            )
                            details['warranty_details'] = self.clean_text(data_text)
                
                except Exception as e:
                    logger.debug(f"Error parsing spec row: {e}")
                    continue
            
            # Get dealer information
            dealer_selectors = [
                '.shopInfo .name',
                '.dealer-name',
                '.shop-name',
                '.store-name'
            ]
            
            for selector in dealer_selectors:
                dealer_elem = await page.query_selector(selector)
                if dealer_elem:
                    details['dealer_name'] = self.clean_text(await dealer_elem.inner_text())
                    break
            
            # Get location
            location_selectors = [
                '.shopInfo .address',
                '.dealer-address',
                '.shop-address',
                '.location'
            ]
            
            for selector in location_selectors:
                location_elem = await page.query_selector(selector)
                if location_elem:
                    location_text = await location_elem.inner_text()
                    # Try to extract prefecture
                    prefecture_match = re.search(r'([^県]+県|[^府]+府|[^都]+都|[^道]+道)', location_text)
                    if prefecture_match:
                        details['location_prefecture'] = prefecture_match.group(1)
                    break
            
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