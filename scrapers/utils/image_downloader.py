"""
Image Downloader
Downloads and processes vehicle images from scraped URLs
"""

import asyncio
import aiohttp
import hashlib
import io
from pathlib import Path
from typing import Tuple, Optional
from PIL import Image
from loguru import logger


class ImageDownloader:
    """Downloads and processes vehicle images"""
    
    def __init__(self, images_dir: Path):
        self.images_dir = Path(images_dir)
        self.images_dir.mkdir(parents=True, exist_ok=True)
        
        # Image processing settings
        self.max_width = 1200
        self.max_height = 900
        self.quality = 85
        
        # Supported formats
        self.supported_formats = {'.jpg', '.jpeg', '.png', '.webp'}
    
    async def download_image(self, url: str, vehicle_id: int, image_index: int) -> Tuple[str, str, int]:
        """
        Download and process an image
        Returns: (local_path, filename, file_size)
        """
        try:
            # Create vehicle-specific directory
            vehicle_dir = self.images_dir / str(vehicle_id)
            vehicle_dir.mkdir(exist_ok=True)
            
            # Generate filename
            url_hash = hashlib.md5(url.encode()).hexdigest()[:10]
            filename = f"image_{image_index}_{url_hash}.jpg"
            local_path = vehicle_dir / filename
            
            # Download image
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=30) as response:
                    if response.status == 200:
                        image_data = await response.read()
                        
                        # Process and save image
                        processed_size = await self._process_image(image_data, local_path)
                        
                        relative_path = f"/images/vehicles/{vehicle_id}/{filename}"
                        
                        logger.debug(f"Downloaded image: {filename} ({processed_size} bytes)")
                        return relative_path, filename, processed_size
                    else:
                        logger.warning(f"Failed to download image: {url} (Status: {response.status})")
                        return None, None, None
                        
        except Exception as e:
            logger.error(f"Error downloading image {url}: {e}")
            return None, None, None
    
    async def _process_image(self, image_data: bytes, output_path: Path) -> int:
        """Process and optimize image"""
        try:
            # Open image with PIL
            with Image.open(io.BytesIO(image_data)) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                if img.width > self.max_width or img.height > self.max_height:
                    img.thumbnail((self.max_width, self.max_height), Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(output_path, 'JPEG', quality=self.quality, optimize=True)
            
            return output_path.stat().st_size
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            # Save original if processing fails
            with open(output_path, 'wb') as f:
                f.write(image_data)
            return len(image_data)