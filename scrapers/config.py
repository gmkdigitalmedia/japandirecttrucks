"""
Scraper Configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ScraperConfig:
    """Configuration settings for the scraper"""
    
    def __init__(self):
        # Database - check if running in Docker or connecting from host
        if os.getenv('DOCKER_ENV'):
            # Running inside Docker - use container name
            default_db_url = 'postgresql://postgres:postgres123@postgres:5432/gps_trucks_japan'
        else:
            # Running from host - use localhost
            default_db_url = 'postgresql://postgres:postgres123@localhost:5432/gps_trucks_japan'
        
        self.database_url = os.getenv('DATABASE_URL', default_db_url)
        
        # Paths
        self.project_root = Path(__file__).parent.parent
        self.images_dir = self.project_root / 'images' / 'vehicles'
        self.logs_dir = self.project_root / 'logs'
        
        # Ensure directories exist
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Scraping settings
        self.request_delay = float(os.getenv('SCRAPER_REQUEST_DELAY', '2.0'))  # seconds
        self.max_concurrent_requests = int(os.getenv('SCRAPER_MAX_CONCURRENT', '3'))
        self.user_agent_rotation = True
        self.enable_images = True
        self.max_images_per_vehicle = 10
        
        # Site-specific settings
        self.carsensor_base_url = 'https://www.carsensor.net'
        self.goonet_base_url = 'https://www.goo-net.com'
        
        # Browser settings for Playwright
        self.browser_headless = os.getenv('SCRAPER_HEADLESS', 'true').lower() == 'true'
        self.browser_timeout = int(os.getenv('SCRAPER_TIMEOUT', '30000'))  # 30 seconds
        
        # Image processing
        self.image_quality = 85
        self.image_max_width = 1200
        self.image_max_height = 900
        
        # API settings
        self.backend_api_url = os.getenv('BACKEND_API_URL', 'http://localhost:3002')
        
        # Error handling
        self.max_retries = 3
        self.retry_delay = 5.0
        
        # Debug settings
        self.debug_mode = os.getenv('SCRAPER_DEBUG', 'false').lower() == 'true'
        self.save_raw_data = self.debug_mode
        
    def get_headers(self):
        """Get request headers for HTTP requests"""
        return {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0'
        }
        
    def get_playwright_config(self):
        """Get Playwright browser configuration"""
        return {
            'headless': self.browser_headless,
        }