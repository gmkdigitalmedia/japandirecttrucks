#!/usr/bin/env python3
"""
Check what data is currently in the database
"""

import asyncio
import asyncpg

DATABASE_URL = "postgresql://gp:Megumi12@localhost:5432/gps_trucks_japan"

async def check_database():
    print("🔍 Checking database status...")
    
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Check vehicles count
        vehicle_count = await conn.fetchval("SELECT COUNT(*) FROM vehicles")
        print(f"📊 Total vehicles in database: {vehicle_count}")
        
        # Check images count
        image_count = await conn.fetchval("SELECT COUNT(*) FROM vehicle_images")
        print(f"🖼️  Total images in database: {image_count}")
        
        # Check vehicles with remote URLs
        remote_images = await conn.fetchval("SELECT COUNT(*) FROM vehicle_images WHERE original_url IS NOT NULL")
        print(f"🌐 Images with remote URLs: {remote_images}")
        
        # Check vehicles with local files
        local_images = await conn.fetchval("SELECT COUNT(*) FROM vehicle_images WHERE local_path IS NOT NULL")
        print(f"💾 Images with local files: {local_images}")
        
        # Show sample vehicles
        print(f"\n📋 Sample vehicles:")
        vehicles = await conn.fetch("""
            SELECT v.id, v.title_description, v.source_id, 
                   COUNT(vi.id) as image_count,
                   bool_or(vi.original_url IS NOT NULL) as has_remote_urls
            FROM vehicles v 
            LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id 
            GROUP BY v.id, v.title_description, v.source_id
            ORDER BY v.id DESC 
            LIMIT 5
        """)
        
        for vehicle in vehicles:
            print(f"   {vehicle['id']}: {vehicle['title_description'][:50]}...")
            print(f"      Source ID: {vehicle['source_id']}")
            print(f"      Images: {vehicle['image_count']}, Remote URLs: {vehicle['has_remote_urls']}")
        
        # Show sample image URLs
        print(f"\n🔗 Sample image URLs:")
        images = await conn.fetch("""
            SELECT original_url, local_path, is_primary, vehicle_id
            FROM vehicle_images 
            ORDER BY vehicle_id DESC, is_primary DESC 
            LIMIT 5
        """)
        
        for img in images:
            print(f"   Vehicle {img['vehicle_id']}, Primary: {img['is_primary']}")
            print(f"      Remote URL: {img['original_url'][:70] if img['original_url'] else 'None'}...")
            print(f"      Local Path: {img['local_path'][:50] if img['local_path'] else 'None'}")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Database check failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_database())