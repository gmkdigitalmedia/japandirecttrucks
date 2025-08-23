#!/usr/bin/env python3
"""
DEBUG VERSION - Test single vehicle save
"""

import asyncio
import sys
import os
import csv

# Add current directory to Python path
sys.path.insert(0, '/mnt/c/Users/ibm/Documents/GPSTrucksJapan/scrapers')
import random
import aiohttp
from pathlib import Path
from bs4 import BeautifulSoup
from loguru import logger
import asyncpg
import re
from translator import VehicleTranslator
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

# Configuration
DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/108.0.0.0 Safari/537.36"
]

class DatabaseManager:
    def __init__(self, database_url):
        self.database_url = database_url
        self.pool = None

    async def connect(self):
        if not self.pool:
            try:
                self.pool = await asyncpg.create_pool(
                    self.database_url,
                    min_size=1,
                    max_size=2,
                    command_timeout=60
                )
                logger.info("Database connection pool created")
            except Exception as e:
                logger.error(f"Failed to connect to the database: {e}")
                raise

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            logger.info("Database connection pool closed")

    async def get_or_create_manufacturer(self, name):
        """Get manufacturer ID or create if doesn't exist"""
        async with self.pool.acquire() as conn:
            try:
                # Try to find existing manufacturer
                existing = await conn.fetchrow(
                    "SELECT id FROM manufacturers WHERE LOWER(name) = LOWER($1)", name
                )
                
                if existing:
                    logger.info(f"Found existing manufacturer: {name} (ID: {existing['id']})")
                    return existing['id']
                
                # Create new manufacturer
                manufacturer_id = await conn.fetchval(
                    """
                    INSERT INTO manufacturers (name, country, is_active)
                    VALUES ($1, 'Japan', TRUE)
                    RETURNING id
                    """, name
                )
                logger.success(f"✅ Created new manufacturer: {name} (ID: {manufacturer_id})")
                return manufacturer_id
            except Exception as e:
                logger.error(f"Error in get_or_create_manufacturer: {e}")
                raise

    async def get_or_create_model(self, manufacturer_id, model_name):
        """Get model ID or create if doesn't exist"""
        async with self.pool.acquire() as conn:
            try:
                # Try to find existing model
                existing = await conn.fetchrow(
                    "SELECT id FROM models WHERE manufacturer_id = $1 AND LOWER(name) = LOWER($2)",
                    manufacturer_id, model_name
                )
                
                if existing:
                    logger.info(f"Found existing model: {model_name} (ID: {existing['id']})")
                    return existing['id']
                
                # Create new model
                model_id = await conn.fetchval(
                    """
                    INSERT INTO models (manufacturer_id, name, body_type, is_popular)
                    VALUES ($1, $2, 'SUV', TRUE)
                    RETURNING id
                    """, manufacturer_id, model_name
                )
                logger.success(f"✅ Created new model: {model_name} (ID: {model_id})")
                return model_id
            except Exception as e:
                logger.error(f"Error in get_or_create_model: {e}")
                raise

    async def create_vehicle(self, vehicle):
        """Create or update vehicle with detailed error logging"""
        logger.info(f"🚗 ATTEMPTING TO SAVE VEHICLE: {vehicle.get('source_id', 'N/A')}")
        logger.info(f"Vehicle data: {vehicle}")
        
        async with self.pool.acquire() as conn:
            try:
                # First try to find existing vehicle
                logger.info(f"Checking for existing vehicle with source_id: {vehicle['source_id']}")
                existing = await conn.fetchrow(
                    "SELECT id, is_available FROM vehicles WHERE source_id = $1 AND source_site = $2",
                    vehicle["source_id"], vehicle["source_site"]
                )
                
                if existing:
                    existing_id = existing['id']
                    logger.info(f"Found existing vehicle with ID: {existing_id}")
                    
                    # Update existing vehicle
                    logger.info(f"Updating existing vehicle {existing_id}")
                    await conn.execute(
                        """
                        UPDATE vehicles SET
                            source_url = $2,
                            title_description = $3,
                            price_vehicle_yen = $4,
                            price_total_yen = $5,
                            mileage_km = $6,
                            location_prefecture = $7,
                            model_year_ad = $8,
                            last_scraped_at = NOW(),
                            updated_at = NOW()
                        WHERE id = $1
                        """,
                        existing_id, vehicle["source_url"], 
                        vehicle["title_description"], vehicle["price_vehicle_yen"],
                        vehicle["price_total_yen"], vehicle["mileage_km"], 
                        vehicle["location_prefecture"], vehicle["model_year_ad"]
                    )
                    logger.success(f"✅ Updated existing vehicle ID: {existing_id}")
                    return existing_id
                else:
                    # Insert new vehicle
                    logger.info(f"Inserting new vehicle...")
                    logger.info(f"Parameters: source_id={vehicle['source_id']}, manufacturer_id={vehicle['manufacturer_id']}, model_id={vehicle['model_id']}")
                    
                    vehicle_id = await conn.fetchval(
                        """
                        INSERT INTO vehicles (
                            source_id, source_url, source_site, manufacturer_id, model_id, 
                            title_description, price_vehicle_yen, price_total_yen, 
                            model_year_ad, mileage_km, location_prefecture,
                            has_repair_history, has_warranty, is_available, last_scraped_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, NOW()
                        ) RETURNING id
                        """,
                        vehicle["source_id"], vehicle["source_url"], vehicle["source_site"], 
                        vehicle["manufacturer_id"], vehicle["model_id"], vehicle["title_description"], 
                        vehicle["price_vehicle_yen"], vehicle["price_total_yen"], vehicle["model_year_ad"],
                        vehicle["mileage_km"], vehicle["location_prefecture"], 
                        vehicle["has_repair_history"], vehicle["has_warranty"]
                    )
                    logger.success(f"✅ Inserted new vehicle with ID: {vehicle_id}")
                    return vehicle_id
                    
            except Exception as e:
                logger.error(f"❌ ERROR in create_vehicle: {e}")
                logger.error(f"Error type: {type(e)}")
                logger.error(f"Vehicle data: {vehicle}")
                raise

async def test_single_save():
    """Test saving a single vehicle"""
    
    logger.info("🧪 Starting DEBUG test - single vehicle save")
    
    db = DatabaseManager(DATABASE_URL)
    translator = VehicleTranslator()
    
    try:
        await db.connect()
        
        # Get or create manufacturer and model
        logger.info("Getting/creating manufacturer and model...")
        manufacturer_id = await db.get_or_create_manufacturer("Toyota")
        model_id = await db.get_or_create_model(manufacturer_id, "Test Model")
        
        # Create test vehicle
        test_vehicle = {
            "source_id": "TEST123",
            "source_url": "https://example.com/test",
            "source_site": "carsensor",
            "manufacturer_id": manufacturer_id,
            "model_id": model_id,
            "title_description": "Test Toyota Vehicle",
            "price_vehicle_yen": 1000000,
            "price_total_yen": 1000000,
            "model_year_ad": 2020,
            "mileage_km": 50000,
            "location_prefecture": "Tokyo",
            "has_repair_history": False,
            "has_warranty": False
        }
        
        logger.info("Attempting to save test vehicle...")
        vehicle_id = await db.create_vehicle(test_vehicle)
        
        if vehicle_id:
            logger.success(f"✅ SUCCESS! Vehicle saved with ID: {vehicle_id}")
        else:
            logger.error("❌ FAILED! create_vehicle returned None")
            
    except Exception as e:
        logger.error(f"❌ TEST FAILED: {e}", exc_info=True)
    finally:
        await db.disconnect()

if __name__ == "__main__":
    logger.remove()
    
    # Enhanced terminal logging
    logger.add(
        sys.stderr, 
        level="DEBUG",
        format="<green>{time:HH:mm:ss}</green> | <level>{level:8}</level> | <cyan>{message}</cyan>",
        colorize=True
    )
    
    asyncio.run(test_single_save())