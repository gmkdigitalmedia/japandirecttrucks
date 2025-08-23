"""
Base Scraper Class
Provides common functionality for all site-specific scrapers
"""

import asyncio
import re
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from datetime import datetime
from playwright.async_api import async_playwright, Browser, Page
from loguru import logger
from fake_useragent import UserAgent


class BaseScraper(ABC):
    """Base class for all vehicle scrapers"""
    
    def __init__(self, config):
        self.config = config
        self.browser: Optional[Browser] = None
        self.user_agent = UserAgent()
        self.session_data = {}
        
    async def __aenter__(self):
        """Async context manager entry"""
        await self.start_browser()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close_browser()
    
    async def start_browser(self):
        """Initialize Playwright browser"""
        if not self.browser:
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                **self.config.get_playwright_config()
            )
            logger.info(f"Started browser for {self.__class__.__name__}")
    
    async def close_browser(self):
        """Close Playwright browser"""
        if self.browser:
            await self.browser.close()
            await self.playwright.stop()
            self.browser = None
            logger.info(f"Closed browser for {self.__class__.__name__}")
    
    async def create_page(self) -> Page:
        """Create a new browser page with common settings"""
        if not self.browser:
            await self.start_browser()
        
        page = await self.browser.new_page()
        
        # Set user agent
        if self.config.user_agent_rotation:
            await page.set_extra_http_headers({
                'User-Agent': self.user_agent.random
            })
        
        # Set timeouts
        page.set_default_timeout(self.config.browser_timeout)
        
        return page
    
    @abstractmethod
    async def scrape_vehicles(self, max_pages: int = 10) -> List[Dict]:
        """
        Scrape vehicles from the site
        Must be implemented by subclasses
        """
        pass
    
    @abstractmethod
    def parse_vehicle_details(self, vehicle_element) -> Dict:
        """
        Parse vehicle details from HTML element
        Must be implemented by subclasses
        """
        pass
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text content"""
        if not text:
            return ""
        
        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove common Japanese/English mixed patterns
        text = re.sub(r'[\r\n\t]+', ' ', text)
        
        return text
    
    def extract_price(self, price_text: str) -> Optional[int]:
        """Extract price from text (supports Japanese yen formats)"""
        if not price_text:
            return None
        
        # Remove common Japanese price formatting
        price_text = price_text.replace('万円', '0000').replace('円', '')
        price_text = re.sub(r'[^\d.]', '', price_text)
        
        try:
            # Handle decimal points (e.g., "123.5万円" -> 1235000)
            if '.' in price_text:
                parts = price_text.split('.')
                if len(parts) == 2 and len(parts[1]) <= 1:
                    # This is likely a "万円" format like "123.5"
                    return int(float(price_text) * 10000)
            
            return int(price_text) if price_text else None
        except (ValueError, TypeError):
            return None
    
    def extract_year(self, year_text: str) -> Optional[int]:
        """Extract year from text"""
        if not year_text:
            return None
        
        # Look for 4-digit year
        year_match = re.search(r'(\d{4})', year_text)
        if year_match:
            year = int(year_match.group(1))
            # Reasonable year range for cars
            if 1980 <= year <= datetime.now().year + 1:
                return year
        
        # Handle Japanese era years (Heisei, Reiwa, etc.)
        # This would need more complex logic for accurate conversion
        
        return None
    
    def extract_mileage(self, mileage_text: str) -> Optional[int]:
        """Extract mileage in kilometers"""
        if not mileage_text:
            return None
        
        # Remove common formatting
        mileage_text = mileage_text.replace('万km', '0000').replace('km', '')
        mileage_text = re.sub(r'[^\d.]', '', mileage_text)
        
        try:
            if '.' in mileage_text:
                return int(float(mileage_text) * 10000)
            return int(mileage_text) if mileage_text else None
        except (ValueError, TypeError):
            return None
    
    def extract_engine_displacement(self, engine_text: str) -> Optional[int]:
        """Extract engine displacement in CC"""
        if not engine_text:
            return None
        
        # Look for displacement patterns like "2000cc" or "2.0L"
        cc_match = re.search(r'(\d+(?:\.\d+)?)(?:cc|CC)', engine_text)
        if cc_match:
            return int(float(cc_match.group(1)))
        
        # Handle liter format
        liter_match = re.search(r'(\d+(?:\.\d+)?)L', engine_text)
        if liter_match:
            return int(float(liter_match.group(1)) * 1000)
        
        return None
    
    def parse_boolean_field(self, text: str, positive_indicators: List[str]) -> bool:
        """Parse boolean field based on text content"""
        if not text:
            return False
        
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in positive_indicators)
    
    async def handle_popup(self, page: Page):
        """Handle common popups and overlays"""
        try:
            # Wait a bit for any popups to appear
            await asyncio.sleep(1)
            
            # Common popup selectors
            popup_selectors = [
                '[data-testid="popup-close"]',
                '.popup-close',
                '.modal-close',
                '[aria-label="Close"]',
                'button[data-dismiss="modal"]'
            ]
            
            for selector in popup_selectors:
                try:
                    element = await page.query_selector(selector)
                    if element and await element.is_visible():
                        await element.click()
                        logger.debug(f"Closed popup with selector: {selector}")
                        await asyncio.sleep(0.5)
                        break
                except Exception:
                    continue
                    
        except Exception as e:
            logger.debug(f"Error handling popup: {e}")
    
    async def safe_wait_for_selector(self, page: Page, selector: str, timeout: int = 10000) -> bool:
        """Safely wait for a selector without throwing exceptions"""
        try:
            await page.wait_for_selector(selector, timeout=timeout)
            return True
        except Exception:
            return False
    
    async def scroll_to_load_more(self, page: Page, max_scrolls: int = 3):
        """Scroll page to trigger lazy loading"""
        for i in range(max_scrolls):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await asyncio.sleep(2)
            
            # Check if new content loaded
            await page.wait_for_timeout(1000)
    
    def generate_source_id(self, url: str, site_name: str) -> str:
        """Generate a unique source ID from URL"""
        # Extract ID from URL or use a hash
        url_parts = url.split('/')
        
        # Try to find numeric ID in URL
        for part in reversed(url_parts):
            if part.isdigit():
                return f"{site_name}_{part}"
        
        # If no numeric ID, use hash of URL
        import hashlib
        url_hash = hashlib.md5(url.encode()).hexdigest()[:10]
        return f"{site_name}_{url_hash}"