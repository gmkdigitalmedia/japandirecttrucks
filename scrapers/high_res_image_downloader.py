"""
High-Resolution Image Downloader for CarSensor
Downloads full-size images by clicking through the image gallery
"""

import asyncio
import aiohttp
import aiofiles
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import re
from loguru import logger
from typing import List, Dict, Optional

class HighResImageDownloader:
    """Downloads high-resolution images from CarSensor vehicle pages"""
    
    def __init__(self, images_dir: str = "../frontend/public/images"):
        self.images_dir = Path(images_dir)
        self.vehicles_dir = self.images_dir / "vehicles"
        self.vehicles_dir.mkdir(parents=True, exist_ok=True)
        
        # Setup Chrome options for headless browsing
        self.chrome_options = Options()
        self.chrome_options.add_argument("--headless")
        self.chrome_options.add_argument("--no-sandbox")
        self.chrome_options.add_argument("--disable-dev-shm-usage")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--window-size=1920,1080")
        self.chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        # For WSL/Linux without display
        self.chrome_options.add_argument("--remote-debugging-port=9222")
        self.chrome_options.add_argument("--disable-extensions")
        
        # Try to find Chrome binary
        chrome_paths = [
            "/usr/bin/google-chrome",
            "/usr/bin/chromium-browser", 
            "/usr/bin/chromium",
            "/snap/bin/chromium"
        ]
        
        chrome_binary = None
        for path in chrome_paths:
            if Path(path).exists():
                chrome_binary = path
                break
        
        if chrome_binary:
            self.chrome_options.binary_location = chrome_binary
        else:
            logger.warning("Chrome not found, high-res image downloading will be disabled")
        
    async def download_vehicle_images(self, vehicle_id: int, carsensor_url: str) -> List[str]:
        """
        Download all high-res images for a vehicle from CarSensor
        Returns list of local file paths
        """
        try:
            # Check if Chrome is available
            if not hasattr(self, 'chrome_options') or not self.chrome_options.binary_location:
                logger.warning(f"Chrome not available, skipping high-res download for vehicle {vehicle_id}")
                return []
            
            logger.info(f"Downloading high-res images for vehicle {vehicle_id} from {carsensor_url}")
            
            # Create vehicle directory
            vehicle_dir = self.vehicles_dir / str(vehicle_id)
            vehicle_dir.mkdir(exist_ok=True)
            
            # Start browser
            try:
                driver = webdriver.Chrome(options=self.chrome_options)
            except Exception as e:
                logger.warning(f"Failed to start Chrome for vehicle {vehicle_id}: {e}")
                return []
            driver.get(carsensor_url)
            
            # Wait for page to load
            await asyncio.sleep(3)
            
            # Find and click on the first image to open gallery
            try:
                # Look for image gallery trigger (usually the first large image)
                first_image = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, ".vehicle-image, .main-image, .photo-main img, .detail-photo img"))
                )
                first_image.click()
                logger.debug("Clicked on main image to open gallery")
                
                # Wait for gallery to open
                await asyncio.sleep(2)
                
            except TimeoutException:
                logger.warning("Could not find clickable main image, trying alternative selectors")
                # Try alternative methods to open image gallery
                try:
                    gallery_button = driver.find_element(By.CSS_SELECTOR, ".photo-gallery-btn, .view-all-photos, .gallery-trigger")
                    gallery_button.click()
                    await asyncio.sleep(2)
                except NoSuchElementException:
                    logger.error("Could not open image gallery")
                    driver.quit()
                    return []
            
            # Collect all high-res image URLs
            high_res_urls = []
            image_index = 0
            
            # Method 1: Try to find all images in the current gallery view
            try:
                # Common selectors for high-res images in CarSensor galleries
                image_elements = driver.find_elements(By.CSS_SELECTOR, 
                    ".gallery-image img, .photo-gallery img, .vehicle-photo img, .detail-image img, .large-image img"
                )
                
                for img_element in image_elements:
                    src = img_element.get_attribute("src")
                    data_src = img_element.get_attribute("data-src")
                    
                    # Get the highest quality URL available
                    image_url = data_src if data_src else src
                    
                    if image_url and self._is_high_res_url(image_url):
                        high_res_urls.append(image_url)
                        logger.debug(f"Found high-res image: {image_url}")
                
            except Exception as e:
                logger.warning(f"Method 1 failed: {e}")
            
            # Method 2: Try navigating through gallery if we didn't get enough images
            if len(high_res_urls) < 3:  # Assume most vehicles have at least 3 photos
                try:
                    # Look for next/previous buttons and navigate through all images
                    next_button_selectors = [
                        ".gallery-next", ".next-image", ".arrow-right", 
                        "[data-action='next']", ".slick-next"
                    ]
                    
                    max_images = 20  # Safety limit
                    current_urls = set()
                    
                    for _ in range(max_images):
                        # Get current image URL
                        try:
                            current_img = driver.find_element(By.CSS_SELECTOR, 
                                ".active-image img, .current-image img, .gallery-main img"
                            )
                            src = current_img.get_attribute("src")
                            data_src = current_img.get_attribute("data-src")
                            current_url = data_src if data_src else src
                            
                            if current_url and self._is_high_res_url(current_url) and current_url not in current_urls:
                                high_res_urls.append(current_url)
                                current_urls.add(current_url)
                                logger.debug(f"Found gallery image: {current_url}")
                        
                        except NoSuchElementException:
                            pass
                        
                        # Try to click next button
                        next_clicked = False
                        for selector in next_button_selectors:
                            try:
                                next_btn = driver.find_element(By.CSS_SELECTOR, selector)
                                if next_btn.is_enabled():
                                    next_btn.click()
                                    await asyncio.sleep(1)
                                    next_clicked = True
                                    break
                            except NoSuchElementException:
                                continue
                        
                        if not next_clicked:
                            break
                
                except Exception as e:
                    logger.warning(f"Gallery navigation failed: {e}")
            
            driver.quit()
            
            # Remove duplicates and clean URLs
            high_res_urls = list(dict.fromkeys(high_res_urls))  # Remove duplicates while preserving order
            high_res_urls = [self._get_max_quality_url(url) for url in high_res_urls]
            
            logger.info(f"Found {len(high_res_urls)} high-res images for vehicle {vehicle_id}")
            
            # Download all images
            downloaded_paths = []
            async with aiohttp.ClientSession() as session:
                for i, url in enumerate(high_res_urls):
                    local_path = await self._download_single_image(session, url, vehicle_dir, i)
                    if local_path:
                        downloaded_paths.append(local_path)
            
            logger.info(f"Successfully downloaded {len(downloaded_paths)} images for vehicle {vehicle_id}")
            return downloaded_paths
            
        except Exception as e:
            logger.error(f"Error downloading images for vehicle {vehicle_id}: {e}")
            return []
    
    def _is_high_res_url(self, url: str) -> bool:
        """Check if URL points to a high-resolution image"""
        if not url:
            return False
        
        # Skip thumbnail indicators
        thumb_indicators = ['thumb', 'small', 'mini', '_s.', '_t.', 'thumbnail']
        if any(indicator in url.lower() for indicator in thumb_indicators):
            return False
        
        # Look for high-res indicators
        high_res_indicators = ['large', 'big', 'full', 'original', '_l.', '_o.', 'detail']
        if any(indicator in url.lower() for indicator in high_res_indicators):
            return True
        
        # Check image dimensions in URL (common pattern)
        size_match = re.search(r'(\d{3,4})x(\d{3,4})', url)
        if size_match:
            width, height = int(size_match.group(1)), int(size_match.group(2))
            return width >= 600 and height >= 400
        
        return True  # Assume it's high-res if no clear indicators
    
    def _get_max_quality_url(self, url: str) -> str:
        """Convert URL to highest quality version"""
        # CarSensor URL patterns for higher quality
        replacements = [
            ('_s.jpg', '_l.jpg'),      # small to large
            ('_m.jpg', '_l.jpg'),      # medium to large
            ('_t.jpg', '_o.jpg'),      # thumbnail to original
            ('thumb/', 'large/'),      # thumbnail path to large path
            ('small/', 'large/'),      # small path to large path
            ('/300/', '/800/'),        # size-based paths
            ('/400/', '/800/'),
            ('/small/', '/large/'),
        ]
        
        max_quality_url = url
        for old, new in replacements:
            max_quality_url = max_quality_url.replace(old, new)
        
        return max_quality_url
    
    async def _download_single_image(self, session: aiohttp.ClientSession, url: str, vehicle_dir: Path, index: int) -> Optional[str]:
        """Download a single image"""
        try:
            filename = f"image_{index:02d}.jpg"
            file_path = vehicle_dir / filename
            
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    async with aiofiles.open(file_path, 'wb') as f:
                        async for chunk in response.content.iter_chunked(8192):
                            await f.write(chunk)
                    
                    relative_path = f"/images/vehicles/{vehicle_dir.name}/{filename}"
                    logger.debug(f"Downloaded: {filename}")
                    return relative_path
                else:
                    logger.warning(f"Failed to download {url}: HTTP {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error downloading {url}: {e}")
            return None


async def main():
    """Test the high-res image downloader"""
    downloader = HighResImageDownloader()
    
    # Test with a sample CarSensor URL
    test_url = "https://www.carsensor.net/usedcar/detail/CU000000000000/index.html"  # Replace with actual URL
    test_vehicle_id = 999
    
    images = await downloader.download_vehicle_images(test_vehicle_id, test_url)
    print(f"Downloaded {len(images)} images: {images}")


if __name__ == "__main__":
    asyncio.run(main())