#!/usr/bin/env python3
"""
GPS Trucks Japan - Vehicle Scraper
Main entry point for scraping Japanese vehicle export sites
"""

import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime
from loguru import logger

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from config import ScraperConfig
from database import DatabaseManager
from scrapers.carsensor_scraper import CarSensorScraper
from scrapers.goonet_scraper import GoonetScraper
from utils.image_downloader import ImageDownloader
from utils.data_processor import DataProcessor


class ScraperManager:
    """Main scraper manager that coordinates all scraping activities"""
    
    def __init__(self):
        self.config = ScraperConfig()
        self.db = DatabaseManager(self.config.database_url)
        self.image_downloader = ImageDownloader(self.config.images_dir)
        self.data_processor = DataProcessor()
        
        # Initialize scrapers
        self.scrapers = {
            'carsensor': CarSensorScraper(self.config),
            'goonet': GoonetScraper(self.config)
        }
        
        # Setup logging
        self._setup_logging()
    
    def _setup_logging(self):
        """Configure logging for the scraper"""
        log_dir = Path('logs')
        log_dir.mkdir(exist_ok=True)
        
        # Configure loguru
        logger.remove()  # Remove default handler
        
        # Console logging
        logger.add(
            sys.stdout,
            level="INFO",
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
        )
        
        # File logging
        logger.add(
            log_dir / "scraper_{time:YYYY-MM-DD}.log",
            rotation="1 day",
            retention="30 days",
            level="DEBUG",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
        )
    
    async def scrape_site(self, site_name: str, max_pages: int = 10):
        """Scrape a specific site"""
        if site_name not in self.scrapers:
            logger.error(f"Unknown scraper: {site_name}")
            return
        
        scraper = self.scrapers[site_name]
        
        # Create scraper run record
        run_id = await self.db.create_scraper_run(site_name)
        
        try:
            logger.info(f"Starting {site_name} scraper (max {max_pages} pages)")
            
            # Get vehicle listings
            vehicles_data = await scraper.scrape_vehicles(max_pages)
            
            logger.info(f"Found {len(vehicles_data)} vehicles from {site_name}")
            
            processed_count = 0
            added_count = 0
            updated_count = 0
            
            for vehicle_raw in vehicles_data:
                try:
                    # Process and validate vehicle data
                    vehicle_data = self.data_processor.process_vehicle_data(vehicle_raw, site_name)
                    
                    # Check if vehicle already exists
                    existing_vehicle = await self.db.get_vehicle_by_source_id(
                        vehicle_data['source_id'], 
                        site_name
                    )
                    
                    if existing_vehicle:
                        # Update existing vehicle
                        await self.db.update_vehicle(existing_vehicle['id'], vehicle_data)
                        updated_count += 1
                        logger.debug(f"Updated vehicle: {vehicle_data['title_description'][:50]}...")
                    else:
                        # Add new vehicle
                        vehicle_id = await self.db.create_vehicle(vehicle_data)
                        added_count += 1
                        logger.debug(f"Added new vehicle: {vehicle_data['title_description'][:50]}...")
                        
                        # Download and process images
                        if 'images' in vehicle_raw and vehicle_raw['images']:
                            await self._process_vehicle_images(vehicle_id, vehicle_raw['images'])
                    
                    processed_count += 1
                    
                    # Progress indicator
                    if processed_count % 10 == 0:
                        logger.info(f"Processed {processed_count}/{len(vehicles_data)} vehicles")
                
                except Exception as e:
                    logger.error(f"Error processing vehicle: {e}")
                    continue
            
            # Update scraper run with results
            await self.db.complete_scraper_run(
                run_id, 
                'completed',
                processed_count,
                added_count,
                updated_count
            )
            
            logger.info(f"✅ {site_name} scraping completed:")
            logger.info(f"   Processed: {processed_count}")
            logger.info(f"   Added: {added_count}")
            logger.info(f"   Updated: {updated_count}")
            
        except Exception as e:
            logger.error(f"❌ {site_name} scraping failed: {e}")
            await self.db.complete_scraper_run(run_id, 'failed', error_message=str(e))
            raise
    
    async def _process_vehicle_images(self, vehicle_id: int, image_urls: list):
        """Download and process vehicle images"""
        try:
            for i, img_url in enumerate(image_urls[:10]):  # Limit to 10 images
                try:
                    # Download image
                    local_path, filename, file_size = await self.image_downloader.download_image(
                        img_url, 
                        vehicle_id, 
                        i
                    )
                    
                    # Save image record to database
                    await self.db.create_vehicle_image({
                        'vehicle_id': vehicle_id,
                        'original_url': img_url,
                        'local_path': local_path,
                        'filename': filename,
                        'is_primary': i == 0,
                        'file_size': file_size,
                        'image_order': i
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to download image {img_url}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error processing images for vehicle {vehicle_id}: {e}")
    
    async def scrape_all(self, max_pages: int = 5):
        """Scrape all configured sites"""
        logger.info("🚛 Starting full scraping session")
        
        for site_name in self.scrapers.keys():
            try:
                await self.scrape_site(site_name, max_pages)
                await asyncio.sleep(5)  # Brief pause between sites
            except Exception as e:
                logger.error(f"Failed to scrape {site_name}: {e}")
                continue
        
        logger.info("🏁 Full scraping session completed")


async def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='GPS Trucks Japan Vehicle Scraper')
    parser.add_argument('--site', choices=['carsensor', 'goonet', 'all'], default='all',
                       help='Site to scrape (default: all)')
    parser.add_argument('--pages', type=int, default=5,
                       help='Maximum pages to scrape per site (default: 5)')
    parser.add_argument('--debug', action='store_true',
                       help='Enable debug logging')
    
    args = parser.parse_args()
    
    if args.debug:
        logger.remove()
        logger.add(sys.stdout, level="DEBUG")
    
    scraper_manager = ScraperManager()
    
    try:
        if args.site == 'all':
            await scraper_manager.scrape_all(args.pages)
        else:
            await scraper_manager.scrape_site(args.site, args.pages)
    except KeyboardInterrupt:
        logger.info("Scraping interrupted by user")
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())