"""
Database Manager for Vehicle Scraper
Handles all database operations for the scraping system
"""

import asyncio
import asyncpg
from datetime import datetime
from typing import Dict, List, Optional, Any
from loguru import logger


class DatabaseManager:
    """Manages database connections and operations for the scraper"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.pool = None
    
    async def connect(self):
        """Initialize database connection pool"""
        if not self.pool:
            try:
                self.pool = await asyncpg.create_pool(
                    self.database_url,
                    min_size=2,
                    max_size=10,
                    command_timeout=60
                )
                logger.info("Database connection pool created")
            except Exception as e:
                logger.error(f"Failed to create database pool: {e}")
                raise
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")
    
    async def _execute_query(self, query: str, *args):
        """Execute a query and return results"""
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as conn:
            try:
                return await conn.fetch(query, *args)
            except Exception as e:
                logger.error(f"Database query failed: {e}")
                logger.debug(f"Query: {query}")
                logger.debug(f"Args: {args}")
                raise
    
    async def _execute_single(self, query: str, *args):
        """Execute a query and return single result"""
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as conn:
            try:
                return await conn.fetchrow(query, *args)
            except Exception as e:
                logger.error(f"Database query failed: {e}")
                logger.debug(f"Query: {query}")
                logger.debug(f"Args: {args}")
                raise
    
    async def _execute_command(self, query: str, *args):
        """Execute a command (INSERT, UPDATE, DELETE)"""
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as conn:
            try:
                return await conn.execute(query, *args)
            except Exception as e:
                logger.error(f"Database command failed: {e}")
                logger.debug(f"Query: {query}")
                logger.debug(f"Args: {args}")
                raise
    
    # Manufacturer and Model operations
    async def get_or_create_manufacturer(self, name: str, country: str = 'Japan') -> int:
        """Get manufacturer ID or create if not exists"""
        # Try to find existing manufacturer
        result = await self._execute_single(
            "SELECT id FROM manufacturers WHERE LOWER(name) = LOWER($1)",
            name
        )
        
        if result:
            return result['id']
        
        # Create new manufacturer
        result = await self._execute_single(
            """
            INSERT INTO manufacturers (name, country, is_active)
            VALUES ($1, $2, TRUE)
            RETURNING id
            """,
            name, country
        )
        
        logger.info(f"Created new manufacturer: {name}")
        return result['id']
    
    async def get_or_create_model(self, manufacturer_id: int, name: str, body_type: str = None) -> int:
        """Get model ID or create if not exists"""
        # Try to find existing model
        result = await self._execute_single(
            "SELECT id FROM models WHERE manufacturer_id = $1 AND LOWER(name) = LOWER($2)",
            manufacturer_id, name
        )
        
        if result:
            return result['id']
        
        # Create new model
        result = await self._execute_single(
            """
            INSERT INTO models (manufacturer_id, name, body_type, is_popular)
            VALUES ($1, $2, $3, FALSE)
            RETURNING id
            """,
            manufacturer_id, name, body_type
        )
        
        logger.info(f"Created new model: {name}")
        return result['id']
    
    # Vehicle operations
    async def get_vehicle_by_source_id(self, source_id: str, source_site: str) -> Optional[Dict]:
        """Get vehicle by source ID and site"""
        result = await self._execute_single(
            "SELECT * FROM vehicles WHERE source_id = $1 AND source_site = $2",
            source_id, source_site
        )
        
        return dict(result) if result else None
    
    async def create_vehicle(self, vehicle_data: Dict) -> int:
        """Create a new vehicle record"""
        query = """
        INSERT INTO vehicles (
            source_id, source_url, source_site, manufacturer_id, model_id,
            title_description, grade, body_style, price_vehicle_yen, price_total_yen,
            monthly_payment_yen, model_year_ad, model_year_era, mileage_km, color,
            transmission_details, engine_displacement_cc, fuel_type, drive_type,
            has_repair_history, is_one_owner, has_warranty, is_accident_free,
            warranty_details, maintenance_details, shaken_status, equipment_details,
            dealer_name, location_prefecture, location_city, dealer_phone,
            is_available, is_featured, export_status, last_scraped_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
            $29, $30, $31, $32, $33, $34, $35
        ) RETURNING id
        """
        
        result = await self._execute_single(query, *self._extract_vehicle_values(vehicle_data))
        return result['id']
    
    async def update_vehicle(self, vehicle_id: int, vehicle_data: Dict):
        """Update an existing vehicle record"""
        query = """
        UPDATE vehicles SET
            source_url = $2, title_description = $3, grade = $4, body_style = $5,
            price_vehicle_yen = $6, price_total_yen = $7, monthly_payment_yen = $8,
            mileage_km = $9, color = $10, transmission_details = $11,
            engine_displacement_cc = $12, fuel_type = $13, drive_type = $14,
            has_repair_history = $15, is_one_owner = $16, has_warranty = $17,
            is_accident_free = $18, warranty_details = $19, maintenance_details = $20,
            shaken_status = $21, equipment_details = $22, dealer_name = $23,
            location_prefecture = $24, location_city = $25, dealer_phone = $26,
            is_available = $27, last_scraped_at = $28, updated_at = NOW()
        WHERE id = $1
        """
        
        values = [
            vehicle_id,
            vehicle_data.get('source_url'),
            vehicle_data['title_description'],
            vehicle_data.get('grade'),
            vehicle_data.get('body_style'),
            vehicle_data['price_vehicle_yen'],
            vehicle_data['price_total_yen'],
            vehicle_data.get('monthly_payment_yen'),
            vehicle_data['mileage_km'],
            vehicle_data.get('color'),
            vehicle_data.get('transmission_details'),
            vehicle_data.get('engine_displacement_cc'),
            vehicle_data.get('fuel_type'),
            vehicle_data.get('drive_type'),
            vehicle_data['has_repair_history'],
            vehicle_data.get('is_one_owner', False),
            vehicle_data['has_warranty'],
            vehicle_data.get('is_accident_free', True),
            vehicle_data.get('warranty_details'),
            vehicle_data.get('maintenance_details'),
            vehicle_data.get('shaken_status'),
            vehicle_data.get('equipment_details'),
            vehicle_data.get('dealer_name'),
            vehicle_data.get('location_prefecture'),
            vehicle_data.get('location_city'),
            vehicle_data.get('dealer_phone'),
            vehicle_data.get('is_available', True),
            datetime.now()
        ]
        
        await self._execute_command(query, *values)
    
    def _extract_vehicle_values(self, vehicle_data: Dict) -> List:
        """Extract vehicle values in the correct order for INSERT"""
        return [
            vehicle_data['source_id'],
            vehicle_data.get('source_url'),
            vehicle_data['source_site'],
            vehicle_data.get('manufacturer_id'),
            vehicle_data.get('model_id'),
            vehicle_data['title_description'],
            vehicle_data.get('grade'),
            vehicle_data.get('body_style'),
            vehicle_data['price_vehicle_yen'],
            vehicle_data['price_total_yen'],
            vehicle_data.get('monthly_payment_yen'),
            vehicle_data['model_year_ad'],
            vehicle_data.get('model_year_era'),
            vehicle_data['mileage_km'],
            vehicle_data.get('color'),
            vehicle_data.get('transmission_details'),
            vehicle_data.get('engine_displacement_cc'),
            vehicle_data.get('fuel_type'),
            vehicle_data.get('drive_type'),
            vehicle_data['has_repair_history'],
            vehicle_data.get('is_one_owner', False),
            vehicle_data['has_warranty'],
            vehicle_data.get('is_accident_free', True),
            vehicle_data.get('warranty_details'),
            vehicle_data.get('maintenance_details'),
            vehicle_data.get('shaken_status'),
            vehicle_data.get('equipment_details'),
            vehicle_data.get('dealer_name'),
            vehicle_data.get('location_prefecture'),
            vehicle_data.get('location_city'),
            vehicle_data.get('dealer_phone'),
            vehicle_data.get('is_available', True),
            vehicle_data.get('is_featured', False),
            vehicle_data.get('export_status', 'available'),
            datetime.now()
        ]
    
    # Vehicle Images
    async def create_vehicle_image(self, image_data: Dict) -> int:
        """Create a vehicle image record"""
        query = """
        INSERT INTO vehicle_images (
            vehicle_id, original_url, local_path, filename,
            is_primary, alt_text, file_size, image_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
        """
        
        result = await self._execute_single(
            query,
            image_data['vehicle_id'],
            image_data.get('original_url'),
            image_data['local_path'],
            image_data['filename'],
            image_data.get('is_primary', False),
            image_data.get('alt_text'),
            image_data.get('file_size'),
            image_data.get('image_order', 0)
        )
        
        return result['id']
    
    # Scraper Run Tracking
    async def create_scraper_run(self, scraper_name: str) -> int:
        """Create a new scraper run record"""
        result = await self._execute_single(
            """
            INSERT INTO scraper_runs (scraper_name, status, started_at)
            VALUES ($1, 'running', NOW())
            RETURNING id
            """,
            scraper_name
        )
        
        return result['id']
    
    async def complete_scraper_run(self, run_id: int, status: str, 
                                 vehicles_processed: int = 0,
                                 vehicles_added: int = 0, 
                                 vehicles_updated: int = 0,
                                 error_message: str = None,
                                 log_details: Dict = None):
        """Complete a scraper run with results"""
        await self._execute_command(
            """
            UPDATE scraper_runs SET
                status = $2,
                completed_at = NOW(),
                vehicles_processed = $3,
                vehicles_added = $4,
                vehicles_updated = $5,
                error_message = $6,
                log_details = $7
            WHERE id = $1
            """,
            run_id, status, vehicles_processed, vehicles_added, 
            vehicles_updated, error_message, log_details
        )
    
    # Utility methods    
    async def get_stats(self) -> Dict:
        """Get database statistics"""
        stats_query = """
        SELECT 
            COUNT(*) as total_vehicles,
            COUNT(*) FILTER (WHERE is_available = true) as available_vehicles,
            COUNT(*) FILTER (WHERE is_featured = true) as featured_vehicles,
            AVG(price_total_yen) as avg_price
        FROM vehicles
        """
        
        result = await self._execute_single(stats_query)
        return dict(result) if result else {}
    
    async def cleanup_old_runs(self, days: int = 30):
        """Clean up old scraper run records"""
        await self._execute_command(
            "DELETE FROM scraper_runs WHERE started_at < NOW() - INTERVAL '%s days'",
            days
        )